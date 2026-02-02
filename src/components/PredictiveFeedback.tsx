import React from 'react';

interface PredictiveFeedbackProps {
  prediction: {
    estimatedRise: number;
    warning: string;
    finalGlucose: number;
  };
}

const PredictiveFeedback: React.FC<PredictiveFeedbackProps> = ({ prediction }) => {
  // Rangos clínicos para el feedback visual
  const isHigh = prediction.finalGlucose > 180;
  const isWarning = prediction.finalGlucose > 140 && prediction.finalGlucose <= 180;

  return (
    <div className={`mt-6 overflow-hidden rounded-[2rem] border-2 transition-all duration-700 animate-in fade-in zoom-in-95 ${
      isHigh 
        ? 'bg-red-50/50 border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
        : isWarning 
          ? 'bg-amber-50/50 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
          : 'bg-blue-50/50 border-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
    }`}>
      
      {/* Barra de Estado del Algoritmo */}
      <div className={`px-5 py-2.5 flex items-center justify-between ${
        isHigh ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-blue-600'
      }`}>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </div>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.25em]">
            Análisis Metabólico en Tiempo Real
          </span>
        </div>
        <span className="text-[8px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full uppercase">
          Pro Engine v1.0
        </span>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <p className={`text-[10px] font-black uppercase tracking-wider ${
              isHigh ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-blue-600'
            }`}>
              Incremento Estimado
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter text-slate-900">
                +{Math.round(prediction.estimatedRise)}
              </span>
              <span className="text-sm font-bold text-slate-400 uppercase">mg/dL</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pico Proyectado</p>
            <div className={`text-2xl font-black px-3 py-1 rounded-xl bg-white shadow-sm border ${
              isHigh ? 'text-red-600 border-red-100' : isWarning ? 'text-amber-600 border-amber-100' : 'text-slate-800 border-blue-100'
            }`}>
              {Math.round(prediction.finalGlucose)}
            </div>
          </div>
        </div>

        {/* Visualizador de Rango */}
        <div className="relative h-3 w-full bg-slate-200/50 rounded-full mb-6 p-0.5 overflow-hidden border border-slate-100">
          <div 
            className={`h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${
              isHigh ? 'bg-gradient-to-r from-red-400 to-red-600' : isWarning ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'
            }`}
            style={{ width: `${Math.min((prediction.finalGlucose / 250) * 100, 100)}%` }}
          >
            <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-stripe_2s_linear_infinite]"></div>
          </div>
        </div>

        <div className={`flex gap-4 p-4 rounded-2xl border ${
          isHigh ? 'bg-red-100/30 border-red-100' : isWarning ? 'bg-amber-100/30 border-amber-100' : 'bg-blue-100/30 border-blue-100'
        }`}>
          <div className="text-2xl mt-0.5">
            {isHigh ? '🚫' : isWarning ? '⚠️' : '🎯'}
          </div>
          <div className="space-y-1">
            <p className={`text-xs font-black uppercase tracking-tight ${
              isHigh ? 'text-red-900' : isWarning ? 'text-amber-900' : 'text-blue-900'
            }`}>
              Recomendación de la IA
            </p>
            <p className={`text-[11px] leading-relaxed font-semibold ${
              isHigh ? 'text-red-800/80' : isWarning ? 'text-amber-800/80' : 'text-blue-800/80'
            }`}>
              {prediction.warning}
            </p>
          </div>
        </div>
      </div>
      
      {/* Nota de Propiedad Intelectual */}
      <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Modelo predictivo personalizado activo</span>
        </div>
        <div className="text-[8px] font-black text-slate-300 uppercase">VitaMetra © 2026</div>
      </div>
    </div>
  );
};

export default PredictiveFeedback;