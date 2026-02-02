import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence 
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Configuración de Vitametra Pro - Clave Maestra Restaurada
const firebaseConfig = {
  apiKey: "AIzaSyBz9Waj-ImxLCDJd6QKunGyE-Xlm2qJXA0", 
  authDomain: "gen-lang-client-0587114750.firebaseapp.com",
  projectId: "gen-lang-client-0587114750",
  storageBucket: "gen-lang-client-0587114750.firebasestorage.app",
  messagingSenderId: "367332219460",
  appId: "1:367332219460:web:485e99997b6e8f6681710d"
};

// Inicialización de la App
const app = initializeApp(firebaseConfig);

// Servicios con exportación directa
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Configuración de Auth con Persistencia Local (Mantiene la sesión iniciada)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((err) => console.error("Error en persistencia Auth:", err));

export default app;