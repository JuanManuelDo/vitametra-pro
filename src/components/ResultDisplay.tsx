import React, { useState, useEffect } from 'react';
import { Zap, Activity, Calculator, Info, AlertCircle } from 'lucide-react';
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
    if (!currentUser?.insulinRatioSchedule || currentUser.insulinRatioSchedule.length === 0) return 15;
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
      case 'alto': return 'text-red-500 bg-red-50 border-red-100';
      case 'medio': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="mt-8 space-y-6 animate-fade-in max-w-2xl mx-auto pb-20">
      
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl border-l border-b font-bold text-[10px] uppercase tracking-widest ${getIGStyles(result.glycemicIndex)}`}>
            IG: {result.glycemicIndex}
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carbohidratos totales</span>
          </div>
          <h3 className="text-7xl font-black text-slate-900 tracking-tighter">
            {result.totalCarbs}<span className="text-xl text-slate-300 font-bold ml-2">g</span>
          </h3>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <Calculator size={20} />
                <h4 className="text-sm font-bold uppercase tracking-widest">Bolo sugerido</h4>
            </div>
            <div className="text-[10px] font-medium bg-white/10 px-3 py-1 rounded-full">
                Ratio: 1u / {getCurrentRatio()}g
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block mb-2">Glucosa actual</label>
                <input 
                    type="number"
                    placeholder="mg/dL"
                    value={currentGlucose || ''}
                    onChange={(e) => setCurrentGlucose(Number(e.target.value))}
                    className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-2xl font-black text-white w-full outline-none focus:ring-2 ring-white/50 placeholder:text-blue-300"
                />
            </div>

            <div className="bg-white/10 rounded-3xl p-6 text-center border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Dosis total</p>
                <div className="text-5xl font-black text-white">
                    {suggestedDose} <span className="text-lg font-bold">u</span>
                </div>
            </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-[10px] text-blue-100 leading-relaxed font-medium">
            <AlertCircle size={14} className="shrink-0" />
            Sugerencia basada en tus ratios. Verifica siempre con tus síntomas.
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Recomendación</h4>
        </div>
        <p className="text-lg font-medium italic">
            "{result.optimizationTip || "Carga glicémica moderada."}"
        </p>
      </div>

      <div className="flex gap-4 pt-4">
          <button 
              onClick={onLogEntry}
              className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-bold text-sm shadow-xl"
          >
              Guardar
          </button>
          <button 
              onClick={onAdjust}
              className="bg-slate-100 text-slate-500 px-8 rounded-3xl font-bold text-sm"
          >
              Ajustar
          </button>
      </div>

    </div>
  );
};

export default ResultDisplay;