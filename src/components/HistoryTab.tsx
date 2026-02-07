import React from 'react'
import { Clock, ChevronRight, Utensils, Zap, Activity, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import { type HistoryEntry } from '../types'

interface Props {
  history: HistoryEntry[];
  onEntryClick?: (entry: HistoryEntry) => void;
}

export const HistoryTab: React.FC<Props> = ({ history, onEntryClick }) => {
  
  const getMealTypeStyles = (type: string) => {
    const styles: Record<string, { bg: string, text: string, dot: string }> = {
      desayuno: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
      almuerzo: { bg: 'bg-blue-50', text: 'text-[#007AFF]', dot: 'bg-[#007AFF]' },
      cena: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' },
    };
    const style = styles[type.toLowerCase()] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };
    return style;
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100">
          <Utensils size={32} className="text-slate-200" />
        </div>
        <h3 className="text-2xl font-[1000] text-slate-800 uppercase italic tracking-tighter">Sin registros</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-[200px] leading-relaxed">
          Tu motor metabólico está listo para el primer análisis
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 px-6">
      {/* HEADER 10X - CONTEXTO RÁPIDO */}
      <div className="flex items-end justify-between mb-10 border-b border-slate-50 pb-6">
        <div>
          <h3 className="text-[10px] font-[900] text-slate-300 uppercase tracking-[0.4em] mb-2 italic">
            Bio-Timeline 2026
          </h3>
          <h2 className="text-4xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
            Cronología <span className="text-[#007AFF]">Metabólica</span>
          </h2>
        </div>
        <div className="text-right">
          <span className="text-2xl font-[1000] text-[#007AFF] italic leading-none">{history.length}</span>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Eventos</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((entry) => {
          const mealStyle = getMealTypeStyles(entry.mealType);
          return (
            <div 
              key={entry.id}
              onClick={() => onEntryClick?.(entry)}
              className="group relative bg-white rounded-[2.8rem] p-6 flex items-center gap-6 border border-slate-50 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer active:scale-[0.98]"
            >
              {/* INDICADOR DE STATUS IA - BARRA LATERAL SUTIL */}
              <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full ${entry.isCalibrated ? 'bg-[#34C759]' : 'bg-amber-400 animate-pulse'}`} />

              {/* VISUAL CORE: IMAGEN CON MÁSCARA APPLE */}
              <div className="relative h-28 w-28 flex-shrink-0">
                <div className="h-full w-full rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner">
                  <img 
                    src={entry.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200&auto=format&fit=crop'} 
                    alt={entry.foodName}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.95] group-hover:brightness-100"
                  />
                </div>
                {/* ICONO DE APRENDIZAJE IA */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-xl border-4 border-white shadow-lg flex items-center justify-center ${entry.isCalibrated ? 'bg-[#34C759]' : 'bg-amber-400'}`}>
                  {entry.isCalibrated ? <CheckCircle2 size={14} className="text-white" /> : <Activity size={14} className="text-white" />}
                </div>
              </div>

              {/* DATA CORE: DISEÑO DE INFORMACIÓN DENSO PERO LIMPIO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${mealStyle.bg} border border-transparent`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${mealStyle.dot}`} />
                    <span className={`text-[9px] font-[900] uppercase tracking-widest ${mealStyle.text}`}>{entry.mealType}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <Clock size={11} strokeWidth={2.5} /> 
                    {new Date(entry.createdAt?.seconds * 1000 || entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h4 className="text-slate-900 font-[1000] text-2xl truncate tracking-tighter uppercase italic leading-none mb-4">
                  {entry.foodName || 'Comida Analizada'}
                </h4>
                
                {/* MÉTRICAS 10X */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Carbs Netos</span>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-[1000] text-[#007AFF] leading-none">{entry.totalCarbs}</span>
                        <span className="text-[10px] font-black text-[#007AFF]/50 italic">g</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-100" />
                  
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Insulina</span>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-[1000] text-slate-800 leading-none">
                            {entry.finalInsulinUnits || entry.recommendedInsulinUnits || '0'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 italic">u</span>
                    </div>
                  </div>

                  {entry.bloodGlucoseValue && (
                    <>
                       <div className="w-px h-8 bg-slate-100" />
                       <div className="flex flex-col">
                        <span className="text-[8px] font-black text-[#34C759] uppercase tracking-[0.2em] mb-1">Impacto</span>
                        <div className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-[#34C759]" strokeWidth={3} />
                            <span className="text-lg font-[1000] text-[#34C759] leading-none">{entry.bloodGlucoseValue}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ACCIÓN FINAL */}
              <div className="flex flex-col items-center justify-between self-stretch py-2">
                {!entry.isCalibrated ? (
                    <div className="bg-amber-50 text-amber-500 p-2.5 rounded-[1.2rem] animate-pulse" title="Requiere Calibración">
                        <AlertCircle size={20} />
                    </div>
                ) : <div className="h-10" />}
                <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-[#007AFF] group-hover:text-white transition-all duration-300">
                    <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER CLINICO */}
      <div className="flex flex-col items-center gap-4 pt-12 border-t border-slate-50">
        <div className="flex items-center gap-2 grayscale opacity-30">
            <Zap size={14} fill="currentColor" />
            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Neural Processing Active v4.2</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;