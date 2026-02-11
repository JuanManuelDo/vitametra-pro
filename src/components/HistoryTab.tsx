import React from 'react';
import { 
  Clock, 
  ChevronRight, 
  Utensils, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Droplets
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  onEntryClick?: (entry: HistoryEntry) => void;
}

export const HistoryTab: React.FC<Props> = ({ history, onEntryClick }) => {
  
  const getMealTypeStyles = (type: string) => {
    const styles: Record<string, { bg: string, text: string, dot: string }> = {
      desayuno: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
      almuerzo: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
      cena: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' },
    };
    return styles[type.toLowerCase()] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };
  };

  const getGlucoseStatus = (val?: number) => {
    if (!val) return null;
    if (val > 180) return { color: 'text-rose-500', icon: <TrendingUp size={14} strokeWidth={3} />, label: 'Alto' };
    if (val < 70) return { color: 'text-amber-500', icon: <TrendingDown size={14} strokeWidth={3} />, label: 'Bajo' };
    return { color: 'text-emerald-500', icon: <CheckCircle2 size={14} strokeWidth={3} />, label: 'Rango' };
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-xl shadow-slate-100/50"
        >
          <Utensils size={32} className="text-slate-200" />
        </motion.div>
        <h3 className="text-2xl font-[1000] text-slate-900 tracking-tighter uppercase italic">Archivo Vacío</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-[220px] leading-relaxed">
          Tu historial metabólico comenzará tras tu primer análisis con IA.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-40 px-6 pt-10">
      {/* HEADER DE ALTO IMPACTO */}
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Bio-Timeline v4.2</p>
          <h2 className="text-4xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
            Historial <br/><span className="text-slate-300">Detallado</span>
          </h2>
        </div>
        <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg">
          <span className="text-xl font-black leading-none">{history.length}</span>
          <span className="text-[7px] font-bold uppercase tracking-widest">Logs</span>
        </div>
      </header>

      <div className="space-y-4">
        {history.map((entry, index) => {
          const mealStyle = getMealTypeStyles(entry.mealType);
          const glucoseStatus = getGlucoseStatus(entry.bloodGlucoseValue);
          
          return (
            <motion.div 
              key={entry.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onEntryClick?.(entry)}
              className="group relative bg-white rounded-[2.5rem] p-5 flex flex-col gap-5 border border-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer active:scale-[0.98]"
            >
              {/* LÍNEA DE STATUS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${mealStyle.bg}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${mealStyle.dot}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${mealStyle.text}`}>
                      {entry.mealType}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock size={12} className="text-slate-300" />
                    {new Date(entry.createdAt?.seconds * 1000 || entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {!entry.isCalibrated && (
                  <div className="flex items-center gap-1 text-amber-500 animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Pendiente</span>
                  </div>
                )}
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <div className="h-full w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-50 shadow-inner">
                    <img 
                      src={entry.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200&auto=format&fit=crop'} 
                      alt={entry.foodName}
                      className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-xl border-4 border-white shadow-md flex items-center justify-center ${entry.isCalibrated ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                    {entry.isCalibrated ? <CheckCircle2 size={12} className="text-white" /> : <Activity size={12} className="text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-900 font-black text-xl truncate tracking-tighter uppercase italic mb-3">
                    {entry.foodName || 'Análisis IA'}
                  </h4>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Carbohidratos</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black text-blue-600 leading-none">{entry.totalCarbs}</span>
                        <span className="text-[9px] font-bold text-blue-300 italic">g</span>
                      </div>
                    </div>

                    <div className="w-px h-6 bg-slate-100" />

                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Insulina</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black text-slate-800 leading-none">
                          {entry.finalInsulinUnits || entry.recommendedInsulinUnits || '0'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 italic">ui</span>
                      </div>
                    </div>

                    {entry.bloodGlucoseValue && (
                      <>
                        <div className="w-px h-6 bg-slate-100" />
                        <div className="flex flex-col">
                          <span className={`text-[7px] font-black ${glucoseStatus?.color} uppercase tracking-widest mb-0.5`}>Impacto</span>
                          <div className={`flex items-center gap-1 ${glucoseStatus?.color}`}>
                            {glucoseStatus?.icon}
                            <span className="text-lg font-black leading-none">{entry.bloodGlucoseValue}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ChevronRight size={18} strokeWidth={3} />
                </div>
              </div>

              {/* NOTA CONTEXTUAL IA */}
              {entry.userInput && (
                <div className="px-4 py-3 bg-slate-50/50 rounded-2xl border border-slate-50/50">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic flex gap-2">
                    <Zap size={12} className="text-blue-400 flex-shrink-0" />
                    "{entry.userInput}"
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FOOTER DE ESTADO */}
      <footer className="flex flex-col items-center gap-4 pt-16 opacity-20">
        <Zap size={16} fill="currentColor" className="text-slate-400" />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 text-center">
          Vitametra Neural Engine <br/> Encrypted & Synchronized
        </p>
      </footer>
    </div>
  );
};

export default HistoryTab;