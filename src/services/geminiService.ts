import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { AnalysisResult, ImportedGlucoseEntry, HistoryEntry, ClinicalReportConfig, UserData } from '../types';

const AI_MODEL = 'gemini-1.5-flash'; 
const genAI = new GoogleGenerativeAI("AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws");

/**
 * ANALIZADOR NUTRICIONAL CONTEXTUAL (Ventaja Competitiva)
 * Ahora recibe 'userContext' y 'history' para aprender de patrones pasados.
 */
export const analyzeFoodText = async (text: string, userContext?: UserData, history: HistoryEntry[] = []): Promise<AnalysisResult> => {
  const model = genAI.getGenerativeModel({ 
    model: AI_MODEL,
    generationConfig: { responseMimeType: "application/json" }
  });

  // Filtramos los últimos 5 registros con picos altos para que la IA aprenda
  const recentPatterns = history
    .filter(h => h.isCalibrated && h.glucoseImpact && h.glucoseImpact > 50)
    .slice(0, 5)
    .map(h => `- ${h.foodName}: Subió ${h.glucoseImpact}mg/dL con ${h.totalCarbs}g carbos.`)
    .join('\n');

  const systemInstruction = `
    Eres "Vitametras Clinical AI", el cerebro de un Sistema de Aprendizaje Metabólico.
    
    PERFIL DEL PACIENTE:
    - Tipo: ${userContext?.subscription_tier === 'PRO' ? 'Usuario PRO' : 'Usuario Base'}
    - Historial de Picos Recientes:
    ${recentPatterns || 'Sin patrones previos registrados.'}
    
    TU MISIÓN: Analizar alimentos y devolver datos nutricionales exactos.
    LÓGICA DE APRENDIZAJE: Si el historial muestra que el usuario tiene picos altos con ciertos alimentos, ajusta el "glucoseRiseEstimate" al alza.
    
    DICCIONARIO CULTURAL: Entiende modismos chilenos y porciones manuales ("un puño", "un cerrito").
  `;
  
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

  try {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Analiza este plato: ${text}` }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: NUTRITION_SCHEMA,
        },
        systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] }
    });
    
    return JSON.parse(result.response.text()) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error('La IA no pudo procesar esta descripción.');
  }
};

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ClinicalReportConfig): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: AI_MODEL });
  const prompt = `Genera un reporte clínico detallado: ${JSON.stringify(history.slice(0, 20))}. Tipo: ${config.diabetesType}.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const parseGlucometerData = async ({ content, isBase64, mimeType }: any): Promise<ImportedGlucoseEntry[]> => {
  const model = genAI.getGenerativeModel({ model: AI_MODEL });
  const prompt = "Extrae registros de glucosa JSON: date (ISO), value (mg/dL).";
  const parts = isBase64 ? [{ text: prompt }, { inlineData: { data: content, mimeType } }] : [{ text: prompt + content }];
  const result = await model.generateContent({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: "application/json" } });
  return JSON.parse(result.response.text());
};