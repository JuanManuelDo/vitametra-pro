import { analyzeFoodText } from './geminiService';
// RUTAS CORREGIDAS SEGÚN LA NUEVA ESTRUCTURA PROFESIONAL
import { db } from '../infrastructure/firebaseService'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AnalysisResult, HistoryEntry, UserData } from '../../types';

const ALGORITHM_VERSION = 'v4.7-2026-INSIGHTS';

export interface MetabolicInsight {
    type: 'WARNING' | 'SUCCESS' | 'TIP';
    message: string;
    pattern?: string;
    suggestion?: string;
}

export const MetraCore = {
    /**
     * NUEVO: Analizador de Tendencias Proactivo
     * Escanea el historial en busca de patrones repetitivos (ej. glucosa alta post-almuerzo)
     */
    analyzeMetabolicTrends(history: HistoryEntry[], user: UserData): MetabolicInsight[] {
        const insights: MetabolicInsight[] = [];
        if (!history || history.length < 5) return insights;

        // 1. Detección de Patrón en Almuerzo (12:00 - 15:00)
        const lunchEntries = history.filter(e => {
            const hour = new Date(e.timestamp).getHours();
            return hour >= 12 && hour <= 15;
        });

        if (lunchEntries.length >= 3) {
            const highGlucoseInLunch = lunchEntries.filter(e => e.value > 180).length;
            if (highGlucoseInLunch / lunchEntries.length > 0.6) {
                insights.push({
                    type: 'WARNING',
                    message: "Detectamos picos de glucosa recurrentes después de tus almuerzos.",
                    suggestion: `Tu ratio actual es 1U:${user.clinicalConfig?.insulinRatioSchedule?.[0]?.ratio || '10'}g. ¿Has considerado ajustar el tiempo de espera pre-comida?`
                });
            }
        }

        // 2. Análisis de Fines de Semana vs Días Laborales
        const weekendEntries = history.filter(e => {
            const day = new Date(e.timestamp).getDay();
            return day === 0 || day === 6;
        });

        if (weekendEntries.length > 0) {
            const avgWeekend = weekendEntries.reduce((acc, curr) => acc + curr.value, 0) / weekendEntries.length;
            if (avgWeekend > 160) {
                insights.push({
                    type: 'TIP',
                    message: "Tus niveles tienden a subir los fines de semana.",
                    suggestion: "Pequeños ajustes en la actividad física durante el sábado podrían ayudarte a mantener tu meta."
                });
            }
        }

        return insights;
    },

    async findHistoricalImpact(userInput: string, history: HistoryEntry[]): Promise<{ trendMsg: string, adjustment: number }> {
        const safeInput = (userInput || '').toLowerCase().trim();
        if (!safeInput || !Array.isArray(history) || history.length === 0) {
            return { trendMsg: "", adjustment: 0 };
        }
        
        const keywords = safeInput.split(/\s+/).filter(w => w.length > 3);
        
        const similarEntries = history.filter(e => {
            if (!e || !e.userInput) return false;
            const entryText = e.userInput.toLowerCase();
            return keywords.some(key => entryText.includes(key));
        }).slice(0, 5);

        if (similarEntries.length === 0) return { trendMsg: "Nuevo patrón detectado.", adjustment: 0 };
        return { trendMsg: "Patrón reconocido basado en tu historial previo.", adjustment: 0 };
    },

    async processMetabolicInference(
        userInput: string, 
        history: HistoryEntry[], 
        user: UserData, 
        currentGlucose: number = 100
    ): Promise<AnalysisResult> {
        const startTime = performance.now();
        
        try {
            const analysisString = await analyzeFoodText(userInput);
            
            if (!analysisString) {
                throw new Error("La IA no pudo procesar el texto.");
            }

            let result: any;
            try {
                result = typeof analysisString === 'string' ? JSON.parse(analysisString) : analysisString;
            } catch (e) {
                throw new Error("Formato de respuesta de IA inválido.");
            }

            const { trendMsg } = await this.findHistoricalImpact(userInput, history);
            
            const finalResult: AnalysisResult = {
                totalCarbs: result.totalCarbs || 0,
                calories: result.calories || 0,
                protein: result.protein || 0,
                fat: result.fat || 0,
                glycemicIndex: result.glycemicIndex || 'Bajo',
                aiContextualNote: trendMsg,
                optimizationTip: result.optimizationTip || "Procesa con normalidad."
            };

            this.logInferencePerformance(userInput, finalResult, startTime);
            return finalResult;

        } catch (error: any) {
            console.error("MetraCore Error:", error.message);
            throw new Error(error.message || "Fallo en la inferencia metabólica.");
        }
    },

    async logInferencePerformance(input: string, result: AnalysisResult, start: number) {
        try {
            if (!result) return;
            await addDoc(collection(db, "anonymous_training_logs"), {
                algo: ALGORITHM_VERSION,
                input_len: input?.length || 0,
                carbs: result.totalCarbs || 0,
                ms: Math.round(performance.now() - start),
                timestamp: serverTimestamp()
            });
        } catch (e) { 
            console.warn("Log performance fallido:", e);
        }
    }
};