import React from 'react';
import { Scale, ChevronRight, TrendingDown } from 'lucide-react';
import { UserData } from '../../types';

interface WeightProgressCardProps {
  currentUser: UserData;
}

export const WeightProgressCard: React.FC<WeightProgressCardProps> = ({ currentUser }) => {
  const currentWeight = currentUser.currentWeight || 85; 
  const targetWeight = currentUser.targetWeight || 75;
  const startWeight = currentUser.startWeight || 92;

  const totalToLose = startWeight - targetWeight;
  const lostSoFar = startWeight - currentWeight;
  const progressPercentage = Math.min(Math.max((lostSoFar / totalToLose) * 100, 0), 100);
  const remaining = currentWeight - targetWeight;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative group overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-[#007AFF]">
            <Scale size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio-Composición</p>
            <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-tighter">Progreso de Peso</h3>
          </div>
        </div>
        {remaining > 0 && (
          <div className="bg-green-50 px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100">
            <TrendingDown size={14} className="text-[#34C759]" />
            <span className="text-[11px] font-black text-[#34C759]">-{lostSoFar.toFixed(1)} kg</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="relative h-5 w-full bg-slate-50 rounded-full p-1 border border-slate-100">
          <div 
            className="h-full bg-gradient-to-r from-[#007AFF] to-[#34C759] transition-all duration-1000 ease-out rounded-full shadow-lg shadow-blue-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-end px-1">
          <div>
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Estado</p>
            <p className="text-2xl font-[1000] text-slate-900 tracking-tighter italic">{currentWeight} <span className="text-xs text-slate-400 font-bold">kg</span></p>
          </div>
          <div className="text-center pb-0.5">
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Diferencia</p>
            <p className="text-xl font-black text-[#007AFF] tracking-tighter italic">{remaining > 0 ? `-${remaining.toFixed(1)}` : '0'} <span className="text-[10px]">kg</span></p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Meta</p>
            <p className="text-2xl font-[1000] text-[#34C759] tracking-tighter italic">{targetWeight} <span className="text-xs text-slate-400 font-bold">kg</span></p>
          </div>
        </div>
      </div>

      <button className="w-full mt-8 py-4 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registrar Nuevo Peso</span>
        <ChevronRight size={14} className="text-slate-300" />
      </button>
    </div>
  );
};