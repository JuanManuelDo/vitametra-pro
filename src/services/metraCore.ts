import { analyzeFoodText } from './geminiService';
import { db } from './firebaseService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AnalysisResult, HistoryEntry, UserData, MetabolicPrediction } from '../types';

const ALGORITHM_VERSION = 'v4.6-BIO-PRECISION-2026';

export const MetraCore = {
    /**
     * @patent Búsqueda por Semántica de Texto
     * Analiza el historial para detectar patrones específicos de este usuario.
     */
    async findHistoricalImpact(userInput: string, history: HistoryEntry[]): Promise<{ trendMsg: string, adjustment: number }> {
        const safeInput = (userInput || '').toLowerCase().trim();
        if (!safeInput || !Array.isArray(history) || history.length === 0) return { trendMsg: "", adjustment: 0 };
        
        const keywords = safeInput.split(/\s+/).filter(w => w.length > 3);
        
        const similarEntries = history.filter(e => {
            const entryText = (e?.foodName || '').toLowerCase();
            return keywords.some(key => entryText.includes(key)) && typeof e?.glucosePost2h === 'number';
        }).slice(0, 5);

        if (similarEntries.length === 0) return { trendMsg: "Nuevo patrón detectado. Iniciando aprendizaje.", adjustment: 0 };

        const avgPostGlucose = similarEntries.reduce((acc, curr) => acc + (curr.glucosePost2h || 0), 0) / similarEntries.length;
        
        if (avgPostGlucose > 180) {
            return { 
                trendMsg: `Alerta: Comidas similares te han dejado alto (${Math.round(avgPostGlucose)} mg/dL). Aplicando corrección preventiva.`, 
                adjustment: 0.15 // Aumenta la dosis un 15%
            };
        }
        return { trendMsg: "Tu metabolismo procesa bien estos alimentos.", adjustment: 0 };
    },

    /**
     * Motor de Inferencia Metabólica Avanzada
     * Calcula la dosis basándose en: Carbos (IA) + Historial (Semántica) + Glucemia Actual (Precisión)
     */
    async processMetabolicInference(
        userInput: string, 
        history: HistoryEntry[], 
        user: UserData, 
        currentGlucose: number = 100
    ): Promise<AnalysisResult> {
        const startTime = performance.now();
        
        try {
            // 1. Análisis Nutricional (IA Gemini con Contexto)
            const result = await analyzeFoodText(userInput, user, history);
            
            // 2. Correlación Histórica (Many-Shot Learning)
            const { trendMsg, adjustment: historyAdjustment } = await this.findHistoricalImpact(userInput, history);
            
            // 3. Parámetros Clínicos del Perfil
            const targetGlucose = 100; 
            const ISF = user.clinicalConfig?.isf || 50; // Factor de sensibilidad
            const baseRatio = user.clinicalConfig?.insulinToCarbRatio || 10;
            
            // 4. CÁLCULO DUAL (Fórmula Maestra Vitametra)
            // A. Bolus por Carbohidratos (ajustado por historial)
            const effectiveRatio = baseRatio * (1 - historyAdjustment);
            const bolusCarbs = result.totalCarbs / (effectiveRatio || 10);
            
            // B. Bolus de Corrección (por glucemia actual)
            let bolusCorrection = 0;
            if (currentGlucose > targetGlucose) {
                bolusCorrection = (currentGlucose - targetGlucose) / ISF;
            }

            const finalInsulin = bolusCarbs + bolusCorrection;

            const prediction: MetabolicPrediction = {
                suggestedCarbs: result.totalCarbs,
                suggestedInsulin: parseFloat(finalInsulin.toFixed(1)),
                correlationFactor: historyAdjustment,
                algorithmVersion: ALGORITHM_VERSION,
                glycemicImpact: result.glycemicIndex || 'medio',
                trendInsight: trendMsg,
                inferenceLogs: `ISF:${ISF} | Ratio:${effectiveRatio.toFixed(1)} | Corr:${bolusCorrection.toFixed(1)}`
            };

            // 5. Telemetría y Log de Entrenamiento
            this.logInferencePerformance(userInput, result, historyAdjustment, startTime);

            return { ...result, prediction };
        } catch (error) {
            console.error("MetraCore Critical Failure:", error);
            throw new Error("Fallo en la inferencia. Intenta de nuevo.");
        }
    },

    async logInferencePerformance(input: string, result: any, adj: number, start: number) {
        try {
            await addDoc(collection(db, "anonymous_training_logs"), {
                algo: ALGORITHM_VERSION,
                input_len: input.length,
                carbs: result.totalCarbs,
                adj,
                ms: Math.round(performance.now() - start),
                timestamp: serverTimestamp()
            });
        } catch (e) { /* Fail-safe */ }
    }
};