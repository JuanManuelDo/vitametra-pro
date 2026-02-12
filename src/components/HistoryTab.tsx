import React from 'react';
import { 
  Clock, 
  ChevronRight, 
  Utensils, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Activity
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
    if (val > 180) return { color: 'text-rose-500', icon: <TrendingUp size={14} />, label: 'Alto' };
    if (val < 70) return { color: 'text-amber-500', icon: <TrendingDown size={14} />, label: 'Bajo' };
    return { color: 'text-emerald-500', icon: <CheckCircle2 size={14} />, label: 'Rango' };
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Utensils size={32} className="text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase">Sin registros</h3>
        <p className="text-slate-400 text-xs mt-2">Tus análisis aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-40 px-6 pt-10">
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Historial</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Mis <br/><span className="text-slate-300">registros</span>
          </h2>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center gap-2">
          <span className="text-xl font-black">{history.length}</span>
          <span className="text-[9px] font-bold uppercase">Total</span>
        </div>
      </header>

      <div className="space-y-4">
        {history.map((entry, index) => {
          const mealStyle = getMealTypeStyles(entry.mealType || '');
          const glucoseStatus = getGlucoseStatus(entry.bloodGlucoseValue);
          
          return (
            <motion.div 
              key={entry.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onEntryClick?.(entry)}
              className="group bg-white rounded-[2rem] p-5 border border-slate-50 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full ${mealStyle.bg}`}>
                    <span className={`text-[9px] font-bold uppercase ${mealStyle.text}`}>
                      {entry.mealType || 'Comida'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(entry.createdAt?.seconds * 1000 || entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={entry.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200&auto=format&fit=crop'} 
                    className="h-full w-full object-cover"
                    alt=""
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-900 font-black text-lg truncate uppercase italic mb-2">
                    {entry.foodName || 'Análisis IA'}
                  </h4>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Carbohidratos</span>
                      <span className="text-lg font-black text-blue-600">{entry.totalCarbs}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Insulina</span>
                      <span className="text-lg font-black text-slate-800">{entry.finalInsulinUnits || entry.recommendedInsulinUnits || '0'}u</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTab;