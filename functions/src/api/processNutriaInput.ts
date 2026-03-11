import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import sharp from "sharp";
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const processNutriaInput = onCall({
  region: "us-central1",
  memory: "1GiB", // Mayor memoria para procesar archivos Base64 pesados (audio/imágenes)
  timeoutSeconds: 120, // Hasta 2 minutos para llamadas a LLM complejas
}, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "El usuario debe estar autenticado para usar la ficha clínica interactiva."
    );
  }

  const { text, image, imageMimeType, audio, audioMimeType } = request.data;
  
  if (!text && !image && !audio) {
    throw new HttpsError(
      "invalid-argument",
      "Debes proporcionar 'text', 'image' o 'audio'."
    );
  }

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash", // Gemini 1.5 Flash soporta texto, imagen y audio eficientemente
      systemInstruction: "Eres Nutria, el asistente experto de VitaMetra. Tu objetivo es ser el diario de vida de un paciente con diabetes.\n\nSi recibes IMAGEN: Estima carbohidratos y describe alimentos.\n\nSi recibes TEXTO/AUDIO: Extrae datos de alimentación, dosis de insulina, niveles de glucosa o actividad física.\n\nSiempre mantén un tono empático y prioriza la seguridad. Si falta información para un cálculo preciso, solicítala.\n\nDebes responder SIEMPRE en un formato JSON estricto con la siguiente estructura (NO envuelvas el JSON en markdown de código, devuelve sólo el JSON parseable):\n{\n  \"tipo_registro\": \"comida | insulina | glucosa | ejercicio | consulta\",\n  \"alimentos\": [{\"nombre\": \"string\", \"cantidad\": \"string\"}],\n  \"carbohidratos_totales\": number | null,\n  \"insulina_detectada\": \"string | null\",\n  \"glucosa_detectada\": \"string | null\",\n  \"indice_glucemico\": \"Bajo | Medio | Alto | null\",\n  \"razonamiento\": \"string\",\n  \"advertencia\": \"string | null\"\n}",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Configurado bajo para respuestas precisas y consistentes
      }
    });

    const promptParts: Array<string | Part> = [];

    // Agregar texto si existe
    if (text) {
      promptParts.push(`Texto del paciente: "${text}"`);
    } else {
      promptParts.push("Analiza la entrada del paciente.");
    }

    // Agregar imagen si existe (Base64)
    if (image) {
      try {
        // Remover metadatos (ej. GPS) mediante sharp para preservar privacidad
        const imageBuffer = Buffer.from(image, 'base64');
        const strippedBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        
        promptParts.push({
          inlineData: {
            data: strippedBuffer.toString('base64'),
            mimeType: "image/jpeg" // Siempre convertimos a jpeg limpio
          }
        });
      } catch (sharpError) {
        console.error("Error limpiando metadatos de imagen:", sharpError);
        return {
          success: false,
          error: true,
          data: {
            tipo_registro: "consulta",
            razonamiento: "Lo siento, tuve un problema procesando tu imagen de forma segura. ¿Podrías enviarla de nuevo?",
            advertencia: "Fallo de seguridad visual."
          }
        };
      }
    }

    // Agregar audio si existe (Base64)
    if (audio) {
      promptParts.push({
        inlineData: {
          data: audio,
          mimeType: audioMimeType || "audio/mpeg" // o audio/mp4, audio/ogg, etc.
        }
      });
    }

    let result;
    try {
      result = await model.generateContent(promptParts);
    } catch (apiError) {
      console.error("Error en Gemini API:", apiError);
      return {
        success: false,
        error: true,
        data: {
          tipo_registro: "consulta",
          razonamiento: "Lo siento, tuve problemas para procesar tu mensaje. ¿Podrías intentar nuevamente?",
          advertencia: "Error de IA."
        }
      };
    }
    
    const responseText = result.response.text();

    console.log("Gemini Raw Response:", responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parseando respuesta de Gemini a JSON:", parseError);
      return {
        success: false,
        error: true,
        data: {
          tipo_registro: "consulta",
          razonamiento: "Recibí tu mensaje, pero no logré entenderlo completamente. ¿Podrías ser un poco más específico o repetirlo de manera sencilla?",
          advertencia: "Ininteligible."
        }
      };
    }

    // Guardar en Firestore -> Ficha Clínica Digital
    const db = admin.firestore();
    await db.collection("patients").doc(uid).collection("history").add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      input_provided: {
        hasText: !!text,
        hasImage: !!image,
        hasAudio: !!audio
      },
      analysis: parsedResponse,
      status: "processed_by_nutria"
    });

    return {
      success: true,
      data: parsedResponse
    };

  } catch (error: any) {
    console.error("Error en processNutriaInput:", error);
    throw new HttpsError("internal", error.message || "Error al procesar la entrada multimodal.");
  }
});
