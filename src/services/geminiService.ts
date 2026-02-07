import type { AnalysisResult, GlucoseEntry, HistoryEntry, ReportConfig, UserData } from '../types';

/**
 * VITAMETRA BIO-CORE MVP
 * Enfoque: Simplicidad radical y máxima disponibilidad.
 */

// ⚠️ CRÍTICO: Nunca expongas tu API key en el código del cliente
// Debes moverla a variables de entorno
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";

// Endpoint corregido para Gemini 2.5 Flash
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg'
): Promise<AnalysisResult> => {
  
  // Prompt optimizado para evitar "alucinaciones" de texto y forzar JSON puro
  const promptText = `Analiza nutricionalmente lo siguiente${isImage ? ' (imagen)' : ''}: "${content}". 
  
Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto, sin markdown ni texto adicional:

{
  "items": [{"food": "nombre del alimento", "totalCarbs": 0, "category": "base", "fiber": 0, "protein": 0, "fat": 0, "calories": 0}],
  "totalCarbs": 0,
  "totalFiber": 0,
  "netCarbs": 0,
  "glycemicIndex": "bajo",
  "glycemicLoad": 0,
  "glucoseRiseEstimate": 0,
  "optimizationTip": "consejo breve",
  "metabolicExplanation": "explicación breve"
}`;

  const parts: any[] = [];
  
  if (isImage) {
    parts.push({ 
      inline_data: {
        mime_type: mimeType, 
        data: content 
      } 
    });
    parts.push({ text: promptText });
  } else {
    parts.push({ text: promptText });
  }

  const requestBody = {
    contents: [{
      parts: parts
    }],
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    }
  };

  try {
    console.log('🔬 VitaMetra: Iniciando análisis...');
    
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Bio-Core Error:", response.status, errorData);
      throw new Error(
        errorData.error?.message || 
        `Error ${response.status}: No se pudo conectar con el servicio`
      );
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("❌ Respuesta inválida:", data);
      throw new Error("Respuesta vacía del servicio");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    console.log('📥 Respuesta raw:', rawText);
    
    let jsonText = rawText.trim();
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error("❌ No se encontró JSON en:", rawText);
      throw new Error("El servicio no generó un formato válido.");
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
    console.log('✅ Análisis completado:', result);
    
    return result;

  } catch (error: any) {
    console.error("💥 Engine Fault:", error);
    
    if (error.message.includes('API key')) {
      throw new Error("Error de autenticación. Verifica tu API key.");
    }
    if (error.message.includes('404')) {
      throw new Error("Modelo no encontrado. Verifica la configuración.");
    }
    
    throw new Error(
      error.message || 
      "Error al procesar el análisis. Por favor, intenta nuevamente."
    );
  }
};

export const analyzeFoodText = (text: string) => analyzeFoodVision(text, false);

export const generateAIClinicalReport = async (
  history: HistoryEntry[], 
  config: ReportConfig
): Promise<string> => {
  return "Análisis de tendencias metabólicas disponible en breve.";
};

export const parseGlucometerData = async (data: any): Promise<GlucoseEntry[]> => {
  return [];
};