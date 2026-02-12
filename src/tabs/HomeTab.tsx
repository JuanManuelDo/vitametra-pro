import React from 'react';
import { Brain, Sparkles, ArrowRight, Zap, Target, Shield, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import SimplifiedHome from '../components/SimplifiedHome';
import type { UserData, HistoryEntry } from '../types';

interface HomeTabProps {
  currentUser: UserData | null;
  history?: HistoryEntry[];
  onStartClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ currentUser, history = [], onStartClick }) => {
  if (currentUser) {
    return <SimplifiedHome currentUser={currentUser} history={history} />;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans selection:bg-blue-100">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none -z-10">
        <div className="absolute top-[5%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full" />
        <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-300/5 blur-[100px] rounded-full" />
      </div>

      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-8"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inteligencia para la Diabetes</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[110px] font-[1000] tracking-tight text-slate-900 leading-[0.85] mb-10 italic uppercase"
          >
            Tu control de glucosa, <br/>
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
              simplificado.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed"
          >
            Registra, analiza y comprende tus datos con apoyo de <span className="text-slate-900">IA diseñada específicamente</span> para personas con diabetes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onStartClick}
              className="group relative w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-200/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-3">
                Comenzar ahora <ArrowRight size={20} />
              </span>
            </button>
            <button 
              onClick={onStartClick}
              className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Ver planes Chile
            </button>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Brain className="text-blue-600" />}
            title="Análisis Predictivo"
            desc="Modelado basado en redes neuronales que te ayuda a entender el impacto de cada comida en tu cuerpo."
            color="bg-blue-50"
          />
          <FeatureCard 
            icon={<Target className="text-emerald-500" />}
            title="Bio-Optimización"
            desc="Sincroniza tus objetivos de salud con recomendaciones nutricionales de alta precisión."
            color="bg-emerald-50"
          />
          <FeatureCard 
            icon={<Shield className="text-slate-900" />}
            title="Protocolo de Datos"
            desc="Privacidad de grado clínico con encriptado de extremo a extremo para tu total tranquilidad."
            color="bg-slate-100"
          />
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 mb-10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-6xl mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight italic uppercase">
                Ciencia Predictiva, <br/>Vida Real.
              </h2>
              <div className="space-y-6">
                <MetricItem label="Latencia de Procesamiento" value="< 1.1s" />
                <MetricItem label="Precisión del Modelo" value="98.4%" />
                <MetricItem label="Indice de Adherencia" value="94.2%" />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Zap size={24} className="text-white fill-current" />
                </div>
                <div>
                  <p className="font-bold text-xl uppercase italic">Estado: Optimizado</p>
                  <p className="text-blue-400 text-xs font-black uppercase tracking-widest">Nodos IA Activos</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed italic text-lg">
                "Vitametra ha transformado mi gestión metabólica de una tarea reactiva a una estrategia proactiva basada en datos reales."
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
        © 2026 Vitametra Chile • Precision Metabolism
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-start transition-all"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6`}>
      {React.cloneElement(icon as React.ReactElement, { size: 28 })}
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight italic uppercase">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm font-bold">{desc}</p>
  </motion.div>
);

const MetricItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center border-b border-white/10 pb-4">
    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{label}</span>
    <span className="text-2xl font-[1000] italic text-blue-400">{value}</span>
  </div>
);

export default HomeTab;