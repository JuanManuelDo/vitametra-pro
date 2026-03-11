import * as admin from "firebase-admin";

/**
 * Skill para registrar niveles de glucosa o dosis de insulina en Firestore.
 */
export async function handleClinicalLogger(
  patientId: string | null,
  text: string
): Promise<string> {
  if (!patientId) {
    return "Para registrar mediciones clínicas de manera segura, necesito que vincules tu número de WhatsApp en la app VitaMetra.";
  }

  const db = admin.firestore();

  // 1. Extraer los valores numéricos usando expresiones regulares simples
  // (En producción, un LLM estructurado o funcion calling de OpenAI haría esto)
  const isGlucose = text.toLowerCase().includes("glucosa") || text.toLowerCase().includes("azúcar") || text.toLowerCase().includes("mg/dl");
  const isInsulin = text.toLowerCase().includes("insulina") || text.toLowerCase().includes("unidades") || text.toLowerCase().includes("ui");

  const numbersMatch = text.match(/\d+/);
  const detectedValue = numbersMatch ? parseInt(numbersMatch[0], 10) : null;

  if (!detectedValue) {
    return "No logré detectar un número en tu mensaje. Por favor, dime algo como: 'Mi glucosa es 110 mg/dl' o 'Me inyecté 4 unidades de insulina'.";
  }

  try {
    if (isGlucose) {
      // Guardar glucosa en la colección existente
      await db.collection("patients").doc(patientId).collection("glucose_logs").add({
        value: detectedValue,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: "whatsapp_nutria" // Tag de privacidad/origen
      });

      // Lógica Clínica Sencilla
      if (detectedValue < 70) {
        return `🚨 Nutria Alerta: Tu glucosa está en *${detectedValue} mg/dl*, lo cual es hipoglucemia. Por favor, consume 15g de carbohidratos rápidos y vuelve a medir en 15 minutos.`;
      } else if (detectedValue > 180) {
        return `⚠️ Tu glucosa está en *${detectedValue} mg/dl* (alta). Te he registrado el valor. Considera tomar agua y revisar si requieres un bolo de corrección.`;
      } else {
        return `✅ Excelente, he registrado tu glucosa en *${detectedValue} mg/dl*. Está dentro del rango objetivo.`;
      }
    } 
    else if (isInsulin) {
      // Guardar insulina
      await db.collection("patients").doc(patientId).collection("insulin_logs").add({
        units: detectedValue,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        source: "whatsapp_nutria"
      });

      return `He registrado *${detectedValue} unidades* de insulina en tu diario.`;
    } 
    else {
      return `Registré el valor ${detectedValue}, pero no estoy seguro si es glucosa o insulina. ¿Me lo aclaras?`;
    }
  } catch (error) {
    console.error("Error guardando registro clínico:", error);
    return "Lo siento, tuve un error técnico intentando guardar tu medición en la base de datos de VitaMetra.";
  }
}
