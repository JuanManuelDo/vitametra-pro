import React from 'react';
import { Activity, Flame, Utensils, TrendingDown } from 'lucide-react';

interface EnergyBudgetProps {
  target: number;
  consumed: number;
  bmr: number;
  activity: number;
}

export const EnergyBudgetCard: React.FC<EnergyBudgetProps> = ({ target, consumed, bmr, activity }) => {
  const totalExpenditure = bmr + activity;
  const remaining = target - consumed;
  const percentage = Math.min((consumed / target) * 100, 100);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
      {/* Background Decorator */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
      
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2 relative">
        <Flame size={14} className="text-[#FF9500]" fill="currentColor" /> Bio-Energía Diaria
      </h3>
      
      <div className="flex justify-between items-center mb-10 relative">
        <div className="text-center">
          <p className="text-xl font-black text-slate-900 leading-none mb-1">{consumed}</p>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Entrada</p>
        </div>
        
        {/* Ring Central: Estilo Health Pro */}
        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50" />
            <circle 
              cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
              strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              className="text-[#007AFF] transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-[1000] italic text-slate-900 leading-none">{remaining}</span>
            <span className="text-[7px] font-black text-[#007AFF] uppercase tracking-widest mt-1">Kcal Libres</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-black text-slate-900 leading-none mb-1">{totalExpenditure}</p>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Gasto (Burn)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Activity size={10} className="text-[#007AFF]" /> Basal (BMR)
          </span>
          <span className="text-xs font-[1000] italic text-slate-800">{bmr} Kcal</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <TrendingDown size={10} className="text-[#34C759]" /> Movimiento
          </span>
          <span className="text-xs font-[1000] italic text-[#34C759]">+{activity} Kcal</span>
        </div>
      </div>
    </div>
  );
};