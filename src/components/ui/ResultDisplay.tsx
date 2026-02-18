import React, { useState, useEffect } from 'react';
import { Zap, Activity, Calculator, Info, AlertCircle, Save, RefreshCcw, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AnalysisResult, UserData } from '../types';

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

  const getCurrentRatio = (): number => {
    if (!currentUser?.insulinRatioSchedule || currentUser.insulinRatioSchedule.length === 0) return 12;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const sortedSchedule = [...currentUser.insulinRatioSchedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const currentSegment = sortedSchedule.reverse().find(s => currentTime >= s.startTime) || sortedSchedule[0];
    return currentSegment.ratio;
  };

  useEffect(() => {
    const ratio = getCurrentRatio();
    const isf = currentUser?.clinicalConfig?.insulinSensitivityFactor || 50;
    const target = currentUser?.clinicalConfig?.targetGlucose || 100;
    const mealDose = result.totalCarbs / ratio;
    const correctionDose = currentGlucose > target ? (currentGlucose - target) / isf : 0;
    setSuggestedDose(Math.round((mealDose + correctionDose) * 10) / 10);
  }, [currentGlucose, result.totalCarbs, currentUser]);

  const getIGStyles = (ig: string) => {
    switch (ig?.toLowerCase()) {
      case 'alto': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'medio': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto pb-32 px-4 antialiased">
      
      {/* CARD PRINCIPAL: CARBS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-50 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
        <div className="absolute top-0 right-0">
            <div className={`px-8 py-3 rounded-bl-[2rem] border-l border-b font-[1000] text-[10px] uppercase tracking-[0.2em] shadow-sm ${getIGStyles(result.glycemicIndex)}`}>
                Índice Glicémico: {result.glycemicIndex}
            </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Carga de Carbohidratos</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-8xl font-[1000] text-slate-900 tracking-tighter italic leading-none">
                {result.totalCarbs}
            </h3>
            <span className="text-3xl text-indigo-600 font-[1000] mb-2 italic">g</span>
          </div>
          <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px]">Análisis Bio-Digital verificado por Vitametra IA</p>
        </div>
      </div>

      {/* CALCULADORA DE BOLO PREMIUM */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Calculator size={22} className="text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Cálculo de Dosis</h4>
                    <p className="text-sm font-bold text-white/60">Bio-Protocolo 1u : {getCurrentRatio()}g</p>
                </div>
            </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 ml-2">Glucosa Actual (mg/dL)</label>
                <div className="relative">
                    <input 
                        type="number"
                        inputMode="numeric"
                        placeholder="000"
                        value={currentGlucose || ''}
                        onChange={(e) => setCurrentGlucose(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-4xl font-[1000] text-white w-full outline-none focus:ring-4 ring-indigo-500/20 transition-all placeholder:text-white/10 italic tracking-tighter"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <Activity size={24} className="text-white/20" />
                    </div>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 text-center border border-white/10 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-2 leading-none">Bolo Recomendado</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-7xl font-[1000] text-white italic tracking-tighter">{suggestedDose}</span>
                        <span className="text-2xl font-black text-indigo-400 mt-4 italic uppercase">u</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="relative mt-8 flex items-start gap-3 p-5 bg-white/5 rounded-2xl border border-white/5">
            <AlertCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-white/50 uppercase font-black leading-relaxed tracking-widest">
                Esta es una sugerencia algorítmica. Valida siempre con tus síntomas y el protocolo de tu especialista médico.
            </p>
        </div>
      </div>

      {/* OPTIMIZACIÓN IA */}
      <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Sparkles size={16} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Bio-Insight IA</h4>
        </div>
        <p className="text-xl font-bold italic text-slate-800 leading-tight">
            "{result.optimizationTip || "Carga metabólica equilibrada para tu perfil."}"
        </p>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
              onClick={onLogEntry}
              className="flex-[2] bg-slate-900 text-white py-7 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all active:scale-95 group"
          >
              <Save size={20} className="text-indigo-400 group-hover:text-white transition-colors" />
              Sincronizar Log
          </button>
          <button 
              onClick={onAdjust}
              className="flex-1 bg-white text-slate-400 border border-slate-100 py-7 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
          >
              <RefreshCcw size={20} />
              Ajustar
          </button>
      </div>

    </div>
  );
};

export default ResultDisplay;