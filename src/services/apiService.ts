import { 
    doc, getDoc, updateDoc, collection, query, where, 
    onSnapshot, serverTimestamp, increment, orderBy, 
    limit, getDocs, Unsubscribe, setDoc, addDoc 
} from "firebase/firestore";
import { 
    signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, db } from "./firebaseService"; 
import { type UserData, type HistoryEntry, type InsulinRatioSegment } from '../types';
import { analyzeFoodText } from './geminiService';

export const apiService = {
    // --- AUTENTICACIÓN ---
    async login(email: string, pass: string) {
        return await signInWithEmailAndPassword(auth, email, pass);
    },

    async register(email: string, pass: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const uid = userCredential.user.uid;
        
        const initialConfig: Partial<UserData> = {
            id: uid,
            email: email.toLowerCase(),
            subscription_tier: 'BASE',
            ia_credits: 3,
            daily_ia_usage: 0,
            createdAt: new Date().toISOString(),
            insulinRatioSchedule: [
                { startTime: "06:00", ratio: 15 },
                { startTime: "13:00", ratio: 15 },
                { startTime: "20:00", ratio: 15 }
            ]
        };

        await setDoc(doc(db, "users", uid), initialConfig);
        return userCredential;
    },

    async logout() {
        await signOut(auth);
        window.location.href = '/';
    },

    // --- NÚCLEO IA Y ANÁLISIS ---
    async analyzeFoodVision(imageB64: string, userId: string) {
        const userSnap = await getDoc(doc(db, "users", userId));
        const userData = userSnap.data() as UserData;
        
        const today = new Date().toISOString().split('T')[0];
        if (userData?.subscription_tier !== 'PRO' && (userData?.daily_ia_usage || 0) >= 3) {
            throw new Error("LIMIT_REACHED");
        }

        try {
            const result = await analyzeFoodText(imageB64);
            await this.trackIAUsage(userId, userData?.daily_ia_usage || 0, today);
            return result;
        } catch (error) {
            console.error("Error en Vision Agent:", error);
            throw error;
        }
    },

    // --- GESTIÓN DE DATOS METABÓLICOS ---
    
    /**
     * FUNCIÓN CRÍTICA: Actualiza cualquier entrada del historial.
     * Esto soluciona el error de GlucoseCalibrationCard.tsx
     */
    async updateHistoryEntry(entryId: string, updates: Partial<HistoryEntry>) {
        try {
            const docRef = doc(db, "ingestas", entryId);
            
            // Limpieza de datos para Firestore (evita undefined)
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([_, v]) => v !== undefined)
            );

            await updateDoc(docRef, {
                ...cleanUpdates,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error("Error al actualizar entrada:", error);
            throw error;
        }
    },

    async saveHistoryEntry(userId: string, data: Partial<HistoryEntry>) {
        try {
            const userSnap = await getDoc(doc(db, "users", userId));
            const userData = userSnap.data() as UserData;
            
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const activeRatio = this._getRatioForTime(
                currentTime, 
                userData?.insulinRatioSchedule || []
            );

            const historyRef = collection(db, "ingestas");
            
            const entryData = {
                userId,
                ratioUsed: activeRatio,
                isCalibrated: false,
                date: new Date().toISOString(),
                ...data,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(historyRef, entryData);
            return docRef.id;
        } catch (error) {
            console.error("Error al guardar ingesta:", error);
            throw error;
        }
    },

    async calibrateEntry(entryId: string, glucosePost2h: number) {
        try {
            const docRef = doc(db, "ingestas", entryId);
            const snap = await getDoc(docRef);
            if (!snap.exists()) throw new Error("Entry not found");
            
            const entry = snap.data() as HistoryEntry;
            const glucoseImpact = entry.bloodGlucoseValue 
                ? glucosePost2h - entry.bloodGlucoseValue 
                : 0;

            await updateDoc(docRef, {
                glucosePost2h,
                glucoseImpact,
                isCalibrated: true,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error en calibración:", error);
            throw error;
        }
    },

    // --- UTILIDADES ---
    _getRatioForTime(time: string, schedule: InsulinRatioSegment[]): number {
        if (!schedule || schedule.length === 0) return 15;
        const sorted = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
        let activeRatio = sorted[sorted.length - 1].ratio;
        
        for (const segment of sorted) {
            if (time >= segment.startTime) {
                activeRatio = segment.ratio;
            }
        }
        return activeRatio;
    },

    async trackIAUsage(userId: string, currentUsage: number, dateStr: string) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            daily_ia_usage: currentUsage + 1,
            last_ia_usage_date: dateStr,
            updatedAt: serverTimestamp()
        });
    },

    // --- SUBSCRIPCIONES REAL-TIME ---
    subscribeToUserProfile(uid: string, callback: (user: UserData | null) => void): Unsubscribe {
        return onSnapshot(doc(db, "users", uid), (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() } as UserData);
            } else {
                callback(null);
            }
        });
    },

    subscribeToHistory(userId: string, callback: (data: HistoryEntry[]) => void): Unsubscribe {
        const q = query(
            collection(db, "ingestas"), 
            where("userId", "==", userId), 
            orderBy("createdAt", "desc"),
            limit(50)
        );
        return onSnapshot(q, (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        });
    },

    // --- PAGOS ---
    async processMPTransaction(formData: any, planId: string, uid: string) {
        const response = await fetch('https://us-central1-gen-lang-client-0587114750.cloudfunctions.net/processPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, planId, userId: uid })
        });
        return await response.json();
    }
};