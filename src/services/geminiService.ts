import type { AnalysisResult, ImportedGlucoseEntry, HistoryEntry, ClinicalReportConfig, UserData } from '../types';

const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
// Forzamos V1 para estabilidad total
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/**
 * BIO-CORE ENGINE v5.0 (Resilience Edition)
 * Este motor utiliza Fetch nativo para evitar conflictos de librerías.
 */
export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg',
  userContext?: UserData, 
  history: HistoryEntry[] = []
): Promise<AnalysisResult> => {
  
  const systemPrompt = `Actúa como Vitametra Clinical AI. 
    Analiza la comida y responde EXCLUSIVAMENTE con un objeto JSON.
    Contexto Chile: Entiende "marraqueta", "palta", "huevo revuelto".
    
    Estructura requerida:
    {
      "items": [{"food": "nombre", "totalCarbs": 0, "category": "base", "fiber": 0, "protein": 0, "fat": 0, "calories": 0}],
      "totalCarbs": 0,
      "totalFiber": 0,
      "netCarbs": 0,
      "glycemicIndex": "bajo",
      "glycemicLoad": 0,
      "glucoseRiseEstimate": 0,
      "optimizationTip": "texto",
      "metabolicExplanation": "texto"
    }`;

  const userPrompt = isImage 
    ? "Analiza la imagen y entrega el JSON." 
    : `Analiza este plato: "${content}". Entrega el JSON nutricional.`;

  const requestBody = {
    contents: [{
      parts: [
        { text: `${systemPrompt}\n\n${userPrompt}` },
        ...(isImage ? [{ inlineData: { mime_type: mimeType, data: content } }] : [])
      ]
    }],
    generationConfig: {
      temperature: 0.1, // Baja temperatura = mayor precisión técnica
      topP: 0.95,
      // Eliminamos response_mime_type temporalmente para maximizar compatibilidad si el header falla
    }
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error Data:", data);
      throw new Error(data.error?.message || "Error de conexión con Bio-Core");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    
    // BLINDAJE 10X: Extractor de JSON robusto
    // Busca el primer '{' y el último '}' para ignorar cualquier texto extra de la IA
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error("La IA no generó un formato válido.");
    }

    const cleanJson = rawText.substring(start, end + 1);
    return JSON.parse(cleanJson) as AnalysisResult;

  } catch (error: any) {
    console.error("METRACORE CRITICAL ERROR:", error);
    throw new Error("Sincronización interrumpida. El motor está reconectando.");
  }
};

export const analyzeFoodText = async (text: string, userContext?: UserData, history: HistoryEntry[] = []) => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

// ... Mantener las otras funciones con la misma lógica de fetch si fallan