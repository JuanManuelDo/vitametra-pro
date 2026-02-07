import React from 'react';
import { Target, CheckCircle2, Plus } from 'lucide-react';

export const NutrientTargetsCard: React.FC = () => {
  const targets = [
    { name: 'Fibra', current: 18, goal: 30, unit: 'g', color: 'bg-[#FF9500]' },
    { name: 'Vitamina C', current: 90, goal: 90, unit: 'mg', color: 'bg-[#34C759]' },
    { name: 'Magnesio', current: 210, goal: 400, unit: 'mg', color: 'bg-[#007AFF]' },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-xl text-white">
            <Target size={18} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Bio-Targets</h3>
        </div>
      </div>

      <div className="space-y-6">
        {targets.map((item, index) => {
          const percentage = Math.min((item.current / item.goal) * 100, 100);
          const isComplete = percentage >= 100;

          return (
            <div key={index} className="group cursor-default">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-[1000] uppercase italic transition-colors ${isComplete ? 'text-[#34C759]' : 'text-slate-800'}`}>
                    {item.name}
                  </span>
                  {isComplete && <CheckCircle2 size={12} className="text-[#34C759]" fill="currentColor" fillOpacity={0.1} />}
                </div>
                <span className="text-[10px] font-black text-slate-400 tracking-tighter">
                  {item.current} <span className="text-slate-300">/ {item.goal}{item.unit}</span>
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[9px] font-black text-slate-300 uppercase tracking-widest hover:border-[#007AFF]/20 hover:text-[#007AFF] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
        <Plus size={12} /> Personalizar Micronutrientes
      </button>
    </div>
  );
};