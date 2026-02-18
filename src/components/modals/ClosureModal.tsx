import React, { useState } from 'react';
import { X, ShieldCheck, Activity, Target, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClosureModalProps {
  mealEntry: any;
  onClose: () => void;
  onSaveClosure: (id: string, glucose: number, successScore: number, insight: string) => void;
}

const ClosureModal: React.FC<ClosureModalProps> = ({ mealEntry, onClose, onSaveClosure }) => {
  const [postGlucose, setPostGlucose] = useState<number | ''>('');
  const [step, setStep] = useState<'input' | 'verdict'>('input');

  const getVerdict = () => {
    const val = Number(postGlucose);
    const pre = mealEntry.bloodGlucoseValue || 100;
    const diff = val - pre;

    if (val > 180) return {
      score: 0.4,
      label: 'Bolo Insuficiente',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      insight: `La carga de "${mealEntry.foodName}" superó la capacidad del ratio actual. Sugerencia: Incrementar dosis en un 10-15% para platos similares.`
    };
    if (val < 70) return {
      score: 0.3,
      label: 'Exceso de Corrección',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      insight: 'Hipoglicemia detectada. Este alimento tiene una absorción más lenta de lo previsto o el ratio aplicado fue demasiado agresivo.'
    };
    return {
      score: 1.0,
      label: 'Éxito Metabólico',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      insight: 'Perfecto. Has logrado mantener la estabilidad. Este registro se guardará como "Patrón de Referencia".'
    };
  };

  const verdict = getVerdict();

  return (
    <div className="fixed inset-0 z-[5000] flex items-end justify-center px-4 pb-10 sm:items-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[4rem] overflow-hidden shadow-2xl"
      >
        <div className="p-10">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl text-indigo-400">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-[1000] uppercase italic tracking-tighter leading-none">Feedback Vital</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mealEntry.foodName}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
              <X size={24}/>
            </button>
          </header>

          {step === 'input' ? (
            <div className="space-y-10">
              <div className="text-center">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6 block">Glucosa Actual</span>
                <div className="relative inline-block">
                  <input 
                    type="number" 
                    autoFocus
                    value={postGlucose}
                    onChange={(e) => setPostGlucose(Number(e.target.value))}
                    placeholder="000"
                    className="w-full text-center text-9xl font-[1000] italic tracking-tighter text-slate-900 outline-none placeholder:text-slate-50 border-none focus:ring-0"
                  />
                </div>
                <p className="text-xl font-black text-slate-300 uppercase italic tracking-widest mt-2">mg/dL</p>
              </div>

              <button 
                disabled={!postGlucose}
                onClick={() => setStep('verdict')}
                className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl disabled:opacity-10 transition-all active:scale-95"
              >
                GENERAR VEREDICTO
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className={`p-8 rounded-[3rem] ${verdict.bg} border border-black/5 relative overflow-hidden`}>
                <Sparkles className="absolute right-6 top-6 text-black/5" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Conclusión IA</p>
                <h4 className={`text-4xl font-[1000] italic uppercase tracking-tighter ${verdict.color} mb-4 leading-none`}>
                  {verdict.label}
                </h4>
                <p className="text-slate-700 font-bold leading-tight italic text-lg">
                  "{verdict.insight}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] text-center border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Delta Glucosa</span>
                  <span className="text-4xl font-[1000] text-slate-900 italic tracking-tighter">
                    {Number(postGlucose) - (mealEntry.bloodGlucoseValue || 100) > 0 ? '+' : ''}
                    {Number(postGlucose) - (mealEntry.bloodGlucoseValue || 100)}
                  </span>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] text-center border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Confianza IA</span>
                  <span className="text-4xl font-[1000] text-indigo-600 italic tracking-tighter">{Math.round(verdict.score * 100)}%</span>
                </div>
              </div>

              <button 
                onClick={() => onSaveClosure(mealEntry.id, Number(postGlucose), verdict.score, verdict.insight)}
                className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 hover:bg-slate-900 transition-all active:scale-95"
              >
                <ShieldCheck size={24} /> FINALIZAR APRENDIZAJE
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ClosureModal;