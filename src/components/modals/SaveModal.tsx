import React, { useState, useMemo } from 'react';
import type { HistoryEntry, UserData, InsulinRatioSegment } from '../../types';
import { X, Check, Activity, Zap, Utensils, Clock } from 'lucide-react';

interface SaveModalProps {
  totalCarbs: number;
  currentUser: UserData;
  onClose: () => void;
  onSave: (mealType: HistoryEntry['mealType'], glucose?: number, insulin?: number, ratioUsed?: number) => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ totalCarbs, currentUser, onClose, onSave }) => {
  const [mealType, setMealType] = useState<HistoryEntry['mealType']>('almuerzo');
  const [glucose, setGlucose] = useState<string>('');

  // LÓGICA DE RATIO DINÁMICO SEGÚN HORARIO (Cerebro de Vitametra)
  const activeRatio = useMemo(() => {
    const schedule = currentUser?.insulinRatioSchedule || [];
    if (schedule.length === 0) return 15;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const sorted = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
    let ratio = sorted[sorted.length - 1].ratio;
    
    for (const segment of sorted) {
      if (currentTime >= segment.startTime) {
        ratio = segment.ratio;
      }
    }
    return ratio;
  }, [currentUser]);

  // Cálculo de dosis sugerida basado en el ratio dinámico
  const suggestedInsulin = useMemo(() => {
    return (totalCarbs / activeRatio).toFixed(1);
  }, [totalCarbs, activeRatio]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300 p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto">
        
        {/* CABECERA */}
        <div className="px-6 pt-6 pb-4 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-[900] uppercase tracking-widest mb-2">
              <Zap size={10} fill="currentColor" /> Análisis Metabólico PRO
            </div>
            <h2 className="text-2xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
              Confirmar <br />
              <span className="text-blue-600">Registro</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8 space-y-6">
          
          {/* INPUT DE GLUCEMIA */}
          <div className="text-center space-y-2">
            <label className="text-slate-400 font-black text-[9px] uppercase tracking-[0.2em]">
              Glucemia Actual (Pre-Prandial)
            </label>
            <div className="relative group">
              <input 
                type="number" 
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="---"
                className="w-full bg-slate-50 border-none rounded-[2rem] py-8 text-center text-5xl font-[1000] text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none placeholder:text-slate-100"
                autoFocus
              />
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-300 font-black text-[9px] uppercase tracking-widest">
                mg / dL
              </span>
            </div>
          </div>

          {/* GRID DE DATOS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Utensils size={10} /> Carbohidratos
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-[1000] text-slate-800 tracking-tighter">{totalCarbs.toFixed(0)}</span>
                <span className="text-slate-400 font-black text-[9px] uppercase">g</span>
              </div>
            </div>

            <div className="bg-blue-600 p-4 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-lg shadow-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-20">
                <Activity size={30} className="text-white" />
              </div>
              <p className="text-[8px] font-black text-blue-100 uppercase tracking-widest mb-1 flex items-center gap-1 relative z-10">
                <Zap size={10} fill="white" /> Sugerencia IA
              </p>
              <div className="flex items-baseline gap-1 relative z-10">
                <span className="text-3xl font-[1000] text-white tracking-tighter">{suggestedInsulin}</span>
                <span className="text-blue-100 font-black text-[9px] uppercase">ui</span>
              </div>
              <p className="text-[7px] font-bold text-blue-200 uppercase mt-1 relative z-10">Ratio {activeRatio}:1</p>
            </div>
          </div>

          {/* SELECTOR DE MOMENTO */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock size={10} className="text-slate-400" />
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Contexto de la ingesta</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['desayuno', 'almuerzo', 'cena', 'snack-tarde'].map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type as HistoryEntry['mealType'])}
                  className={`px-4 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                    mealType === type 
                      ? 'bg-slate-900 text-white shadow-lg scale-105' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* BOTÓN DE GUARDADO */}
          <button 
            onClick={() => onSave(mealType, Number(glucose), Number(suggestedInsulin), activeRatio)}
            className="w-full bg-blue-600 text-white p-5 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 group"
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Check size={20} strokeWidth={4} />
            </div>
            <span className="text-xs font-[1000] tracking-[0.1em] uppercase italic">Guardar y Calibrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;