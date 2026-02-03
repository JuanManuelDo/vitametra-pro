import type { AnalysisResult, ImportedGlucoseEntry, HistoryEntry, ClinicalReportConfig, UserData } from '../types';

const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
// URL Forzada a V1 estable
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg',
  userContext?: UserData, 
  history: HistoryEntry[] = []
): Promise<AnalysisResult> => {
  
  const recentPatterns = history
    .filter(h => h.isCalibrated && (h.glucoseImpact || 0) > 50)
    .slice(0, 3)
    .map(h => `- ${h.foodName}: +${h.glucoseImpact}mg/dL`)
    .join('\n');

  const systemPrompt = `Actúa como Vitametra Clinical AI. Analiza la comida y responde SOLO con un objeto JSON.
    Contexto: Chile. Paciente: ${userContext?.subscription_tier || 'BASE'}.
    Patrones: ${recentPatterns || 'Normal'}.
    
    IMPORTANTE: Devuelve un JSON que cumpla exactamente esta estructura:
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
    ? "Analiza esta imagen de comida y entrega los valores clínicos en JSON." 
    : `Analiza este plato: "${content}". Entrega los valores clínicos en JSON.`;

  // CORRECCIÓN 10X: Nombres de campos exactos para API V1
  const requestBody = {
    contents: [{
      parts: [
        { text: `${systemPrompt}\n\n${userPrompt}` },
        ...(isImage ? [{ inlineData: { mime_type: mimeType, data: content } }] : [])
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json" 
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
      throw new Error(data.error?.message || "Error en Bio-Core");
    }

    const rawResponse = data.candidates[0].content.parts[0].text;
    const jsonStr = rawResponse.match(/\{[\s\S]*\}/)?.[0] || rawResponse;
    return JSON.parse(jsonStr) as AnalysisResult;

  } catch (error: any) {
    console.error("METRACORE CRITICAL ERROR:", error.message);
    throw new Error("Sincronización interrumpida. El motor está reconectando.");
  }
};

export const analyzeFoodText = async (text: string, userContext?: UserData, history: HistoryEntry[] = []) => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ClinicalReportConfig): Promise<string> => {
  const prompt = `Genera un reporte clínico breve: ${JSON.stringify(history.slice(0, 10))}.`;
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const parseGlucometerData = async ({ content, isBase64, mimeType }: any): Promise<ImportedGlucoseEntry[]> => {
  const prompt = "Extrae registros de glucosa JSON: array de { date, value }.";
  const parts = isBase64 ? [{ text: prompt }, { inlineData: { mime_type: mimeType, data: content } }] : [{ text: prompt + content }];
  
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts }], 
      generationConfig: { response_mime_type: "application/json" } 
    })
  });
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};