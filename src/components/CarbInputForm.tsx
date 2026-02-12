import React, { useState } from 'react';
import { MetraCore } from '../services/metraCore';
import { Camera, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { type UserData, type AnalysisResult, type HistoryEntry, type MealType } from '../types';

interface CarbInputFormProps {
  currentUser: UserData;
  onAnalysisComplete: (result: AnalysisResult, historyEntry: HistoryEntry) => void;
}

const CarbInputForm: React.FC<CarbInputFormProps> = ({ currentUser, onAnalysisComplete }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const result = await MetraCore.analyzeMeal(input, currentUser);
      
      // Definimos explícitamente el tipo de comida para que coincida con MealType
      const defaultMealType: MealType = 'almuerzo';

      // MAPEO ESTRICTO SEGÚN TU INTERFAZ TYPES.TS
      // Nota: Asegúrate de que todos los campos requeridos en types.ts estén aquí.
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        userId: currentUser.id || 'anonymous',
        date: new Date().toISOString(),
        createdAt: new Date(), 
        mealType: defaultMealType,
        userInput: input,
        totalCarbs: result.totalCarbs,
        bloodGlucoseValue: 0,
        finalInsulinUnits: 0,
        isCalibrated: false,
        // Campos opcionales inicializados para evitar que TS se queje si cambias la interfaz a requerida
        mood: '',
        physicalActivityLevel: 'medio'
      };

      onAnalysisComplete(result, historyEntry);
      setInput('');
    } catch (error) {
      console.error("Error Vitametra Core:", error);
      alert("No se pudo analizar la comida. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Analizador</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Vitametra AI Core</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿Qué vas a comer?"
            className="w-full h-32 p-6 bg-slate-50 border-none rounded-[2rem] font-bold text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none shadow-inner"
          />
          <button
            type="button"
            className="absolute bottom-4 right-4 p-3 bg-white text-slate-400 rounded-xl shadow-sm hover:text-blue-600 hover:scale-110 active:scale-90 transition-all"
          >
            <Camera size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isAnalyzing}
          className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-bold text-sm shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Procesando...
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-blue-400" />
              Calcular dosis
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CarbInputForm;