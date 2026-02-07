import React from 'react';
import { Target, Scale, Droplets } from 'lucide-react';

interface ClinicalGoalsSelectorProps {
  targetWeight: number;
  targetHba1c: number;
  onUpdate: (data: { targetWeight?: number; targetHba1c?: number }) => void;
  unit: string;
}

const ClinicalGoalsSelector: React.FC<ClinicalGoalsSelectorProps> = ({ 
  targetWeight, 
  targetHba1c, 
  onUpdate,
  unit 
}) => {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* SECCIÓN: PESO OBJETIVO */}
      <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-metra-blue">
            <Scale size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso Objetivo</p>
            <p className="text-xl font-[1000] text-metra-dark italic uppercase tracking-tighter">{targetWeight} kg</p>
          </div>
        </div>
        
        <input 
          type="range" 
          min="40" 
          max="150" 
          value={targetWeight}
          onChange={(e) => onUpdate({ targetWeight: Number(e.target.value) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-metra-blue"
        />
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[9px] font-black text-slate-300 uppercase">40kg</span>
          <span className="text-[9px] font-black text-slate-300 uppercase">150kg</span>
        </div>
      </div>

      {/* SECCIÓN: HbA1c DESEADA */}
      <div className="bg-metra-dark p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-metra-blue/10 blur-3xl rounded-full" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl text-metra-blue backdrop-blur-md">
            <Droplets size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">HbA1c Objetivo</p>
            <p className="text-xl font-[1000] text-white italic uppercase tracking-tighter">{targetHba1c}%</p>
          </div>
        </div>

        <input 
          type="range" 
          min="4.0" 
          max="9.0" 
          step="0.1"
          value={targetHba1c}
          onChange={(e) => onUpdate({ targetHba1c: Number(e.target.value) })}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-metra-blue relative z-10"
        />
        <div className="flex justify-between mt-2 px-1 relative z-10">
          <span className="text-[9px] font-black text-white/20 uppercase">4.0%</span>
          <span className="text-[9px] font-black text-white/20 uppercase">9.0%</span>
        </div>
      </div>

    </div>
  );
};

export default ClinicalGoalsSelector;