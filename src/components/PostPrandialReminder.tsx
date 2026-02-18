import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Zap, BrainCircuit } from 'lucide-react';

interface Props {
  pendingMeal: {
    id: string;
    foodName: string;
    timestamp: string;
  };
  onOpenClosure: () => void;
}

export const PostPrandialReminder: React.FC<Props> = ({ pendingMeal, onOpenClosure }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-200/20 mb-8"
    >
      {/* Glow Efecto IA */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full group-hover:bg-indigo-600/30 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block leading-none mb-1">Cierre de Bucle</span>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Protocolo de Aprendizaje</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
            <Clock size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black">+2h Transcurridas</span>
          </div>
        </div>
        
        <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none mb-4">
          ¿Cómo reaccionó tu cuerpo al <br/> <span className="text-indigo-500">{pendingMeal.foodName}</span>?
        </h3>
        
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-8 max-w-[280px] leading-relaxed">
          Tu Bio-Core necesita el dato post-prandial para optimizar futuros bolos.
        </p>
        
        <button 
          onClick={onOpenClosure}
          className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl"
        >
          VALIDAR MÉTRICA <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};