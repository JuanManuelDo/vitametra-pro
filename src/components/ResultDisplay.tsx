import React, { useState, useEffect } from 'react';
import { 
  Zap, Activity, Flame, TrendingDown, 
  CheckCircle2, Calculator, Info, AlertCircle 
} from 'lucide-react';
import type { AnalysisResult, UserData, InsulinRatioSegment } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
  currentUser: UserData | null;
  onLogEntry: () => void;
  onAdjust: () => void;
  onLoginRequest?: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, currentUser, onLogEntry, onAdjust }) => {
  const [currentGlucose, setCurrentGlucose] = useState<number>(0);
  const [suggestedDose, setSuggestedDose] = useState<number>(0);

  // 1. Encontrar el Ratio I:C actual basado en la hora del sistema
  const getCurrentRatio = (): number => {
    if (!currentUser?.insulinRatioSchedule || currentUser.insulinRatioSchedule.length === 0) return 15; // Default seguro
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Ordenar por hora y buscar el segmento correspondiente
    const sortedSchedule = [...currentUser.insulinRatioSchedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const currentSegment = sortedSchedule.reverse().find(s => currentTime >= s.startTime) || sortedSchedule[0];
    
    return currentSegment.ratio;
  };

  // 2. Calcular la dosis total (Comida + Corrección)
  useEffect(() => {
    const ratio = getCurrentRatio();
    const isf = currentUser?.clinicalConfig?.insulinSensitivityFactor || 50;
    const target = currentUser?.clinicalConfig?.targetGlucose || 100;

    const mealDose = result.totalCarbs / ratio;
    const correctionDose = currentGlucose > target ? (currentGlucose - target) / isf : 0;
    
    // Redondear a 1 decimal (ej: 4.5 unidades)
    setSuggestedDose(Math.round((mealDose + correctionDose) * 10) / 10);
  }, [currentGlucose, result.totalCarbs, currentUser]);

  const getIGStyles = (ig: string) => {
    switch (ig?.toLowerCase()) {
      case 'alto': return 'text-red-500 bg-red-50 border-red-100';
      case 'medio': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="mt-8 space-y-6 animate-fade-in max-w-2xl mx-auto pb-20">
      
      {/* CARD DE RESULTADO IA */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl border-l border-b font-black text-[10px] uppercase tracking-widest ${getIGStyles(result.glycemicIndex)}`}>
            Índice Glucémico: {result.glycemicIndex}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Cómputo MetraCore v1</span>
            </div>
            <h3 className="text-7xl font-[1000] text-slate-900 tracking-tighter">
              {result.totalCarbs}<span className="text-xl text-slate-300 font-bold ml-2 tracking-normal uppercase">g CH</span>
            </h3>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE CÁLCULO CLÍNICO (BOLUS CALCULATOR) */}
      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                    <Calculator size={20} className="text-white" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Calculadora de Bolo sugerido</h4>
            </div>
            <div className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                <Info size={12} /> Ratio actual: 1u / {getCurrentRatio()}g
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Input de Glucosa para Corrección */}
            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-2">Glucemia Actual (Opcional)</label>
                <div className="flex items-center gap-3">
                    <input 
                        type="number"
                        placeholder="mg/dL"
                        value={currentGlucose || ''}
                        onChange={(e) => setCurrentGlucose(Number(e.target.value))}
                        className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-2xl font-black text-white w-full outline-none focus:ring-2 ring-white/50 placeholder:text-blue-300"
                    />
                </div>
            </div>

            {/* Resultado de Dosis */}
            <div className="bg-white/10 rounded-3xl p-6 text-center border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">Dosis Sugerida</p>
                <div className="text-5xl font-black text-white">
                    {suggestedDose} <span className="text-lg font-bold">unidades</span>
                </div>
            </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-[10px] text-blue-100 bg-blue-700/30 p-3 rounded-xl border border-blue-500/20 leading-relaxed font-medium">
            <AlertCircle size={14} className="flex-shrink-0" />
            Esta sugerencia se basa en tus ratios clínicos configurados. Siempre verifica con tus síntomas antes de inyectar.
        </div>
      </div>

      {/* ANÁLISIS BIO-HISTÓRICO */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 p-4">
            <Activity size={80} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <TrendingDown size={20} className="text-blue-400" />
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">Análisis Metabólico</h4>
            </div>
            <p className="text-lg font-medium leading-relaxed italic">
                "{result.optimizationTip || "Alimento con carga glicémica moderada. Considera caminar 15 minutos después de ingerirlo."}"
            </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
          <button 
              onClick={onLogEntry}
              className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl"
          >
              Guardar en Historial
          </button>
          <button 
              onClick={onAdjust}
              className="bg-slate-100 text-slate-500 px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
              Ajustar
          </button>
      </div>

    </div>
  );
};

export default ResultDisplay;