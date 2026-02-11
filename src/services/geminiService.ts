import { GoogleGenerativeAI } from "@google/generative-ai";
import { type AnalysisResult } from '../types';

// CONFIGURACIÓN DEL NÚCLEO IA - VITAMETRA 2026
const API_KEY = "AIzaSyBroRv-_4DoV-LnAmeuvFVy4au4x4yAWBI"; 
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Motor de Análisis Nutricional 
 * Transforma descripciones de comida en datos metabólicos precisos.
 */
export const analyzeFoodText = async (userInput: string): Promise<AnalysisResult> => {
    try {
        // Usamos el modelo 1.5 Flash por su latencia ultra-baja (ideal para web)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            Actúa como un experto en nutrición y diabetología de precisión. 
            Analiza la siguiente ingesta descrita por el usuario: "${userInput}"
            
            Tu objetivo es descomponer la comida y calcular su impacto glucémico.
            
            DEBES responder estrictamente con este formato JSON:
            {
                "items": [
                    { "food": "nombre del alimento", "totalCarbs": número, "category": "Carbohidrato/Proteína/Vegetal/Grasa" }
                ],
                "totalCarbs": suma_total_carbohidratos,
                "glycemicIndex": "Bajo" | "Medio" | "Alto",
                "glycemicLoad": número_carga_glucémica,
                "optimizationTip": "Consejo clínico breve para mejorar el impacto glucémico",
                "aiContextualNote": "Nota motivadora o de precaución basada en el tipo de diabetes"
            }

            Reglas de oro:
            1. Si no hay cantidades, asume porciones de tamaño medio de restaurante.
            2. El valor totalCarbs debe ser la suma matemática de los carbohidratos de cada item.
            3. No incluyas explicaciones fuera del JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Limpieza y validación del JSON recibido
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(cleanJson);

        return {
            items: parsedResult.items || [],
            totalCarbs: parsedResult.totalCarbs || 0,
            glycemicIndex: parsedResult.glycemicIndex || "Medio",
            glycemicLoad: parsedResult.glycemicLoad || 0,
            optimizationTip: parsedResult.optimizationTip || "Añade fibra o proteína para estabilizar la curva.",
            aiContextualNote: parsedResult.aiContextualNote || "Análisis metabólico listo."
        } as AnalysisResult;

    } catch (error) {
        console.error("Error en el motor Gemini:", error);
        
        // Retorno de emergencia (evita que la app se bloquee en producción)
        return {
            items: [],
            totalCarbs: 0,
            glycemicIndex: "Medio",
            glycemicLoad: 0,
            optimizationTip: "Intenta describir los ingredientes por separado.",
            aiContextualNote: "Sincronizando con el satélite de IA... Por favor reintenta en unos segundos."
        };
    }
};