import React from 'react';
import { X, Activity, Wind, Zap, Info } from 'lucide-react';

interface BioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    foodName: string;
    carbs: number;
    impact: 'Bajo' | 'Medio' | 'Alto';
    time: string;
  } | null;
}

export const BioDetailModal: React.FC<BioDetailModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  // Lógica de simulación de "frenos metabólicos" (Proteína y Fibra)
  // En una fase posterior, estos vendrán del NutritionParser
  const mockProtein = Math.floor(data.carbs * 0.2) + 5;
  const mockFiber = Math.floor(data.carbs * 0.1) + 2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-slate-100"
      >
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>

        {/* Cabecera */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
            <p className="text-[10px] font-[1000] text-[#007AFF] uppercase tracking-[0.2em]">
              Análisis Bio-Metabólico
            </p>
          </div>
          <h3 className="text-3xl font-[1000] text-slate-900 italic uppercase tracking-tighter leading-none truncate pr-10">
            {data.foodName}
          </h3>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-2">
            Registrado a las {data.time}
          </p>
        </div>

        <div className="space-y-8">
          {/* Barra de Carbohidratos (El Motor del Pico) */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Carga Glucémica</span>
              <span className="text-xl font-[1000] text-slate-900 italic">{data.carbs}g <small className="text-[10px] text-slate-400">CARBS</small></span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  data.impact === 'Alto' ? 'bg-red-500' : data.impact === 'Medio' ? 'bg-orange-500' : 'bg-[#007AFF]'
                }`}
                style={{ width: `${Math.min((data.carbs / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Grid de "Frenos" Metabólicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-[#34C759] transition-colors">
              <div className="flex items-center gap-2 mb-3 text-[#34C759]">
                <Zap size={16} fill="currentColor" />
                <span className="text-[9px] font-[1000] uppercase tracking-tighter">Proteína</span>
              </div>
              <p className="text-2xl font-[1000] text-slate-900 italic">{mockProtein}g</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Freno de Absorción</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-orange-500 transition-colors">
              <div className="flex items-center gap-2 mb-3 text-orange-500">
                <Wind size={16} />
                <span className="text-[9px] font-[1000] uppercase tracking-tighter">Fibra</span>
              </div>
              <p className="text-2xl font-[1000] text-slate-900 italic">{mockFiber}g</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Reductor de Pico</p>
            </div>
          </div>

          {/* Bio-Insight IA */}
          <div className={`p-6 rounded-[2.5rem] border-2 flex gap-4 ${
            data.impact === 'Alto' 
              ? 'bg-red-50 border-red-100' 
              : 'bg-blue-50 border-blue-100'
          }`}>
            <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
              data.impact === 'Alto' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Bio-Insight IA</p>
              <p className="text-xs font-bold text-slate-800 leading-relaxed italic">
                {data.impact === 'Alto' 
                  ? "Este registro muestra una alta densidad de glucosa rápida. Los niveles de fibra no son suficientes para mitigar la curva."
                  : "Buen balance. La combinación de nutrientes permite una liberación de energía sostenida sin picos críticos."}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          Cerrar Análisis
        </button>
      </div>
    </div>
  );
};