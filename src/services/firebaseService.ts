import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs 
} from "firebase/firestore";
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence 
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// CONFIGURACIÓN PROTEGIDA (Lee desde Vercel o variables de entorno)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicialización de la App
const app = initializeApp(firebaseConfig);

// Exportación de servicios nucleares
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');
export const auth = getAuth(app);

// Configuración de persistencia (Local Storage) para mantener la sesión activa
setPersistence(auth, browserLocalPersistence)
  .catch((err) => console.error("Error en persistencia Auth:", err));

/**
 * SERVICIO DE EVENTOS CLÍNICOS
 * Centraliza el guardado de datos métricos para el análisis de la IA.
 */
export const logClinicalEvent = async (
    userId: string, 
    type: 'GLUCOSE' | 'CARBS' | 'INSULIN' | 'EXERCISE', 
    value: number, 
    metadata: any = {}
) => {
  try {
    const docRef = await addDoc(collection(db, "clinical_events"), {
      userId,
      type,
      value,
      metadata,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error añadiendo evento clínico: ", e);
    throw e;
  }
};

/**
 * Recupera el historial reciente para alimentar el contexto de Gemini
 */
export const getRecentEvents = async (userId: string, hours: number = 24) => {
  try {
    const q = query(
      collection(db, "clinical_events"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error recuperando eventos:", e);
    return [];
  }
};

export default app;