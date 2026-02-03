import React from 'react';
import { Activity, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

interface HomeTabProps {
  onStartClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ onStartClick }) => {
  return (
    <div className="w-full space-y-20">
      {/* HERO SECTION */}
      <section className="text-center py-10 md:py-20">
        <h1 className="text-6xl md:text-8xl font-[1000] tracking-tightest text-slate-900 leading-[0.9] italic uppercase">
          Tu Salud. <br />
          <span className="text-blue-600">Tus Datos.</span>
        </h1>
        <p className="mt-8 text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto uppercase tracking-widest">
          Análisis metabólico inteligente impulsado por IA.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          <button 
            onClick={onStartClick}
            className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-105 transition-all flex items-center gap-3"
          >
            Iniciar Análisis Bio <ArrowRight size={20} />
          </button>
          <button className="bg-white text-slate-400 border border-slate-200 px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
            Ver Demo
          </button>
        </div>
      </section>

      {/* GRID DE TARJETAS TIPO APPLE HEALTH */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* TARJETA 1 */}
        <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-50 shadow-2xl shadow-slate-200/50 group hover:border-blue-100 transition-all">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
            <Activity size={32} />
          </div>
          <h2 className="text-4xl font-[1000] tracking-tighter text-slate-900 uppercase italic leading-none mb-4">
            Progreso <br />Glucémico
          </h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed">
            Predictores en tiempo real basados en tu historial biométrico único.
          </p>
          <div className="mt-10 h-24 w-full bg-slate-50 rounded-2xl border-b-4 border-blue-600/20 animate-pulse"></div>
        </div>

        {/* TARJETA 2 */}
        <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl shadow-slate-900/20 group hover:scale-[1.02] transition-all">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-400 mb-8">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-4xl font-[1000] tracking-tighter uppercase italic leading-none mb-4">
            Privacidad <br />Absoluta
          </h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed">
            Tus datos están encriptados. Tú decides quién los ve y cómo se usan.
          </p>
          <div className="mt-10 flex items-center gap-2">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Sistemas Protegidos</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeTab;