import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserData } from "../../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeFoodText = async (prompt: string, user?: UserData) => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) return null;

    // Cambiamos a gemini-1.5-flash-8b o flash seco para mayor compatibilidad
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // Forzamos la configuración de generación si fuera necesario
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("No pudimos conectar con la IA para analizar tu comida. Por favor, revisa tu conexión o intenta con un registro manual.");
  }
};