import { analyzeFoodText } from './geminiService';
import { db } from './firebaseService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { AnalysisResult, HistoryEntry, UserData } from '../types';

const ALGORITHM_VERSION = 'v4.6-2026';

export const MetraCore = {
    async findHistoricalImpact(userInput: string, history: HistoryEntry[]): Promise<{ trendMsg: string, adjustment: number }> {
        const safeInput = (userInput || '').toLowerCase().trim();
        if (!safeInput || !Array.isArray(history) || history.length === 0) return { trendMsg: "", adjustment: 0 };
        
        const keywords = safeInput.split(/\s+/).filter(w => w.length > 3);
        
        const similarEntries = history.filter(e => {
            const entryText = (e?.userInput || '').toLowerCase();
            return keywords.some(key => entryText.includes(key));
        }).slice(0, 5);

        if (similarEntries.length === 0) return { trendMsg: "Nuevo patrón detectado.", adjustment: 0 };
        return { trendMsg: "Patrón reconocido.", adjustment: 0 };
    },

    async processMetabolicInference(
        userInput: string, 
        history: HistoryEntry[], 
        user: UserData, 
        currentGlucose: number = 100
    ): Promise<AnalysisResult> {
        const startTime = performance.now();
        
        try {
            const result = await analyzeFoodText(userInput, user);
            const { trendMsg } = await this.findHistoricalImpact(userInput, history);
            
            const finalResult: AnalysisResult = {
                ...result,
                aiContextualNote: trendMsg,
                optimizationTip: result.optimizationTip || "Procesa con normalidad."
            };

            this.logInferencePerformance(userInput, finalResult, startTime);
            return finalResult;
        } catch (error) {
            console.error("MetraCore Error:", error);
            throw new Error("Fallo en la inferencia.");
        }
    },

    async analyzeMeal(text: string, userData: UserData) {
        return await this.processMetabolicInference(text, [], userData);
    },

    async logInferencePerformance(input: string, result: AnalysisResult, start: number) {
        try {
            await addDoc(collection(db, "anonymous_training_logs"), {
                algo: ALGORITHM_VERSION,
                input_len: input.length,
                carbs: result.totalCarbs,
                ms: Math.round(performance.now() - start),
                timestamp: serverTimestamp()
            });
        } catch (e) { /* Error silencioso */ }
    }
};