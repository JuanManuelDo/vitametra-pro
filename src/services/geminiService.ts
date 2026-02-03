import type { AnalysisResult, ImportedGlucoseEntry, HistoryEntry, ClinicalReportConfig, UserData } from '../types';

const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
// Forzamos manualmente la versión V1 (Estable) para saltarnos el error 404 del SDK
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/**
 * MOTOR DE INFERENCIA METABÓLICA (V1 ESTABLE)
 * Peter Thiel Style: Simplicidad extrema para una robustez total.
 */
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
    
    JSON format:
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
    ? "Analiza esta imagen de comida y entrega los valores clínicos en el formato JSON solicitado." 
    : `Analiza este plato: "${content}". Entrega los valores clínicos en el formato JSON solicitado.`;

  const requestBody = {
    contents: [{
      parts: [
        { text: `${systemPrompt}\n\n${userPrompt}` },
        ...(isImage ? [{ inlineData: { mimeType, data: content } }] : [])
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Fallo en Bio-Core");
    }

    const data = await response.json();
    const rawResponse = data.candidates[0].content.parts[0].text;
    
    // Limpiamos la respuesta por si la IA incluye bloques de código markdown
    const jsonStr = rawResponse.match(/\{[\s\S]*\}/)?.[0] || rawResponse;
    return JSON.parse(jsonStr) as AnalysisResult;

  } catch (error: any) {
    console.error("METRACORE CRITICAL ERROR:", error.message);
    throw new Error("El motor Bio-Core está sincronizando. Por favor intenta describiendo la comida en texto.");
  }
};

export const analyzeFoodText = async (text: string, userContext?: UserData, history: HistoryEntry[] = []) => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ClinicalReportConfig): Promise<string> => {
  const prompt = `Genera un reporte clínico: ${JSON.stringify(history.slice(0, 10))}. Tipo: ${config.diabetesType}.`;
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const parseGlucometerData = async ({ content, isBase64, mimeType }: any): Promise<ImportedGlucoseEntry[]> => {
  const prompt = "Extrae registros de glucosa JSON: array de { date (ISO), value (mg/dL) }.";
  const parts = isBase64 ? [{ text: prompt }, { inlineData: { data: content, mimeType } }] : [{ text: prompt + content }];
  
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json" } })
  });
  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};