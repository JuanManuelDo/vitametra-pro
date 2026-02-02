import React, { useState } from 'react';
import { Zap, Clock, TrendingDown, ChevronRight, Share2 } from 'lucide-react';
import { type AnalysisResult } from '../types';
import SaveModal from './SaveModal';

interface Props {
  result: AnalysisResult;
  foodName: string;
  onSaveSuccess: (mealType: string) => void;
}

export const AnalysisResultView: React.FC<Props> = ({ result, foodName, onSaveSuccess }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);

  const getGiColor = (gi: string) => {
    const val = gi.toLowerCase();
    if (val.includes('bajo')) return 'text-[#22C55E]';
    if (val.includes('medio')) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* CARD PRINCIPAL - ESTILO IMAGEN 4 */}
      <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 p-8 relative overflow-hidden text-center">
        
        <span className="inline-block px-5 py-2 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
          Impacto Glucémico {result.glycemicIndex}
        </span>

        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Carbohidratos Identificados</h3>
        
        {/* NÚMERO GIGANTE ESTILO VITA PRO */}
        <div className="relative inline-block">
          <h1 className={`text-[120px] leading-none font-black tracking-tighter ${getGiColor(result.glycemicIndex)}`}>
            {result.totalCarbs}<span className="text-4xl ml-1 text-slate-300">g</span>
          </h1>
        </div>

        {/* AMORTIGUADOR METABÓLICO (Imagen 5) */}
        <div className="grid grid-cols-3 gap-2 mt-8">
            <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100/50">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Fibra</p>
                <p className="text-xl font-bold text-emerald-700">{result.totalFiber}g</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-600 uppercase">Netos</p>
                <p className="text-xl font-bold text-blue-700">{result.netCarbs}g</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-3xl border border-purple-100/50">
                <p className="text-[10px] font-black text-purple-600 uppercase">Proteína</p>
                <p className="text-xl font-bold text-purple-700">--</p>
            </div>
        </div>

        {/* BOTÓN CONFIRMAR - EL GRANDE VERDE */}
        <button 
          onClick={() => setShowSaveModal(true)}
          className="w-full mt-8 bg-[#22C55E] hover:bg-[#1ca84f] text-white rounded-[2rem] p-6 flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-green-200"
        >
          <Zap size={24} fill="white" />
          <span className="font-black text-xl">CONFIRMAR REGISTRO</span>
        </button>
      </div>

      {/* RECOMENDACIÓN IA ESTILO IMAGEN 5 */}
      <div className="bg-[#0F172A] p-7 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10">
            <TrendingDown size={120} />
        </div>
        <h4 className="font-black text-[#38BDF8] text-[10px] uppercase tracking-[0.2em] mb-3">Optimización Bio-Vitametra</h4>
        <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
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