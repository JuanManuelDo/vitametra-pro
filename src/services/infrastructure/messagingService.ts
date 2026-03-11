import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebaseService";
import { apiService } from "./apiService";

const messaging = getMessaging(app);

// Este es tu VAPID KEY público de Firebase Console 
// (Configuración del proyecto > Mensajería en la nube > Certificados Web)
const VAPID_KEY = "TU_VAPID_KEY_AQUÍ"; 

export const setupNotifications = async (userId: string) => {
  try {
    // 1. Solicitar permiso al navegador
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // 2. Obtener el token de Firebase Cloud Messaging
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log("Token de Bio-Notificación generado.");
        // 3. Guardar el token en el documento del usuario en Firestore
        await apiService.updateUserProfile(userId, { fcmToken: token });
        return token;
      }
    }
  } catch (error) {
    console.error("Error al configurar Bio-Notificaciones:", error);
  }
  return null;
};