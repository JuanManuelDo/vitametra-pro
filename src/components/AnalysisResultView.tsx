import React, { useState } from 'react'
import { Zap, Clock, TrendingDown, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { type AnalysisResult } from '../types'
import SaveModal from './modals/from './SaveModal'';

interface Props {
  result: AnalysisResult;
  foodName: string;
  onSaveSuccess: (mealType: string) => void;
}

export const AnalysisResultView: React.FC<Props> = ({ result, foodName, onSaveSuccess }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Lógica de colores basada en tu @theme y el impacto
  const getImpactStatus = (gi: string) => {
    const val = gi.toLowerCase();
    if (val.includes('bajo')) return { 
      color: 'text-metra-green', 
      bg: 'bg-metra-green/10', 
      icon: <CheckCircle2 size={14} />,
      label: 'Impacto Controlado' 
    };
    if (val.includes('medio')) return { 
      color: 'text-orange-500', 
      bg: 'bg-orange-50', 
      icon: <Info size={14} />,
      label: 'Impacto Moderado' 
    };
    return { 
      color: 'text-red-500', 
      bg: 'bg-red-50', 
      icon: <AlertCircle size={14} />,
      label: 'Impacto Elevado' 
    };
  };

  const status = getImpactStatus(result.glycemicIndex);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
      
      {/* CARD PRINCIPAL - ESTILO PREMIUM APPLE */}
      <div className="apple-card p-8 relative overflow-hidden text-center bg-white">
        
        {/* Badge de Impacto */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${status.bg} ${status.color} mb-6`}>
          {status.icon}
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            {status.label}
          </span>
        </div>

        <h3 className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-2">
          Total Carbohidratos
        </h3>
        
        {/* NÚMERO GIGANTE CON KERNING APPLE */}
        <div className="relative inline-block mb-4">
          <h1 className={`text-[110px] leading-none font-black tracking-tighter ${status.color} flex items-baseline justify-center`}>
            {result.totalCarbs}
            <span className="text-3xl ml-2 text-slate-300 font-black">g</span>
          </h1>
        </div>

        <div className="mb-8">
           <h2 className="text-2xl font-bold text-metra-dark capitalize">{foodName}</h2>
           <div className="flex items-center justify-center gap-2 text-slate-400 mt-1">
             <Clock size={14} />
             <span className="text-xs font-medium uppercase tracking-tighter">Proyección Metabólica Bio-Core</span>
           </div>
        </div>

        {/* MÉTRICAS SECUNDARIAS (Bento Box Style) */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-metra-slate p-4 rounded-[2rem] border border-white">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fibra</p>
                <p className="text-xl font-black text-metra-dark">{result.totalFiber}g</p>
            </div>
            <div className="bg-metra-slate p-4 rounded-[2rem] border border-white">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Netos</p>
                <p className="text-xl font-black text-metra-blue">{result.netCarbs}g</p>
            </div>
            <div className="bg-metra-slate p-4 rounded-[2rem] border border-white">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">I.G.</p>
                <p className={`text-xl font-black ${status.color}`}>{result.glycemicIndex.split(' ')[0]}</p>
            </div>
        </div>

        {/* BOTÓN CONFIRMAR - REDISEÑADO */}
        <button 
          onClick={() => setShowSaveModal(true)}
          className="w-full mt-8 bg-metra-blue text-white rounded-[2rem] p-5 flex items-center justify-center gap-3 apple-btn shadow-xl shadow-metra-blue/20"
        >
          <Zap size={22} fill="white" />
          <span className="font-bold text-lg tracking-tight">Confirmar en Bitácora</span>
        </button>
      </div>

      {/* RECOMENDACIÓN IA - DARK MODE APPLE STYLE */}
      <div className="bg-metra-dark p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700 text-metra-blue">
            <TrendingDown size={140} />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 bg-metra-blue rounded-full animate-pulse" />
            <h4 className="font-black text-metra-blue text-[10px] uppercase tracking-[0.2em]">Bio-Vitametra Neural Optimization</h4>
        </div>
        
        <p className="text-slate-200 text-sm leading-relaxed font-medium">
          "{result.optimizationTip}"
        </p>
      </div>

      {showSaveModal && (
        <SaveModal 
          totalCarbs={result.totalCarbs}
          onClose={() => setShowSaveModal(false)}
          onSave={(type) => {
            onSaveSuccess(type);
            setShowSaveModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AnalysisResultView;