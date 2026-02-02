import React, { useState, useMemo } from 'react';
import type { HistoryEntry, UserData, InsulinRatioSegment } from '../types';
import { X, Check, Activity, Zap, Utensils, Clock } from 'lucide-react';

interface SaveModalProps {
  totalCarbs: number;
  currentUser: UserData; // Añadimos el usuario para leer sus ratios
  onClose: () => void;
  onSave: (mealType: HistoryEntry['mealType'], glucose?: number, insulin?: number, ratioUsed?: number) => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ totalCarbs, currentUser, onClose, onSave }) => {
  const [mealType, setMealType] = useState<HistoryEntry['mealType']>('almuerzo');
  const [glucose, setGlucose] = useState<string>('');

  // LÓGICA DE RATIO DINÁMICO SEGÚN HORARIO (Cerebro de Vitametra)
  const activeRatio = useMemo(() => {
    const schedule = currentUser?.insulinRatioSchedule || [];
    if (schedule.length === 0) return 15; // Default de seguridad

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Ordenamos y buscamos el ratio que corresponde a esta hora
    const sorted = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
    let ratio = sorted[sorted.length - 1].ratio; // Por defecto el último del día anterior
    
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
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center animate-in fade-in duration-300">
      {/* Overlay con desenfoque profundo */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        
        {/* CABECERA (Imagen 6) */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-[900] uppercase tracking-widest mb-3">
              <Zap size={12} fill="currentColor" /> Análisis Metabólico PRO
            </div>
            <h2 className="text-4xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
              Confirmar <br />
              <span className="text-blue-600">Registro</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="px-10 pb-12 space-y-8">
          
          {/* INPUT DE GLUCEMIA (Protagonista de la calibración) */}
          <div className="text-center space-y-3">
            <label className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
              Glucemia Actual (Pre-Prandial)
            </label>
            <div className="relative group">
              <input 
                type="number" 
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="---"
                className="w-full bg-slate-50 border-none rounded-[3rem] py-12 text-center text-7xl font-[1000] text-slate-900 focus:bg-white focus:ring-8 focus:ring-blue-50 transition-all outline-none placeholder:text-slate-100"
                autoFocus
              />
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-300 font-black text-[10px] uppercase tracking-widest">
                mg / dL
              </span>
            </div>
          </div>

          {/* GRID DE DATOS TÉCNICOS (Estilo Apple Health) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Utensils size={12} /> Carbohidratos
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-[1000] text-slate-800 tracking-tighter">{totalCarbs.toFixed(0)}</span>
                <span className="text-slate-400 font-black text-[10px] uppercase">g</span>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-xl shadow-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <Activity size={40} className="text-white" />
              </div>
              <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Zap size={12} fill="white" /> Sugerencia IA
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-[1000] text-white tracking-tighter">{suggestedInsulin}</span>
                <span className="text-blue-100 font-black text-[10px] uppercase">ui</span>
              </div>
              <p className="text-[8px] font-bold text-blue-200 uppercase mt-1">Ratio {activeRatio}:1</p>
            </div>
          </div>

          {/* SELECTOR DE MOMENTO */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
                <Clock size={12} className="text-slate-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contexto de la ingesta</p>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['desayuno', 'almuerzo', 'cena', 'snack-tarde'].map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type as HistoryEntry['mealType'])}
                  className={`flex-1 px-5 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    mealType === type 
                      ? 'bg-slate-900 text-white shadow-xl scale-105' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* BOTÓN DE GUARDADO PROFESIONAL */}
          <button 
            onClick={() => onSave(mealType, Number(glucose), Number(suggestedInsulin), activeRatio)}
            className="w-full bg-blue-600 text-white p-7 rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-100 group"
          >
            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                <Check size={24} strokeWidth={4} />
            </div>
            <span className="text-sm font-[1000] tracking-[0.15em] uppercase italic">Guardar y Calibrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;