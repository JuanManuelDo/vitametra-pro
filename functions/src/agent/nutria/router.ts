import { ParsedWhatsAppMessage } from "../../interfaces/whatsapp/parser";
import { sendWhatsAppMessage } from "../../interfaces/whatsapp/sender";
// importamos admin de una ubicación central o directamente
import * as admin from "firebase-admin";

// Inicialización de admin si no está
if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Recibe un mensaje parseado e invoca la habilidad ("skill") correcta de Nutria.
 */
export async function routeNutriaIntent(
  senderPhone: string,
  message: ParsedWhatsAppMessage,
  wabaNumberId: string
) {
  const db = admin.firestore();
  
  // 1. Encontrar al paciente asociado a este número (si existe)
  // Por simplicidad en la prueba, buscamos por número exacto
  let patientId = null;
  const snapshot = await db.collection("patients").where("whatsapp_number", "==", senderPhone).limit(1).get();
  
  if (!snapshot.empty) {
    patientId = snapshot.docs[0].id;
  }

  // 2. Guardar el evento en la sesión / historial (Opcional, sujeto a privacidad)
  if (patientId) {
    await logInteraction(patientId, senderPhone, message);
  }

  // 3. Simple Intent Router Rule-based (Mejorable con un LLM inicial)
  let responseText = "Hola, soy Nutria. Aún estoy aprendiendo, pero puedo procesar tus comandos básicos.";

  if (message.type === "text" && message.text) {
    const textLower = message.text.toLowerCase();
    
    // Conteo de carbos manual
    if (textLower.includes("carbohidrato") || textLower.includes("comí")) {
      responseText = "Entendido, quieres registrar una comida. Por favor, ¿podrías ser más específico con las cantidades, o enviarme una foto?";
      // Llamaríamos a skills/carbCounting.ts
    }
    // Glucemia manual
    else if (textLower.includes("glucosa") || textLower.includes("azúcar") || textLower.includes("mg/dl")) {
      responseText = "Entendido, registrando tu nivel de glucosa. ¿A qué hora fue la medición?";
      // Llamaríamos a skills/clinicalLogger.ts
    }
    // Ayuda general
    else {
      responseText = `He recibido tu mensaje textual: "${message.text}". ¿En qué más puedo ayudarte? (Envía foto de comida, audio, o registro de glucemia)`;
    }
  } else if (message.type === "image") {
    // Aquí invocaremos un LVLM (Ej: GPT-4-Vision / Gemini Pro Vision)
    // Se requiere un paso previo para descargar la imagen desde Meta usando el mediaId
    responseText = "Recibí tu imagen. Nutria analizará los carbohidratos en breve.";
  } else if (message.type === "audio") {
    // Aquí invocaremos Whisper STT
    responseText = "Recibí tu nota de voz. Procesando...";
  }

  // 4. Enviar Respuesta a WhatsApp
  await sendWhatsAppMessage(senderPhone, wabaNumberId, responseText);
}

/**
 * Función auxiliar para mantener rastro en la subcolección privada.
 */
async function logInteraction(patientId: string, phone: string, message: ParsedWhatsAppMessage) {
  const db = admin.firestore();
  const sessionRef = db.collection("patients").doc(patientId).collection("nutria_sessions").doc("latest");

  await sessionRef.set({
    lastInteraction: admin.firestore.FieldValue.serverTimestamp(),
    status: "active",
  }, { merge: true });

  await sessionRef.collection("messages").add({
    type: message.type,
    text: message.text || null,
    mediaId: message.mediaId || null,
    timestamp: message.timestamp,
    direction: "inbound",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });
}
