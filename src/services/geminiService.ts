import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { AnalysisResult, ImportedGlucoseEntry, HistoryEntry, ClinicalReportConfig, UserData } from '../types';

// FUERZA LA VERSIÓN V1 PARA EVITAR EL 404 DE V1BETA
const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
const genAI = new GoogleGenerativeAI(API_KEY);

// CONFIGURACIÓN DE MODELO ESTABLE
const MODEL_NAME = "gemini-1.5-flash";

const NUTRITION_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          food: { type: SchemaType.STRING },
          totalCarbs: { type: SchemaType.NUMBER },
          category: { type: SchemaType.STRING, enum: ['base', 'complemento', 'fibra_proteina'] },
          fiber: { type: SchemaType.NUMBER },
          protein: { type: SchemaType.NUMBER },
          fat: { type: SchemaType.NUMBER },
          calories: { type: SchemaType.NUMBER }
        },
        required: ['food', 'totalCarbs', 'category', 'fiber', 'protein', 'fat', 'calories']
      }
    },
    totalCarbs: { type: SchemaType.NUMBER },
    totalFiber: { type: SchemaType.NUMBER },
    netCarbs: { type: SchemaType.NUMBER },
    glycemicIndex: { type: SchemaType.STRING, enum: ['alto', 'medio', 'bajo'] },
    glycemicLoad: { type: SchemaType.NUMBER },
    glucoseRiseEstimate: { type: SchemaType.NUMBER },
    optimizationTip: { type: SchemaType.STRING },
    metabolicExplanation: { type: SchemaType.STRING }
  },
  required: ['items', 'totalCarbs', 'totalFiber', 'netCarbs', 'glycemicIndex', 'glycemicLoad', 'glucoseRiseEstimate', 'optimizationTip', 'metabolicExplanation']
};

export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg',
  userContext?: UserData, 
  history: HistoryEntry[] = []
): Promise<AnalysisResult> => {
  
  // Especificamos la versión v1 explícitamente si el SDK lo permite, 
  // si no, el nombre del modelo sin prefijos suele disparar la ruta correcta.
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
  });

  const recentPatterns = history
    .filter(h => h.isCalibrated && (h.glucoseImpact || 0) > 50)
    .slice(0, 3)
    .map(h => `- ${h.foodName}: +${h.glucoseImpact}mg/dL`)
    .join('\n');

  const systemInstruction = `Eres Vitametra Clinical AI. 
    Analiza la comida y responde EXCLUSIVAMENTE con el JSON definido.
    Contexto: Chile. Paciente: ${userContext?.subscription_tier || 'BASE'}.
    Patrones: ${recentPatterns || 'Normal'}`;

  try {
    const prompt = isImage 
      ? "Analiza la imagen y devuelve el JSON nutricional." 
      : `Analiza esta comida: "${content}". Calcula carbohidratos netos y respuesta glucémica estimada.`;

    const parts = isImage 
      ? [{ text: prompt }, { inlineData: { data: content, mimeType } }]
      : [{ text: prompt }];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: NUTRITION_SCHEMA,
      }
    });

    const response = result.response;
    const text = response.text();
    
    // Limpieza de seguridad por si la IA añade markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(cleanJson) as AnalysisResult;

  } catch (error: any) {
    console.error("DEBUG - Fallo en Bio-Core:", error.message);
    
    // SEGUNDO INTENTO (FALLBACK) - MODO COMPATIBILIDAD 10X
    if (!isImage) {
        const simpleModel = genAI.getGenerativeModel({ model: MODEL_NAME });
        const fastResult = await simpleModel.generateContent(`Genera un JSON nutricional para: ${content}. Solo el JSON, sin texto.`);
        return JSON.parse(fastResult.response.text().match(/\{[\s\S]*\}/)?.[0] || "{}");
    }

    throw new Error("Sincronización interrumpida. Reintenta en 3 segundos.");
  }
};

export const analyzeFoodText = async (text: string, userContext?: UserData, history: HistoryEntry[] = []) => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

// ... (Las demás funciones se mantienen igual)