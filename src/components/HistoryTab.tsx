import React from 'react';
import { Clock, ChevronRight, Utensils, Zap, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { type HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  onEntryClick?: (entry: HistoryEntry) => void;
}

export const HistoryTab: React.FC<Props> = ({ history, onEntryClick }) => {
  
  const getMealTypeStyles = (type: string) => {
    const styles: Record<string, string> = {
      desayuno: 'bg-orange-50 text-orange-600 border-orange-100',
      almuerzo: 'bg-blue-50 text-blue-600 border-blue-100',
      cena: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'snack-manana': 'bg-purple-50 text-purple-600 border-purple-100',
      'snack-tarde': 'bg-purple-50 text-purple-600 border-purple-100',
    };
    return styles[type.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="bg-slate-50 p-8 rounded-[3rem] mb-6 shadow-inner">
          <Utensils size={48} className="text-slate-200" />
        </div>
        <h3 className="text-xl font-[1000] text-slate-800 uppercase italic tracking-tighter">Historial Vacío</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Analiza tu primera comida con IA</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
      <div className="flex items-center justify-between px-2 mb-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Cronología Metabólica
        </h3>
        <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-100">
          {history.length} Registros
        </span>
      </div>

      {history.map((entry) => (
        <div 
          key={entry.id}
          onClick={() => onEntryClick?.(entry)}
          className="group bg-white rounded-[2.5rem] p-5 flex items-center gap-5 border border-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all cursor-pointer active:scale-95"
        >
          {/* MINIATURA CON INDICADOR DE ESTADO IA */}
          <div className="relative h-24 w-24 flex-shrink-0">
            <div className="h-full w-full rounded-[2rem] overflow-hidden shadow-inner bg-slate-100">
                <img 
                src={entry.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200&auto=format&fit=crop'} 
                alt={entry.foodName}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            
            {/* Badge de Calibración (Aprendizaje IA) */}
            <div className={`absolute -bottom-1 -right-1 p-2 rounded-2xl border-4 border-white shadow-lg ${entry.isCalibrated ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}>
                {entry.isCalibrated ? <CheckCircle2 size={14} className="text-white" /> : <Activity size={14} className="text-white" />}
            </div>
          </div>

          {/* CUERPO DE LA TARJETA */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${getMealTypeStyles(entry.mealType)}`}>
                {entry.mealType}
              </span>
              <span className="text-[10px] text-slate-400 font-black flex items-center gap-1 uppercase tracking-tighter">
                <Clock size={10} strokeWidth={3} /> 
                {new Date(entry.createdAt?.seconds * 1000 || entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <h4 className="text-slate-900 font-[1000] text-xl truncate tracking-tighter uppercase italic leading-none">
              {entry.foodName || 'Comida Analizada'}
            </h4>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Carbohidratos</span>
                <span className="text-sm font-[1000] text-blue-600 leading-none">{entry.totalCarbs}g</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Insulina</span>
                <span className="text-sm font-[1000] text-slate-800 leading-none">
                    {entry.finalInsulinUnits || entry.recommendedInsulinUnits || '0'}u
                </span>
              </div>
              {entry.bloodGlucoseValue && (
                <>
                   <div className="w-px h-6 bg-slate-100" />
                   <div className="flex flex-col">
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Glucemia</span>
                    <span className="text-sm font-[1000] text-emerald-600 leading-none">{entry.bloodGlucoseValue}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {!entry.isCalibrated && (
                <div className="bg-amber-50 text-amber-600 p-2 rounded-xl" title="Requiere Calibración">
                    <AlertCircle size={18} />
                </div>
            )}
            <ChevronRight size={24} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      ))}

      {/* FOOTER INFORMATIVO */}
      <div className="text-center pt-8 opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Engine de Aprendizaje Activo v4.0</p>
      </div>
    </div>
  );
};

export default HistoryTab;