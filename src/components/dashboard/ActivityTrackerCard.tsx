import React from 'react';
import { Dumbbell, TrendingDown, Zap } from 'lucide-react';

interface ActivityProps {
  type: string;
  duration: number;
  intensity: 'Baja' | 'Media' | 'Alta';
  glucoseDrop: number;
}

export const ActivityTrackerCard: React.FC<ActivityProps> = ({ type, duration, intensity, glucoseDrop }) => {
  return (
    <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#34C759] opacity-10 blur-[50px] group-hover:opacity-30 transition-opacity" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-[#34C759]/20 rounded-2xl text-[#34C759]">
          <Dumbbell size={20} />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bio-Esfuerzo</span>
          <p className="text-[9px] font-bold text-[#34C759] uppercase tracking-tighter">Impacto Glucémico Activo</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-[1000] italic uppercase tracking-tighter text-white truncate group-hover:text-[#34C759] transition-colors">
            {type}
          </h4>
          <div className="flex gap-2 mt-2">
            <span className="text-[9px] font-black bg-white/10 px-3 py-1 rounded-full text-slate-300 uppercase tracking-widest">{duration} MIN</span>
            <span className="text-[9px] font-black bg-white/10 px-3 py-1 rounded-full text-slate-300 uppercase tracking-widest">{intensity}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
          <div className="p-2 bg-[#34C759] rounded-xl text-slate-900">
            <TrendingDown size={18} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Reducción estimada</p>
            <p className="text-2xl font-[1000] text-white italic">-{glucoseDrop} <span className="text-[10px] font-bold opacity-50 not-italic">MG/DL</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};