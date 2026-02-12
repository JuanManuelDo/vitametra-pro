import { GoogleGenerativeAI } from "@google/generative-ai";
import { type AnalysisResult, type UserData } from '../types';

const API_KEY = "AIzaSyBroRv-_4DoV-LnAmeuvFVy4au4x4yAWBI"; 
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeFoodText = async (userInput: string, user: UserData | null): Promise<AnalysisResult> => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const userContext = user?.clinicalConfig ? 
            `Contexto: Glucosa objetivo ${user.clinicalConfig.targetGlucose} mg/dL.` : "";

        const prompt = `Analiza: "${userInput}". ${userContext} Responde en JSON con campos: items (food, totalCarbs, category), totalCarbs (número), glycemicIndex (Bajo/Medio/Alto), glycemicLoad, optimizationTip, aiContextualNote.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsedResult = JSON.parse(cleanJson);

        return {
            items: parsedResult.items || [],
            totalCarbs: parsedResult.totalCarbs || 0,
            glycemicIndex: parsedResult.glycemicIndex || "Medio",
            glycemicLoad: parsedResult.glycemicLoad || 0,
            optimizationTip: parsedResult.optimizationTip || "Registro listo.",
            aiContextualNote: parsedResult.aiContextualNote || "Análisis completado."
        };
    } catch (error) {
        return {
            items: [], totalCarbs: 0, glycemicIndex: "Medio", glycemicLoad: 0,
            optimizationTip: "Reintenta el análisis.", aiContextualNote: "Error de conexión."
        };
    }
};