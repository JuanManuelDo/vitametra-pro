import React from 'react'
import { Zap, AlertTriangle, Target, Info } from 'lucide-react'

interface PredictiveFeedbackProps {
  prediction: {
    estimatedRise: number;
    warning: string;
    finalGlucose: number;
  };
}

const PredictiveFeedback: React.FC<PredictiveFeedbackProps> = ({ prediction }) => {
  const isHigh = prediction.finalGlucose > 180;
  const isWarning = prediction.finalGlucose > 140 && prediction.finalGlucose <= 180;

  const theme = {
    bg: isHigh ? 'bg-red-50/50' : isWarning ? 'bg-amber-50/50' : 'bg-blue-50/50',
    border: isHigh ? 'border-red-200' : isWarning ? 'border-amber-200' : 'border-blue-200',
    accent: isHigh ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-[#007AFF]',
    bar: isHigh ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-[#007AFF]',
    icon: isHigh ? <AlertTriangle size={20} /> : isWarning ? <Info size={20} /> : <Target size={20} />
  };

  return (
    <div className={`mt-6 overflow-hidden rounded-[2.5rem] border-2 transition-all duration-700 animate-in fade-in zoom-in-95 ${theme.bg} ${theme.border}`}>
      
      {/* Header Algorítmico */}
      <div className={`px-6 py-3 flex items-center justify-between ${theme.bar}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </div>
          <span className="text-[10px] font-[1000] text-white uppercase tracking-[0.2em]">
            Análisis Metabólico Activo
          </span>
        </div>
        <Zap size={14} className="text-white opacity-50" />
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${theme.accent}`}>
              Subida Estimada
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-[1000] tracking-tighter text-slate-900 italic">
                +{Math.round(prediction.estimatedRise)}
              </span>
              <span className="text-xs font-black text-slate-300 uppercase italic">mg/dL</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Pico Final</p>
            <div className={`text-3xl font-[1000] inline-block px-5 py-2 rounded-2xl bg-white shadow-sm border-2 ${theme.accent} ${theme.border}`}>
              {Math.round(prediction.finalGlucose)}
            </div>
          </div>
        </div>

        {/* Visualizador de Rango Clinico */}
        <div className="relative h-4 w-full bg-slate-200/30 rounded-full mb-8 overflow-hidden border border-slate-100">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${theme.bar}`}
            style={{ width: `${Math.min((prediction.finalGlucose / 300) * 100, 100)}%` }}
          />
          {/* Marcadores de Rango */}
          <div className="absolute top-0 left-[23%] h-full w-0.5 bg-white/30" title="Rango Seguro" />
          <div className="absolute top-0 left-[60%] h-full w-0.5 bg-white/30" title="Límite" />
        </div>

        <div className={`flex gap-4 p-6 rounded-[2rem] border-2 shadow-sm ${
          isHigh ? 'bg-red-100/20 border-red-100' : isWarning ? 'bg-amber-100/20 border-amber-100' : 'bg-blue-100/20 border-blue-100'
        }`}>
          <div className={`${theme.accent}`}>
            {theme.icon}
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-black uppercase tracking-tight ${theme.accent}`}>
              Directriz VitaMetra
            </p>
            <p className="text-sm leading-snug font-bold text-slate-700">
              {prediction.warning}
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-4 bg-white/50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Modelo Bio-Core v7.0</span>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic italic">Propiedad de VitaMetra</span>
      </div>
    </div>
  );
};

export default PredictiveFeedback;