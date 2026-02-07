import React from 'react';
import { Flame, TrendingUp, Award } from 'lucide-react';

interface StreakCardProps {
  days: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ days }) => {
  const hasStreak = days > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group overflow-hidden relative">
      {/* Decoración de fondo sutil */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl transition-colors duration-1000 ${
        hasStreak ? 'bg-orange-100 opacity-60' : 'bg-slate-50 opacity-0'
      }`} />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl transition-all duration-500 ${
          hasStreak 
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110' 
            : 'bg-slate-50 text-slate-300'
        }`}>
          <Flame size={24} fill={hasStreak ? "currentColor" : "none"} className={hasStreak ? "animate-pulse" : ""} />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-[1000] text-slate-300 uppercase tracking-[0.2em]">Bio-Status</span>
          <div className="flex items-center gap-1 justify-end text-[#34C759]">
            <TrendingUp size={12} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Activo</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <span className={`text-6xl font-[1000] italic leading-none tracking-tighter transition-colors duration-500 ${
            hasStreak ? 'text-slate-900' : 'text-slate-200'
          }`}>
            {days}
          </span>
          <span className="text-sm font-[1000] text-slate-400 uppercase italic">Días</span>
        </div>
        
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-4 leading-tight">
          Racha de Consistencia <br />
          <span className={hasStreak ? "text-orange-500" : "text-slate-300"}>
            {hasStreak ? "¡Mantén el fuego metabólico!" : "Inicia tu racha hoy"}
          </span>
        </p>
      </div>

      {/* Footer del card con mini logro */}
      <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasStreak ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-50 text-slate-200'}`}>
            <Award size={14} />
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">
            Próximo hito: 3 días
          </span>
        </div>
        <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-1000" 
            style={{ width: `${(days / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};