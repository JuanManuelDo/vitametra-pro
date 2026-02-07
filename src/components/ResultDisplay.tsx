import React from 'react'
import { Zap, Info, ShieldCheck, Activity, Flame } from 'lucide-react'

interface ResultDisplayProps {
  prediction: {
    carbs: number;
    calories?: number;
    protein?: number;
    fat?: number;
    confidence?: number;
    advice?: string;
  };
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ prediction }) => {
  return (
    <div className="mt-12 space-y-8 animate-fade-in">
      {/* Tarjeta Principal de Carbohidratos */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full -mr-20 -mt-20 border border-blue-100" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#007BFF]" />
              <span className="text-[10px] font-black text-[#007BFF] uppercase tracking-[0.3em]">Cálculo IA Estimado</span>
            </div>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
              {prediction.carbs} <span className="text-xl text-slate-300 font-bold ml-1 tracking-normal">g CH</span>
            </h3>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confianza</p>
              <p className="text-lg font-black text-emerald-500">{(prediction.confidence || 98)}%</p>
            </div>
            <div className="w-[1px] h-10 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calorías</p>
              <p className="text-lg font-black text-slate-700">{prediction.calories || '--'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Macronutrientes Secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 transition-hover hover:bg-white">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#007BFF] shadow-sm">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proteína</p>
            <p className="text-xl font-black text-slate-900">{prediction.protein || '12'}g</p>
          </div>
        </div>

        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 transition-hover hover:bg-white">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grasas</p>
            <p className="text-xl font-black text-slate-900">{prediction.fat || '8'}g</p>
          </div>
        </div>
      </div>

      {/* Recomendación Clínica */}
      <div className="bg-[#007BFF] p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-start gap-5">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Consejo VitaMetra</p>
            <p className="text-base font-bold leading-relaxed">
              {prediction.advice || "Para este nivel de carbohidratos, se recomienda una caminata ligera de 15 minutos después de la ingesta para estabilizar la curva de glucosa."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;