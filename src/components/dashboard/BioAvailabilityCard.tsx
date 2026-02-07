import React from 'react';
import { Beaker, CheckCircle2, AlertCircle } from 'lucide-react';

export const BioAvailabilityCard: React.FC = () => {
  // Simulación de datos de sinergia basados en el registro actual
  const interactions = [
    { 
      pair: "Hierro + Vitamina C", 
      status: "Sinergia Máxima", 
      desc: "La Vitamina C aumenta la absorción de hierro no-hemo.",
      efficiency: 95,
      type: "positive"
    },
    { 
      pair: "Calcio + Cafeína", 
      status: "Inhibidor detectado", 
      desc: "La cafeína reduce la absorción de calcio en este registro.",
      efficiency: 40,
      type: "negative"
    }
  ];

  const averageEfficiency = 68;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
          <Beaker size={20} />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Bio-Sinergia</span>
          <p className="text-[14px] font-[1000] text-purple-600 italic uppercase">Eficiencia Química</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
              strokeDasharray={175} strokeDashoffset={175 - (averageEfficiency / 100) * 175}
              className="text-purple-500" strokeLinecap="round" />
          </svg>
          <span className="absolute text-sm font-black text-slate-900">{averageEfficiency}%</span>
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Absorción Promedio</p>
          <p className="text-[11px] font-bold text-slate-700 leading-tight italic">Optimiza tus mezclas para subir este score.</p>
        </div>
      </div>

      <div className="space-y-4">
        {interactions.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${item.type === 'positive' ? 'bg-green-50/50 border-green-100' : 'bg-orange-50/50 border-orange-100'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                {item.type === 'positive' ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-orange-500" />}
                {item.pair}
              </span>
              <span className={`text-[8px] font-[1000] uppercase px-2 py-0.5 rounded-full ${item.type === 'positive' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                {item.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug italic font-medium">"{item.desc}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};