import React from 'react';
import { Brain, Sparkles, ArrowRight, Zap, Target, Check, Activity, Shield, Heart } from 'lucide-react';
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
      {/* GLOW DE FONDO AMBIENTAL (Inspirado en Apple Health) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute top-[5%] right-[-5%] w-[30%] h-[30%] bg-emerald-300/10 blur-[100px] rounded-full" />
      </div>

      {/* NAVBAR SIMBOLICA */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-white/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">VITAMETRA</span>
        </div>
        <button 
          onClick={onStartClick}
          className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Iniciar Sesión
        </button>
      </nav>

      {/* HERO SECTION: THE FUTURE OF HEALTH */}
      <section className="relative pt-44 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-8"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inteligencia Metabólica de Grado Médico</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[110px] font-[1000] tracking-tight text-slate-900 leading-[0.9] mb-10"
          >
            Tu diabetes, <br/>
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
              ahora es invisible.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-12 leading-relaxed"
          >
            Vitametra fusiona la potencia de la <span className="text-slate-900">IA Generativa</span> con la psicología metabólica para devolverte el control total sin esfuerzo.
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
            <button className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all">
              Ver Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* CORE FEATURES: THE APPLE STYLE CARD GRID */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Brain className="text-blue-600" />}
            title="Análisis Predictivo"
            desc="Gemini 1.5 procesa tus ingestas y predice curvas antes de que ocurran."
            color="bg-blue-50"
          />
          <FeatureCard 
            icon={<Target className="text-emerald-500" />}
            title="Bio-Sincronización"
            desc="Alineación perfecta con tus objetivos de HbA1c y tiempo en rango."
            color="bg-emerald-50"
          />
          <FeatureCard 
            icon={<Shield className="text-slate-900" />}
            title="Privacidad Total"
            desc="Tus datos de salud están encriptados y bajo tu control absoluto."
            color="bg-slate-100"
          />
        </div>
      </section>

      {/* SOCIAL PROOF & METRICS */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 mb-10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-6xl mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Diseñado para humanos, <br/>potenciado por IA.
              </h2>
              <div className="space-y-6">
                <MetricItem label="Análisis por segundo" value="< 1.2s" />
                <MetricItem label="Precisión Nutricional" value="98.4%" />
                <MetricItem label="Satisfacción Usuario" value="4.9/5" />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Zap size={24} className="text-white fill-current" />
                </div>
                <div>
                  <p className="font-bold text-xl">Modo Libertad Activo</p>
                  <p className="text-blue-400 text-sm font-medium">Algoritmo V4.0 en ejecución</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed italic text-lg">
                "Desde que uso Vitametra, la diabetes ha dejado de ser una carga mental para convertirse en un dato más en mi reloj. La IA entiende mi cuerpo mejor que yo."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
        © 2026 Vitametra Health • Made for Humanity
      </footer>
    </div>
  );
};

// COMPONENTES AUXILIARES CON DISEÑO PREMIUM
const FeatureCard = ({ icon, title, desc, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-start"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6`}>
      {React.cloneElement(icon as React.ReactElement, { size: 28 })}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm font-medium">{desc}</p>
  </motion.div>
);

const MetricItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center border-b border-white/10 pb-4">
    <span className="text-slate-400 font-medium">{label}</span>
    <span className="text-2xl font-black text-blue-400">{value}</span>
  </div>
);

export default HomeTab;