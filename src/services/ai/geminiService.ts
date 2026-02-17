import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeFoodText = async (prompt: string) => {
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
    // Si falla el servidor de Google, devolvemos un JSON simulado para que la app no explote
    console.error("Gemini Error:", error);
    return JSON.stringify({
        totalCarbs: 20, 
        calories: 150, 
        protein: 5, 
        fat: 5, 
        glycemicIndex: "Medio",
        optimizationTip: "No pudimos conectar con la IA, mostrando valores estimados."
    });
  }
};