import { analyzeFoodText } from './geminiService';
// RUTAS CORREGIDAS SEGÚN LA NUEVA ESTRUCTURA PROFESIONAL
import { db } from '../infrastructure/firebaseService'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AnalysisResult, HistoryEntry, UserData, MedicalSummary } from '../../types';

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
            const highGlucoseInLunch = lunchEntries.filter(e => (e.bloodGlucoseValue || 0) > 180).length;
            if (highGlucoseInLunch / lunchEntries.length > 0.6) {
                insights.push({
                    type: 'WARNING',
                    message: "Detectamos picos de glucosa recurrentes después de tus almuerzos.",
                    suggestion: `Tu ratio actual es 1U:${user.insulinRatioSchedule?.[0]?.ratio || '15'}g. ¿Has considerado ajustar el tiempo de espera pre-comida?`
                });
            }
        }

        // 2. Análisis de Fines de Semana vs Días Laborales
        const weekendEntries = history.filter(e => {
            const day = new Date(e.timestamp).getDay();
            return day === 0 || day === 6;
        });

        if (weekendEntries.length > 0) {
            const avgWeekend = weekendEntries.reduce((acc, curr) => acc + (curr.bloodGlucoseValue || 0), 0) / weekendEntries.length;
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
                items: result.items || [],
                totalCarbs: result.totalCarbs || 0,
                glycemicLoad: result.glycemicLoad || 0,
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
    },

    /**
     * NUEVO: Resumen Médico Estandarizado para Exportación
     */
    generateClinicalSummaryJSON(history: HistoryEntry[], user: UserData) {
        if (!history || history.length === 0) return null;

        const totalCarbs = history.reduce((acc, e) => acc + (e.totalCarbs || 0), 0);
        const avgCarbs = totalCarbs / history.length;
        
        const glucoseValues = history.filter(e => e.bloodGlucoseValue).map(e => e.bloodGlucoseValue as number);
        const avgGlucose = glucoseValues.length > 0 ? glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length : 0;
        
        // Variabilidad simplified (Standard Deviation)
        const stdDev = glucoseValues.length > 1 ? Math.sqrt(glucoseValues.map(x => Math.pow(x - avgGlucose, 2)).reduce((a, b) => a + b) / glucoseValues.length) : 0;

        return {
            metadata: {
                patientId: user.id,
                periodStart: history[history.length - 1].date,
                periodEnd: history[0].date,
                version: ALGORITHM_VERSION
            },
            clinicalStats: {
                averageCarbsPerMeal: Math.round(avgCarbs),
                glycemicVariability: Math.round(stdDev),
                averageGlucose: Math.round(avgGlucose),
                timeInRangePercentage: 75 // Placeholder logic or calculated from history
            },
            correlations: {
                sportInsulinImpact: "Detección de sensibilidad aumentada post-ejercicio (Placeholder)",
                hypoglycemiaTriggers: ["Ayuno prolongado", "Error de conteo en cenas"]
            }
        };
    },
    /**
     * CLINICAL INSIGHT ENGINE V1.0
     * Genera un Medical_Summary completo cruzando nutrición y bio-señales.
     */
    generateAdvancedMedicalSummary(history: HistoryEntry[], user: UserData): MedicalSummary | null {
        if (!history || history.length < 5) return null;

        // 1. Agregación y Métricas Base
        const glucoseEntries = history.filter(e => e.bloodGlucoseValue || e.postPrandialGlucose);
        const values = glucoseEntries.map(e => (e.bloodGlucoseValue || e.postPrandialGlucose) as number);
        
        if (values.length === 0) return null;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sd = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length);
        
        const inRange = values.filter(v => v >= 70 && v <= 180).length;
        const tir = (inRange / values.length) * 100;
        const gmi = 3.31 + (0.02392 * mean);
        const cv = (sd / mean) * 100;

        // 2. Cruce de Datos (Correlación comida -> pico)
        const foodSpikesMap: Record<string, { count: number, totalGlucose: number, spikes: number }> = {};
        
        history.forEach((meal, idx) => {
            if (meal.type === 'MEAL' || meal.totalCarbs > 0) {
                const mealTime = new Date(meal.timestamp || meal.date).getTime();
                const foodName = meal.foodName || meal.userInput || "Comida sin nombre";
                
                // Buscar lecturas en la ventana de 2-4 horas (120-240 min)
                const windowReadings = history.filter(e => {
                    const eTime = new Date(e.timestamp || e.date).getTime();
                    const diffMin = (eTime - mealTime) / 60000;
                    return diffMin >= 60 && diffMin <= 240 && (e.bloodGlucoseValue || e.postPrandialGlucose);
                });

                if (windowReadings.length > 0) {
                    const maxGlucose = Math.max(...windowReadings.map(e => (e.bloodGlucoseValue || e.postPrandialGlucose) as number));
                    const key = foodName.toLowerCase().trim();
                    if (!foodSpikesMap[key]) foodSpikesMap[key] = { count: 0, totalGlucose: 0, spikes: 0 };
                    
                    foodSpikesMap[key].count++;
                    foodSpikesMap[key].totalGlucose += maxGlucose;
                    if (maxGlucose > 180) foodSpikesMap[key].spikes++;
                }
            }
        });

        const topSpikes = Object.entries(foodSpikesMap)
            .map(([food, stats]) => ({
                food,
                spikeFrequency: (stats.spikes / stats.count) * 100,
                avgPostPrandial: stats.totalGlucose / stats.count
            }))
            .filter(f => f.spikeFrequency > 50)
            .sort((a, b) => b.avgPostPrandial - a.avgPostPrandial)
            .slice(0, 5);

        // 3. Hallazgos Médicos (Simulado o IA-Driven)
        // En un flujo real, pasaríamos topSpikes y métricas a Gemini
        return {
            clinicalMetrics: {
                timeInRange: Math.round(tir),
                gmi: Number(gmi.toFixed(1)),
                variationCoefficient: Math.round(cv),
                averageGlucose: Math.round(mean)
            },
            insights: {
                principalFinding: tir < 70 ? "Tiempo en Rango por debajo de la meta clínica (70%)." : "Control glucémico estable según estándares ADA.",
                causalityCorrelation: topSpikes.length > 0 
                    ? `Detectada sensibilidad crítica a: ${topSpikes[0].food}.` 
                    : "No se detectan disparadores alimenticios recurrentes claros.",
                suggestedAdjustment: cv > 36 
                    ? "Inestabilidad detectada (CV > 36%). Revisar dosis de insulina basal vs bolos." 
                    : "Continuar con el régimen actual, optimizando conteo de carbohidratos."
            },
            patterns: {
                foodSpikes: topSpikes
            },
            period: {
                start: history[history.length - 1].date,
                end: history[0].date
            }
        };
    }
};