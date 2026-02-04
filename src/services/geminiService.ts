import type { 
  AnalysisResult, 
  GlucoseEntry, // Corregido: Nombre estándar
  HistoryEntry, 
  ReportConfig,  // Corregido: Nombre estándar
  UserData 
} from '../types';

/**
 * VITAMETRA BIO-CORE ENGINE v6.0 - ANTI-FRAGILE EDITION
 * Basado en principios de Peter Thiel: 10x mejor, vertical y robusto.
 */

const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
// Forzamos V1 estable para evitar el 404 de la beta
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg',
  userContext?: UserData, 
  history: HistoryEntry[] = []
): Promise<AnalysisResult> => {
  
  // Aprendizaje de patrones históricos para personalización metabólica
  const recentPatterns = history
    .filter(h => (h.glucoseImpact || 0) > 40)
    .slice(0, 3)
    .map(h => `- ${h.foodName}: +${h.glucoseImpact}mg/dL`)
    .join('\n');

  const systemPrompt = `Actúa como Vitametra Clinical AI. 
    Tu objetivo es el análisis molecular de alimentos. 
    RESPUESTA: EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO.
    
    ESTRUCTURA JSON:
    {
      "items": [{"food": "nombre", "totalCarbs": 0, "category": "base", "fiber": 0, "protein": 0, "fat": 0, "calories": 0}],
      "totalCarbs": 0,
      "totalFiber": 0,
      "netCarbs": 0,
      "glycemicIndex": "bajo",
      "glycemicLoad": 0,
      "glucoseRiseEstimate": 0,
      "optimizationTip": "texto breve",
      "metabolicExplanation": "explicación técnica"
    }

    CONTEXTO CHILE: Entiende términos como marraqueta, hallulla, palta, porotos.
    USUARIO: ${userContext?.subscription_tier || 'BASE'}
    HISTORIAL RECIENTE: ${recentPatterns || 'Normal'}`;

  const userPrompt = isImage 
    ? "Analiza clínicamente esta imagen y devuelve el JSON." 
    : `Analiza este plato: "${content}".`;

  // ELIMINAMOS 'response_mime_type' y otros campos que causan el error 400 en V1
  const requestBody = {
    contents: [{
      parts: [
        { text: `${systemPrompt}\n\n${userPrompt}` },
        ...(isImage ? [{ inlineData: { mime_type: mimeType, data: content } }] : [])
      ]
    }],
    generationConfig: {
      temperature: 0.1, // Baja temperatura para evitar alucinaciones y texto extra
      topP: 0.95,
      maxOutputTokens: 1024
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
      console.error("BIO-CORE ERROR DATA:", data);
      throw new Error(data.error?.message || "Fallo de comunicación con Bio-Core");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    
    // EXTRACCIÓN RESILIENTE: Limpia cualquier texto que no sea JSON (como ```json ... ```)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("La respuesta de la IA no contiene un JSON válido");
    
    return JSON.parse(jsonMatch[0]) as AnalysisResult;

  } catch (error: any) {
    console.error("METRACORE CRITICAL FAIL:", error.message);
    throw new Error("Sincronización interrumpida. El motor Bio-Core está reconectando.");
  }
};

export const analyzeFoodText = (text: string, userContext?: UserData, history: HistoryEntry[] = []) => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ReportConfig): Promise<string> => {
  const prompt = `Genera un reporte metabólico breve para: ${JSON.stringify(history.slice(0, 10))}. Configuración: ${config.diabetesType}`;
  
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const parseGlucometerData = async ({ content, isBase64, mimeType }: any): Promise<GlucoseEntry[]> => {
  const prompt = "Extrae registros de glucosa en un array JSON de objetos { date: string, value: number }.";
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