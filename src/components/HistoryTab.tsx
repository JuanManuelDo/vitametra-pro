import React from 'react';
import { 
  Clock, 
  ChevronRight, 
  Utensils, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { type HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  onEntryClick?: (entry: HistoryEntry) => void;
}

export const HistoryTab: React.FC<Props> = ({ history, onEntryClick }) => {
  
  // Lógica de estilos por tipo de comida unificada a la marca
  const getMealTypeStyles = (type: string) => {
    const styles: Record<string, { bg: string, text: string }> = {
      desayuno: { bg: 'bg-orange-50', text: 'text-orange-600' },
      almuerzo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
      cena: { bg: 'bg-blue-50', text: 'text-blue-600' },
      snack: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    };
    return styles[type.toLowerCase()] || { bg: 'bg-slate-50', text: 'text-slate-500' };
  };

  const getGlucoseStatus = (val?: number) => {
    if (!val) return null;
    if (val > 180) return { color: 'text-rose-500', icon: <TrendingUp size={14} />, label: 'Alto' };
    if (val < 70) return { color: 'text-amber-500', icon: <TrendingDown size={14} />, label: 'Bajo' };
    return { color: 'text-emerald-500', icon: <CheckCircle2 size={14} />, label: 'En Rango' };
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center px-6">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 flex items-center justify-center mb-8">
          <Utensils size={40} className="text-slate-200" />
        </div>
        <h3 className="text-xl font-[1000] text-slate-900 uppercase italic tracking-tighter">Memoria Vacía</h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-[200px]">Comienza a analizar tus comidas para generar tendencias.</p>
      </div>
    );
  }

  // Cálculos rápidos para el Header
  const totalCarbs = history.reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0);

  return (
    <div className="max-w-md mx-auto space-y-8 pb-40 px-6 pt-10 antialiased">
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col gap-6 mb-12">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Ecosistema Bio-Data</p>
            <h2 className="text-5xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
              Mis <br/><span className="text-indigo-600/20">Tendencias</span>
            </h2>
          </div>
          <div className="bg-slate-900 text-white p-4 rounded-[2rem] shadow-xl flex flex-col items-center min-w-[70px]">
            <span className="text-2xl font-[1000] leading-none">{history.length}</span>
            <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-60">Logs</span>
          </div>
        </div>

        {/* INSIGHT CARDS */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-600 p-4 rounded-[2rem] text-white shadow-lg shadow-indigo-100">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                    <Zap size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Carga Semanal</span>
                </div>
                <p className="text-2xl font-[1000] italic">{totalCarbs}g</p>
                <p className="text-[7px] font-bold uppercase opacity-60">Carbohidratos Netos</p>
            </div>
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Sparkles size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Estado IA</span>
                </div>
                <p className="text-2xl font-[1000] italic text-slate-900">Activo</p>
                <p className="text-[7px] font-bold uppercase text-slate-400">Patrones detectados</p>
            </div>
        </div>
      </header>

      {/* LISTA DE REGISTROS */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Cronología Metabólica</h3>
        {history.map((entry, index) => {
          const mealStyle = getMealTypeStyles(entry.mealType || '');
          const glucoseStatus = getGlucoseStatus(entry.bloodGlucoseValue);
          
          return (
            <motion.div 
              key={entry.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onEntryClick?.(entry)}
              className="group bg-white rounded-[2.5rem] p-5 border border-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-100/30 transition-all cursor-pointer active:scale-[0.97]"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className={`px-4 py-1.5 rounded-full ${mealStyle.bg}`}>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${mealStyle.text}`}>
                      {entry.mealType || 'Análisis'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full text-slate-400">
                    <Clock size={10} />
                    <span className="text-[9px] font-bold">
                        {new Date(entry.createdAt?.seconds * 1000 || entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {glucoseStatus && (
                    <div className={`flex items-center gap-1.5 ${glucoseStatus.color}`}>
                        {glucoseStatus.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest">{glucoseStatus.label}</span>
                    </div>
                )}
              </div>

              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 shrink-0">
                  <div className="absolute inset-0 bg-indigo-600/10 rounded-[1.8rem] -rotate-6 group-hover:rotate-0 transition-transform" />
                  <img 
                    src={entry.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200&auto=format&fit=crop'} 
                    className="relative h-full w-full object-cover rounded-[1.8rem] shadow-md group-hover:scale-105 transition-transform"
                    alt=""
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-900 font-[1000] text-xl truncate uppercase italic tracking-tighter mb-3 leading-none">
                    {entry.foodName || 'Carga de Datos'}
                  </h4>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbos</span>
                      <span className="text-xl font-[1000] text-indigo-600 leading-none">{entry.totalCarbs}g</span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-100 self-end mb-1" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Insulina</span>
                      <span className="text-xl font-[1000] text-slate-900 leading-none">
                        {entry.finalInsulinUnits || entry.recommendedInsulinUnits || '0'}
                        <span className="text-[10px] ml-0.5">U</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <footer className="pt-10 pb-20 text-center">
         <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-full border border-slate-100">
            <Calendar size={14} className="text-indigo-600" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronización Completa</span>
         </div>
      </footer>
    </div>
  );
};

export default HistoryTab;