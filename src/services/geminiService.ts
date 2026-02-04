import type { 
  AnalysisResult, 
  GlucoseEntry, 
  HistoryEntry, 
  ReportConfig, 
  UserData 
} from '../types';

const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
// CAMBIO CLAVE: Usamos v1beta pero con el modelo referenciado correctamente
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg',
  userContext?: UserData, 
  history: HistoryEntry[] = []
): Promise<AnalysisResult> => {
  
  const recentPatterns = history
    .filter(h => (h.glucoseImpact || 0) > 40)
    .slice(0, 3)
    .map(h => `- ${h.foodName}: +${h.glucoseImpact}mg/dL`)
    .join('\n');

  const systemPrompt = `Eres Vitametra Clinical AI. 
    Analiza la comida y responde ÚNICAMENTE con un JSON.
    Contexto: Chile.
    
    Estructura:
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

  const userPrompt = isImage ? "Analiza la imagen." : `Analiza: "${content}".`;

  const requestBody = {
    contents: [{
      parts: [
        { text: `${systemPrompt}\n\n${userPrompt}` },
        ...(isImage ? [{ inlineData: { mime_type: mimeType, data: content } }] : [])
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      // No incluimos response_mime_type aquí para evitar el error 400 anterior
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
      throw new Error(data.error?.message || "Fallo en Bio-Core");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON no encontrado");
    
    return JSON.parse(jsonMatch[0]) as AnalysisResult;

  } catch (error: any) {
    console.error("METRACORE FAIL:", error.message);
    throw new Error("Sincronización interrumpida. Reintentando...");
  }
};

export const analyzeFoodText = (text: string, userContext?: UserData, history: HistoryEntry[] = []) => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ReportConfig): Promise<string> => {
  const prompt = `Genera reporte: ${JSON.stringify(history.slice(0, 5))}`;
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const parseGlucometerData = async ({ content, isBase64, mimeType }: any): Promise<GlucoseEntry[]> => {
  const prompt = "Extrae registros glucosa JSON array { date, value }.";
  const parts = isBase64 ? [{ text: prompt }, { inlineData: { mime_type: mimeType, data: content } }] : [{ text: prompt + content }];
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] })
  });
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
};