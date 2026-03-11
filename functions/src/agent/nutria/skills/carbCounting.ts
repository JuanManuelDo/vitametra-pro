import * as admin from "firebase-admin";

/**
 * Skill para estimar carbohidratos usando IA a partir de texto o imagen.
 * Integrable luego con `calculateMealImpact`.
 */
export async function handleCarbCounting(
  patientId: string | null,
  text: string | undefined,
  mediaId: string | undefined
): Promise<string> {
  // 1. Aquí iría la obtención de la imagen desde los servidores de Meta usando $mediaId,
  // y luego pasarlo a un modelo Vision como GPT-4V o Gemini Pro Vision.
  
  if (!patientId) {
    return "Veo que quieres contar carbohidratos, pero tu número no está registrado como paciente en VitaMetra. Por favor, asocia tu número en la app.";
  }

  // Simulamos un análisis por ahora
  let estimatedCarbs = 0;
  let description = "";

  if (mediaId) {
    // LLM Vision Logic ...
    estimatedCarbs = 45; // Placeholder
    description = "Parece que enviaste una foto de un plato con arroz y pollo.";
  } else if (text) {
    // LLM Text Logic ...
    estimatedCarbs = 30; // Placeholder
    description = `He analizado: "${text}".`;
  } else {
    return "No pude entender tu comida. Por favor envíame una descripción clara o una foto.";
  }

  // 2. Guardar el registro de la comida en la subcolección propuesta
  try {
    const db = admin.firestore();
    await db.collection("patients").doc(patientId).collection("meals").add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      carbs_estimated: estimatedCarbs,
      image_url: mediaId ? `meta_media://${mediaId}` : null,
      validation_status: "ai_estimated",
      ai_confidence_score: 90, // Placeholder
      description
    });

    return `Nutria: ${description} Estimo que contiene aproximadamente *${estimatedCarbs}g de carbohidratos*. He registrado esto en tu diario de VitaMetra. ¿Vas a inyectarte insulina para esto?`;
  } catch (error) {
    console.error("Error guardando registro de comida:", error);
    return "Hubo un problema registrando tu comida en nuestro sistema, pero estimo que tiene unos " + estimatedCarbs + "g de carbohidratos.";
  }
}
