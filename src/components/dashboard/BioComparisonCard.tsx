import React from 'react';
import { Scale, Trophy, Zap } from 'lucide-react';

export const BioComparisonCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden relative group">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#007AFF] rounded-xl text-white shadow-lg shadow-blue-100">
          <Scale size={18} />
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Simulador Pro</span>
          <h3 className="text-sm font-black text-slate-900 uppercase italic leading-none">Comparativa Bio-Química</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <div className="p-4 rounded-3xl border-2 border-slate-50 bg-slate-50/50">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Opción A</p>
          <p className="text-xs font-black text-slate-800 uppercase mb-3 italic">Avena con Miel</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#FF3B30] uppercase">+42 mg/dL</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Pico Alto</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl border-2 border-[#34C759] bg-[#34C759]/5">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[9px] font-black text-slate-400 uppercase">Opción B</p>
            <Trophy size={14} className="text-[#34C759]" />
          </div>
          <p className="text-xs font-black text-slate-800 uppercase mb-3 italic">Huevo con Aguacate</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#34C759] uppercase">+12 mg/dL</span>
            <span className="text-[9px] font-black text-[#34C759] uppercase tracking-tighter">Óptimo</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#1C1C1E] rounded-2xl flex gap-3 items-start">
        <Zap size={16} className="text-[#007AFF] mt-0.5" fill="currentColor" />
        <p className="text-[10px] font-bold text-slate-300 leading-tight">
          <span className="text-white font-black uppercase italic">Veredicto IA:</span> La Opción B evita el pico de insulina gracias a las grasas saludables, manteniendo tu energía estable por 3 horas más.
        </p>
      </div>
    </div>
  );
};