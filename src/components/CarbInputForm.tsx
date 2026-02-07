import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { MetraCore } from '../services/metraCore'; // Corregido: comilla simple única
import { Zap, Camera, Send, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { type UserData, type AnalysisResult, type HistoryEntry } from '../types';

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
      // Usamos el servicio MetraCore para el análisis metabólico
      const result = await MetraCore.analyzeMeal(input, currentUser);
      
      // Creamos la entrada para el historial
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description: input,
        carbs: result.carbs,
        insulin: result.suggestedInsulin,
        type: 'meal'
      };

      onAnalysisComplete(result, historyEntry);
      setInput('');
    } catch (error) {
      console.error("Error analizando carbohidratos:", error);
      alert("La conexión con el Bio-Core falló. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-metra-blue/10 p-3 rounded-2xl text-metra-blue">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h3 className="text-lg font-[1000] text-metra-dark uppercase italic tracking-tighter">Análisis IA</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metabolic Input v3.1</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: Dos tacos al pastor con piña y una coca zero..."
            className="w-full h-32 p-6 bg-slate-50 border-none rounded-[2rem] font-bold text-sm text-metra-dark placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-metra-blue/10 transition-all resize-none"
          />
          <button
            type="button"
            className="absolute bottom-4 right-4 p-3 bg-white text-slate-400 rounded-xl shadow-sm hover:text-metra-blue transition-colors"
          >
            <Camera size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isAnalyzing}
          className="w-full bg-metra-dark text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Procesando Bio-Data...
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-metra-blue" />
              Calcular Dosis Precisa
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Zap size={14} className="text-metra-blue" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MetraCore Neural Engine Active</span>
      </div>
    </div>
  );
};

export default CarbInputForm;