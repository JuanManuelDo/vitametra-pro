import { 
    doc, getDoc, updateDoc, collection, query, where, 
    onSnapshot, serverTimestamp, orderBy, 
    limit, Unsubscribe, setDoc, addDoc 
} from "firebase/firestore";
import { 
    signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, db } from "./firebaseService"; 
import { type UserData, type HistoryEntry } from '../types';

// CORRECCIÓN CLAVE: Agregamos las llaves { } porque es un export nombrado en geminiService
import { analyzeFoodText } from './geminiService';

export const apiService = {
    // --- AUTENTICACIÓN ---
    async login(email: string, pass: string) {
        return await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), pass);
    },

    async register(email: string, pass: string, name: string = "Usuario") {
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), pass);
        const uid = userCredential.user.uid;
        
        // Objeto alineado perfectamente con tu nuevo types.ts
        const initialConfig: UserData = {
            id: uid,
            firstName: name,
            lastName: "",
            email: email.toLowerCase().trim(),
            role: 'USER',
            subscription_tier: 'BASE',
            ia_credits: 3,
            daily_ia_usage: 0,
            streak: 0, 
            createdAt: new Date().toISOString(),
            insulinRatioSchedule: [
                { startTime: "08:00", ratio: 15 },
                { startTime: "14:00", ratio: 15 },
                { startTime: "21:00", ratio: 15 }
            ],
            clinicalConfig: {
                diabetesType: 'Type 1',
                insulinSensitivityFactor: 50,
                targetGlucose: 100
            },
            aiMemory: "Iniciando fase de observación metabólica.", 
            memory: {
                patterns: {
                    highGlucoseTriggers: [],
                    effectiveCorrections: [],
                    notableEvents: []
                },
                preferences: {
                    dietaryRestrictions: [],
                    favoriteSafeFoods: []
                },
                aiNotes: "Sincronizado con el Bio-Core."
            },
            glucoseUnitPreference: 'mg/dL'
        };

        await setDoc(doc(db, "users", uid), initialConfig, { merge: true });
        return userCredential;
    },

    async logout() {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    },

    // --- SINCRONIZACIÓN ---
    async getUserProfile(uid: string): Promise<UserData | null> {
        const userRef = doc(db, "users", uid);
        try {
            let docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                // Delay para latencia de Firebase
                await new Promise(resolve => setTimeout(resolve, 1200));
                docSnap = await getDoc(userRef);
            }
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as UserData;
            }
            return null;
        } catch (error) {
            console.error("Error en getUserProfile:", error);
            return null;
        }
    },

    // --- ACTUALIZACIÓN DE PERFIL ---
    async updateUser(userData: Partial<UserData> & { id: string }) {
        try {
            const userRef = doc(db, "users", userData.id);
            const { id, ...dataToUpdate } = userData; 
            
            await updateDoc(userRef, {
                ...dataToUpdate,
                updatedAt: new Date().toISOString()
            });
            console.log("✅ Sincronización exitosa con Firebase.");
        } catch (error) {
            console.error("Error en updateUser:", error);
            throw error;
        }
    },

    // --- NÚCLEO IA ---
    async checkAnalysisLimit(userId: string) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() as UserData;
        
        if (userData?.subscription_tier !== 'PRO' && (userData?.daily_ia_usage || 0) >= 3) {
            throw new Error("Has agotado tus análisis diarios gratuitos.");
        }
    },

    async analyzeFoodVision(input: string, userId: string) {
        await this.checkAnalysisLimit(userId);
        
        // Ejecución del análisis mediante Gemini
        const result = await analyzeFoodText(input);
        
        // Registro de uso
        const userSnap = await getDoc(doc(db, "users", userId));
        const currentUsage = (userSnap.data() as UserData)?.daily_ia_usage || 0;
        const today = new Date().toISOString().split('T')[0];
        
        await this.trackIAUsage(userId, currentUsage, today);
        return result;
    },

    // --- HISTORIAL ---
    async saveHistoryEntry(data: Partial<HistoryEntry>) {
        try {
            const historyRef = collection(db, "ingestas");
            const entryData = {
                ...data,
                createdAt: serverTimestamp(),
                date: data.date || new Date().toISOString()
            };
            const docRef = await addDoc(historyRef, entryData);
            return docRef.id;
        } catch (error) {
            console.error("Error al guardar en historial:", error);
            throw error;
        }
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
        }, (error) => {
            console.error("Error en tiempo real (Historial):", error);
        });
    },

    async trackIAUsage(userId: string, currentUsage: number, dateStr: string) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            daily_ia_usage: currentUsage + 1,
            last_ia_usage_date: dateStr
        });
    }
};