import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedBioSignal, MealType } from "../../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-1.5-flash"; // Ideal for large context and fast response

/**
 * 1. PROCESAMIENTO MULTIMODAL (DOCUMENTOS O IMÁGENES DE CGMs/BOMBAS DE INSULINA)
 * Recibe el contenido de un CSV/TXT del LibreView/Dexcom o una foto en Base64 de la pantalla del dispositivo.
 */
export const processCGMDocument = async (
  contentBase64: string, 
  mimeType: string, 
  isImage: boolean
): Promise<ExtractedBioSignal[]> => {
    
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("No VITE_GEMINI_API_KEY found.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
Eres la IA experta del core médico "VitaMetra". Estás analizando datos crudos extraídos de un dispositivo de monitoreo continuo de glucosa (CGM) o de una bomba de insulina. Esto puede ser una tabla de texto/csv o una imagen de un reporte.
 
De este documento, extrae de manera estructurada SOLO los eventos clínicamente más relevantes (hasta 20 eventos importantes) para un log de paciente. Clasifícalos con precisión.
Busca eventos como:
- Glucemias registradas (GLUCOSE) con su flecha de tendencia.
- Inyecciones o bolos de insulina (INSULIN).
- Eventos de comidas ingresados (MEAL).
- Sesiones de actividad física (EXERCISE).

Devuelve EXCLUSIVAMENTE un bloque de JSON en este formato. 
No uses markdown (\`\`\`json etc) ni texto de saludo, solo un array de objetos JSON que cumpla la interfaz:
[
  { 
    "type": "GLUCOSE" | "INSULIN" | "MEAL" | "EXERCISE",
    "value": <número>, // ej: glucemia en mg/dL, dosis en U, carbohidratos en g, o minutos de ejercicio
    "timestampExtracted": "<fecha en formato ISO 8601 o aproximado>",
    "description": "<descripción breve>",
    "trendArrow": "DOUBLE_UP" | "SINGLE_UP" | "FORTY_FIVE_UP" | "FLAT" | "FORTY_FIVE_DOWN" | "SINGLE_DOWN" | "DOUBLE_DOWN" | null,
    "mealType": "desayuno" | "almuerzo" | "cena" | "snack-manana" | "snack-tarde" | "snack-noche" | "snack-deportivo" | null
  }
]
    `;

    try {
        let result;
        
        if (isImage) {
             const imagePart = {
                inlineData: {
                  data: contentBase64,
                  mimeType
                }
             };
             result = await model.generateContent([prompt, imagePart]);
        } else {
             const textData = `Cuerpo del archivo CGM/Bomba:\n${contentBase64}`;
             result = await model.generateContent([prompt, textData]);
        }

        const cleanJsonStr = result.response.text().replace(/^```json/g, "").replace(/```$/g, "").trim();
        const parsed = JSON.parse(cleanJsonStr) as ExtractedBioSignal[];
        return parsed;
        
    } catch (e) {
        console.error("Error al procesar el archivo CGM:", e);
        throw new Error("El motor IA no pudo extraer patrones clínicos de este archivo. Verifique que no esté corrupto.");
    }
};

/**
 * 2. PROCESAMIENTO DE AUDIO/VOZ DEL PACIENTE
 * Recibe un audio de micrófono convertido a base64 o una transcripción cruda.
 */
export const processAudioVoiceEvent = async (
    audioOrTranscription: string, 
    isAudioBase64: boolean, 
    mimeType?: string
): Promise<ExtractedBioSignal> => {

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("No VITE_GEMINI_API_KEY found.");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const localIsoStr = new Date().toISOString(); 

    const prompt = `
Eres la interfaz de voz inteligente "Nutria", de VitaMetra. El paciente de diabetes acaba de hablar por el micrófono diciendo un evento de salud que desea registrar.
La fecha y hora actual en el sistema es: ${localIsoStr}.
 
El paciente puede decir cosas como:
- "Me puse 5 unidades de rápida porque iba a comer una manzana y estoy en 180" -> Devuelve el evento más importante (INSULIN), y extrae los 180 de glucosa al texto. Idealmente en este caso sepáralo como el evento primordial (la insulina) pero anota la glucosa en la descripción. O mejor, si me puedes generar el array JSON, pero acá espero SOLO UN OBJETO PRINCIPAL.
- "He comido un plato de pasta increíble, creo que son como 60 hidratos." -> MEAL (60 de value)
- "Hice 30 minutos de running." -> EXERCISE (30)
- "Tengo 245 de azúcar doble flecha arriba" -> GLUCOSE (245, trendArrow: DOUBLE_UP)

Extrae el evento médico primario que el paciente quiere registrar. Devuelve estrictamente un objeto JSON que siga esta interfaz y NADA MÁS que el JSON crudo:
{
  "type": "GLUCOSE" | "INSULIN" | "MEAL" | "EXERCISE",
  "value": <number>,
  "timestampExtracted": "<la hora de la ingesta en ISO. Asume que es AHORA salvo que el usuario diga 'hace 2 horas'>",
  "description": "<tu transcripción mejorada o nota IA>",
  "trendArrow": "DOUBLE_UP" | "SINGLE_UP" | "FORTY_FIVE_UP" | "FLAT" | "FORTY_FIVE_DOWN" | "SINGLE_DOWN" | "DOUBLE_DOWN" | null,
  "mealType": "desayuno" | "almuerzo" | "cena" | "snack-manana" | "snack-tarde" | "snack-noche" | "snack-deportivo" | null
}
    `;

    try {
        let result;
        if (isAudioBase64 && mimeType) {
            const audioPart = {
                inlineData: {
                  data: audioOrTranscription,
                  mimeType
                }
             };
             // NOTA: Para modelos que soportan audio como Gemini-1.5, esto funciona nativo
             result = await model.generateContent([prompt, audioPart]);
        } else {
             // Si pasamos solo el string de texto (Google Speech to Text ya ejecutado)
             result = await model.generateContent([prompt, `Transcripción del usuario: "${audioOrTranscription}"`]);
        }

        const cleanJsonStr = result.response.text().replace(/^```json/g, "").replace(/```$/g, "").trim();
        const parsed = JSON.parse(cleanJsonStr) as ExtractedBioSignal;
        return parsed;

    } catch (e) {
        console.error("Error al procesar el audio por IA:", e);
        throw new Error("No se pudo interpretar el mensaje de voz. Por favor, intenta de nuevo o escríbelo manualmente.");
    }
};
