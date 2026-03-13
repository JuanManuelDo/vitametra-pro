import { 
    doc, getDoc, updateDoc, collection, query, where, 
    onSnapshot, serverTimestamp, orderBy, 
    limit, Unsubscribe, setDoc, addDoc, deleteDoc 
} from "firebase/firestore";
import { 
    signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from "firebase/auth";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db } from "./firebaseService"; 
import { type UserData, type HistoryEntry, type Hba1cEntry } from '../../types';

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
            glucoseUnitPreference: 'mg/dL',
            fcmToken: "" // Inicializamos el campo para notificaciones
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

    // --- PERFIL Y CONFIGURACIÓN ---
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

    /**
     * Actualiza el perfil de usuario. 
     * Soporta actualizaciones parciales (incluyendo fcmToken para notificaciones).
     */
    async updateUserProfile(userId: string, data: Partial<UserData>) {
        const userRef = doc(db, "users", userId);
        return await updateDoc(userRef, { 
            ...data, 
            updatedAt: serverTimestamp() 
        });
    },

    // Alias para compatibilidad con código existente
    async updateUser(userData: Partial<UserData> & { id: string }) {
        const { id, ...dataToUpdate } = userData; 
        return this.updateUserProfile(id, dataToUpdate);
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

    // --- HISTORIAL Y APRENDIZAJE (ARQUITECTURA MENSUAL PRO) ---
    async addHistoryEntry(userId: string, data: Partial<HistoryEntry>) {
        const functions = getFunctions();
        const saveClinicalData = httpsCallable(functions, 'saveClinicalData');
        
        // Zod backend schema takes over validation. Dates are unified here.
        const payload = {
            ...data,
            date: data.date || new Date().toISOString()
        };

        const result = await saveClinicalData(payload);
        return result.data as { success: boolean, id: string, message: string };
    },

    // --- SEGURIDAD DE ASSETS ---
    async getSignedImageUrl(bucketPath: string): Promise<string> {
        const functions = getFunctions();
        const generateSecureSignedUrl = httpsCallable(functions, 'generateSecureSignedUrl');
        
        const result = await generateSecureSignedUrl({ bucketPath });
        const data = result.data as { secureUrl: string };
        return data.secureUrl;
    },

    /**
     * Identifica los alimentos más frecuentes analizando el historial reciente.
     */
    async identifyFrequentFoods(userId: string): Promise<{ food: string, count: number }[]> {
        const monthId = new Date().toISOString().slice(0, 7);
        const logsRef = collection(db, "users", userId, "history", monthId, "logs");
        const q = query(logsRef, orderBy("createdAt", "desc"), limit(100));
        const snapshot = await getDoc(doc(logsRef, "dummy")); // Solo para obtener la referencia o usar getDocs
        
        // Versión simplificada para el agente:
        const entries = await this.getHistoryForMonth(userId, monthId);
        const foodMap: Record<string, number> = {};
        
        entries.forEach(e => {
            if (e.foodName) {
                const name = e.foodName.toLowerCase().trim();
                foodMap[name] = (foodMap[name] || 0) + 1;
            }
        });

        return Object.entries(foodMap)
            .map(([food, count]) => ({ food, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    },

    async getHistoryForMonth(userId: string, monthId: string): Promise<HistoryEntry[]> {
        const { getDocs } = await import("firebase/firestore");
        const logsRef = collection(db, "users", userId, "history", monthId, "logs");
        const q = query(logsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryEntry)); 
    },

    /**
     * CIERRE DE BUCLE (IP VITAMETRA): 
     * Actualiza un registro de comida con los resultados post-prandiales.
     */
    async closeLearningLoop(userId: string, monthId: string, entryId: string, postGlucose: number, successScore: number, notes?: string) {
        const entryRef = doc(db, "users", userId, "history", monthId, "logs", entryId);
        return await updateDoc(entryRef, {
            postPrandialGlucose: postGlucose,
            successScore: successScore,
            closureNotes: notes || "",
            updatedAt: serverTimestamp()
        });
    },

    async deleteHistoryEntry(userId: string, monthId: string, entryId: string) {
        await deleteDoc(doc(db, "users", userId, "history", monthId, "logs", entryId));
    },

    subscribeToHistory(userId: string, callback: (data: HistoryEntry[]) => void): Unsubscribe {
        const monthId = new Date().toISOString().slice(0, 7);
        const q = query(
            collection(db, "users", userId, "history", monthId, "logs"), 
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
    },

    // --- MEDICAL DEVICE UPLOAD & SYNC ---
    async uploadMedicalReport(userId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
        const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storage = getStorage();
        const fileRef = ref(storage, `users/${userId}/medical-reports/${fileId}`);

        return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(fileRef, file);
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => reject(error),
                () => resolve(fileId) // Return fileId so UI knows which document to watch
            );
        });
    },

    subscribeToPendingReport(userId: string, fileId: string, callback: (data: any) => void): Unsubscribe {
        const reportRef = doc(db, "users", userId, "pending_reports", fileId);
        return onSnapshot(reportRef, (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() });
            }
        }, (error) => console.error(error));
    },

    async confirmAndSaveMedicalData(userId: string, pendingReportId: string, extractedData: any) {
        // Here we map the extracted Gemini format to our HistoryEntry format.
        // Data contains extractedData.glucose, extractedData.insulin, etc.
        const monthId = new Date().toISOString().slice(0, 7);
        const batch = [];
        const { writeBatch } = await import("firebase/firestore");
        const fbBatch = writeBatch(db);

        // Map Glucose Readings
        if (extractedData.glucose && Array.isArray(extractedData.glucose)) {
            extractedData.glucose.forEach((g: any) => {
                const newRef = doc(collection(db, "users", userId, "history", monthId, "logs"));
                fbBatch.set(newRef, {
                    userId,
                    monthId,
                    type: "GLUCOSE_READING",
                    date: g.timestamp,
                    glucose: g.value,
                    createdAt: serverTimestamp(),
                    source: "DEVICE_IMPORT"
                });
            });
        }

        // Map Insulin Doses
        if (extractedData.insulin && Array.isArray(extractedData.insulin)) {
            extractedData.insulin.forEach((i: any) => {
                const newRef = doc(collection(db, "users", userId, "history", monthId, "logs"));
                fbBatch.set(newRef, {
                    userId,
                    monthId,
                    type: "INSULIN_DOSE",
                    date: i.timestamp,
                    insulinType: i.type,
                    insulinDose: i.units,
                    createdAt: serverTimestamp(),
                    source: "DEVICE_IMPORT"
                });
            });
        }

        // Execute mapping
        await fbBatch.commit();

        // Remove from pending validation queue
        await deleteDoc(doc(db, "users", userId, "pending_reports", pendingReportId));
    }
};