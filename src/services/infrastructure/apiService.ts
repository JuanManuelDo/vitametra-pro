import { 
    doc, getDoc, updateDoc, collection, query, where, 
    onSnapshot, serverTimestamp, orderBy, 
    limit, Unsubscribe, setDoc, addDoc, deleteDoc 
} from "firebase/firestore";
import { 
    signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth, db } from "./firebaseService"; 
// Asegúrate de que la ruta a types sea correcta según tu estructura
import { type UserData, type HistoryEntry, type Hba1cEntry } from '../types';

export const apiService = {
    // --- AUTENTICACIÓN ---
    async login(email: string, pass: string) {
        return await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), pass);
    },

    async register(email: string, pass: string, name: string = "Usuario") {
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), pass);
        const uid = userCredential.user.uid;
        
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
                patterns: { highGlucoseTriggers: [], effectiveCorrections: [], notableEvents: [] },
                preferences: { dietaryRestrictions: [], favoriteSafeFoods: [] },
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

    // --- PAGOS Y SESIONES ---
    async createStripeCheckoutSession(priceId: string) {
        console.log("Iniciando pasarela para:", priceId);
        return { success: true, url: '#' };
    },

    // --- PERFIL ---
    async getUserProfile(uid: string): Promise<UserData | null> {
        const userRef = doc(db, "users", uid);
        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as UserData;
            return null;
        } catch (error) {
            return null;
        }
    },

    async updateUser(userData: Partial<UserData> & { id: string }) {
        const userRef = doc(db, "users", userData.id);
        const { id, ...dataToUpdate } = userData; 
        await updateDoc(userRef, { 
            ...dataToUpdate, 
            updatedAt: new Date().toISOString() 
        });
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

    // --- HISTORIAL Y APRENDIZAJE ---
    async addHistoryEntry(userId: string, data: Partial<HistoryEntry>) {
        const historyRef = collection(db, "ingestas");
        return await addDoc(historyRef, {
            ...data,
            userId,
            createdAt: serverTimestamp(),
            date: data.date || new Date().toISOString()
        });
    },

    /**
     * CIERRE DE BUCLE (IP VITAMETRA): 
     * Actualiza un registro de comida con los resultados post-prandiales
     * para que la IA pueda aprender del éxito del bolo.
     */
    async closeLearningLoop(entryId: string, postGlucose: number, successScore: number, notes?: string) {
        const entryRef = doc(db, "ingestas", entryId);
        return await updateDoc(entryRef, {
            postPrandialGlucose: postGlucose,
            successScore: successScore,
            closureNotes: notes || "",
            updatedAt: serverTimestamp()
        });
    },

    async deleteHistoryEntry(id: string) {
        await deleteDoc(doc(db, "ingestas", id));
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
        }, (error) => console.error(error));
    },

    subscribeToHba1cHistory(userId: string, callback: (data: Hba1cEntry[]) => void): Unsubscribe {
        const q = query(
            collection(db, "hba1c_logs"), 
            where("userId", "==", userId), 
            orderBy("date", "desc"), 
            limit(20)
        );
        return onSnapshot(q, (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        }, (error) => console.error(error));
    },

    async trackIAUsage(userId: string, currentUsage: number, dateStr: string) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { 
            daily_ia_usage: currentUsage + 1, 
            last_ia_usage_date: dateStr 
        });
    }
};