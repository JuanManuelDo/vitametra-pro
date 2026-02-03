import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { AnalysisResult, ImportedGlucoseEntry, HistoryEntry, ClinicalReportConfig, UserData } from '../types';

// CONFIGURACIÓN DE NÚCLEO IA
const AI_MODEL = 'gemini-1.5-flash'; 
const API_KEY = "AIzaSyCvKs5Il5CbmxoobL7qWwde_ReYAyet5ws";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * SCHEMA DE NUTRICIÓN CLÍNICA (Garantiza integridad de datos)
 */
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

/**
 * ANALIZADOR 10X (TEXTO + VISIÓN + CONTEXTO)
 */
export const analyzeFoodVision = async (
  content: string, 
  isImage: boolean = false, 
  mimeType: string = 'image/jpeg',
  userContext?: UserData, 
  history: HistoryEntry[] = []
): Promise<AnalysisResult> => {
  
  // Usamos el modelo flash para velocidad máxima (10x UX)
  const model = genAI.getGenerativeModel({ model: AI_MODEL });

  // Aprendizaje de patrones para personalización clínica
  const recentPatterns = history
    .filter(h => h.isCalibrated && (h.glucoseImpact || 0) > 50)
    .slice(0, 5)
    .map(h => `- ${h.foodName}: Impacto ${h.glucoseImpact}mg/dL con ${h.totalCarbs}g carbos.`)
    .join('\n');

  const systemInstruction = `Eres "Vitametra Clinical AI". Analiza alimentos y responde SIEMPRE en JSON.
    CONTEXTO PACIENTE: ${userContext?.subscription_tier || 'BASE'}
    PATRONES PREVIOS: ${recentPatterns || 'Ninguno'}
    CULTURA: Chile (entiende porciones como "una marraqueta", "un chorro", "un puñado").`;

  try {
    const prompt = isImage 
      ? "Analiza detalladamente esta imagen de comida y calcula los valores nutricionales precisos." 
      : `Analiza este plato: ${content}`;

    const parts: any[] = [{ text: prompt }];
    
    if (isImage) {
      parts.push({ inlineData: { data: content, mimeType } });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: NUTRITION_SCHEMA,
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as AnalysisResult;

  } catch (error: any) {
    console.error("AI Analysis Core Error:", error);
    
    // Si el error es 404 o de Schema, intentamos una llamada de emergencia sin Schema
    try {
      const fallbackResult = await model.generateContent(`Analiza "${content}" y devuelve solo el JSON nutricional.`);
      const text = fallbackResult.response.text();
      const cleanedText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(cleanedText) as AnalysisResult;
    } catch (fallbackError) {
      throw new Error("El motor Bio-Core está en mantenimiento. Por favor describe la comida con más detalle.");
    }
  }
};

// Mantenemos compatibilidad con tu función anterior pero redirigiendo al nuevo motor
export const analyzeFoodText = async (text: string, userContext?: UserData, history: HistoryEntry[] = []): Promise<AnalysisResult> => {
  return analyzeFoodVision(text, false, '', userContext, history);
};

export const generateAIClinicalReport = async (history: HistoryEntry[], config: ClinicalReportConfig): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: AI_MODEL });
  const prompt = `Genera un reporte clínico detallado basado en estos datos: ${JSON.stringify(history.slice(0, 20))}. Tipo de Diabetes: ${config.diabetesType}. Enfócate en tendencias y riesgos.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const parseGlucometerData = async ({ content, isBase64, mimeType }: any): Promise<ImportedGlucoseEntry[]> => {
  const model = genAI.getGenerativeModel({ model: AI_MODEL });
  const prompt = "Actúa como un extractor de datos médicos. Extrae registros de glucosa de este archivo y devuélvelos en este formato JSON exacto: Array de objetos con 'date' (formato ISO) y 'value' (número en mg/dL).";
  
  const parts = isBase64 
    ? [{ text: prompt }, { inlineData: { data: content, mimeType } }] 
    : [{ text: prompt + content }];

  const result = await model.generateContent({ 
    contents: [{ role: 'user', parts }], 
    generationConfig: { responseMimeType: "application/json" } 
  });
  
  return JSON.parse(result.response.text());
};