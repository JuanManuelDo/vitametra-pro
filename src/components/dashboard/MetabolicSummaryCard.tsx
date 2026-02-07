import React from 'react';
import { Activity, Droplets, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import { UserData } from '../../types';

interface MetabolicSummaryCardProps {
  currentUser: UserData;
}

export const MetabolicSummaryCard: React.FC<MetabolicSummaryCardProps> = ({ currentUser }) => {
  return (
    <div className="bg-[#1C1C1E] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group transition-all active:scale-[0.98]">
      {/* Efecto de Iluminación de Fondo */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#007AFF]/20 blur-[60px] rounded-full animate-pulse" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.3em]">Bio-Core Engine</p>
            </div>
            <h3 className="text-3xl font-[1000] italic tracking-tighter uppercase leading-[0.85]">
              Protocolo <br/> <span className="text-white/80">Metabólico</span>
            </h3>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-inner">
            <Zap size={24} className="text-[#007AFF]" fill="currentColor" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-40">
              <Activity size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gasto Activo</span>
            </div>
            <p className="text-sm font-[1000] uppercase tracking-tight italic text-[#007AFF]">
              {currentUser.activityLevel || 'Nivel Medio'}
            </p>
          </div>
          
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 justify-end opacity-40">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Referencia</span>
              <Droplets size={14} />
            </div>
            <p className="text-sm font-[1000] uppercase tracking-tight italic">
              {currentUser.glucoseUnitPreference || 'mg/dL'}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-[#34C759]" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Precisión Clínica 2026</span>
          </div>
          <button className="flex items-center gap-1 text-[10px] font-black text-[#007AFF] uppercase tracking-widest group-hover:gap-2 transition-all">
            Calibrar <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};