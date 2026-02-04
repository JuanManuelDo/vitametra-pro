import type { AnalysisResult, GlucoseEntry, HistoryEntry, ReportConfig, UserData } from '../types';

/**
 * VITAMETRA BIO-CORE MVP
 * Enfoque: Simplicidad radical y máxima disponibilidad.
 */

const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
// Endpoint estandarizado para Gemini 1.5 Flash
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg'
): Promise<AnalysisResult> => {
  
  // Prompt optimizado para evitar "alucinaciones" de texto y forzar JSON puro
  const promptText = `Analiza nutricionalmente: "${content}". 
  Responde ÚNICAMENTE con este formato JSON, sin texto adicional:
  {
    "items": [{"food": "nombre", "totalCarbs": 0, "category": "base", "fiber": 0, "protein": 0, "fat": 0, "calories": 0}],
    "totalCarbs": 0,
    "totalFiber": 0,
    "netCarbs": 0,
    "glycemicIndex": "bajo",
    "glycemicLoad": 0,
    "glucoseRiseEstimate": 0,
    "optimizationTip": "...",
    "metabolicExplanation": "..."
  }`;

  const requestBody = {
    contents: [{
      parts: [
        { text: promptText },
        ...(isImage ? [{ inlineData: { mime_type: mimeType, data: content } }] : [])
      ]
    }]
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bio-Core Status:", response.status, data);
      throw new Error(data.error?.message || "Error de conexión");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    
    // Extractor de seguridad: encuentra el JSON aunque venga envuelto en Markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("El motor no generó un JSON válido.");
    }

    return JSON.parse(jsonMatch[0]) as AnalysisResult;

  } catch (error: any) {
    console.error("Engine Fault:", error.message);
    throw new Error("Sincronizando sistemas metabólicos. Por favor, intenta de nuevo.");
  }
};

/**
 * Mapeo de funciones core para compatibilidad con la UI
 */
export const analyzeFoodText = (text: string) => analyzeFoodVision(text, false);

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ReportConfig): Promise<string> => {
  return "Análisis de tendencias metabólicas disponible en breve.";
};

export const parseGlucometerData = async (data: any): Promise<GlucoseEntry[]> => {
  return [];
};