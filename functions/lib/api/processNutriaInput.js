"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNutriaInput = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
const sharp_1 = __importDefault(require("sharp"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
exports.processNutriaInput = (0, https_1.onCall)({
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 120,
}, async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new https_1.HttpsError("unauthenticated", "El usuario debe estar autenticado para usar la ficha clínica interactiva.");
    }
    const { text, image, imageMimeType, audio, audioMimeType } = request.data;
    if (!text && !image && !audio) {
        throw new https_1.HttpsError("invalid-argument", "Debes proporcionar 'text', 'image' o 'audio'.");
    }
    try {
        const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "Eres Nutria, el asistente experto de VitaMetra. Tu objetivo es ser el diario de vida de un paciente con diabetes.\n\nSi recibes IMAGEN: Estima carbohidratos y describe alimentos.\n\nSi recibes TEXTO/AUDIO: Extrae datos de alimentación, dosis de insulina, niveles de glucosa o actividad física.\n\nSiempre mantén un tono empático y prioriza la seguridad. Si falta información para un cálculo preciso, solicítala.\n\nDebes responder SIEMPRE en un formato JSON estricto con la siguiente estructura (NO envuelvas el JSON en markdown de código, devuelve sólo el JSON parseable):\n{\n  \"tipo_registro\": \"comida | insulina | glucosa | ejercicio | consulta\",\n  \"alimentos\": [{\"nombre\": \"string\", \"cantidad\": \"string\"}],\n  \"carbohidratos_totales\": number | null,\n  \"insulina_detectada\": \"string | null\",\n  \"glucosa_detectada\": \"string | null\",\n  \"indice_glucemico\": \"Bajo | Medio | Alto | null\",\n  \"razonamiento\": \"string\",\n  \"advertencia\": \"string | null\"\n}",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
            }
        });
        const promptParts = [];
        if (text) {
            promptParts.push(`Texto del paciente: "${text}"`);
        }
        else {
            promptParts.push("Analiza la entrada del paciente.");
        }
        if (image) {
            try {
                const imageBuffer = Buffer.from(image, 'base64');
                const strippedBuffer = await (0, sharp_1.default)(imageBuffer).jpeg().toBuffer();
                promptParts.push({
                    inlineData: {
                        data: strippedBuffer.toString('base64'),
                        mimeType: "image/jpeg"
                    }
                });
            }
            catch (sharpError) {
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
        if (audio) {
            promptParts.push({
                inlineData: {
                    data: audio,
                    mimeType: audioMimeType || "audio/mpeg"
                }
            });
        }
        let result;
        try {
            result = await model.generateContent(promptParts);
        }
        catch (apiError) {
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
        }
        catch (parseError) {
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
    }
    catch (error) {
        console.error("Error en processNutriaInput:", error);
        throw new https_1.HttpsError("internal", error.message || "Error al procesar la entrada multimodal.");
    }
});
//# sourceMappingURL=processNutriaInput.js.map