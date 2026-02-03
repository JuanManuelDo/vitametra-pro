import React from 'react';
import { ArrowRight, Sparkles, Calculator, Zap, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface HomeTabProps {
  onStartClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ onStartClick }) => {
  return (
    <div className="w-full bg-white">
      {/* SECCIÓN HERO - ESTILO VITAMETRA PRO */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 md:py-32">
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles size={14} className="text-[#007AFF]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#007AFF]">Inteligencia Nutricional 2.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-[1000] tracking-tighter italic uppercase leading-[0.85] text-slate-900 mb-8">
            Convierte tus <br />
            <span className="text-[#007AFF]">Palabras</span> en <br />
            <span className="text-[#34C759]">datos Clínicos.</span>
          </h1>

          <p className="max-w-2xl text-xl md:text-2xl text-slate-400 font-bold leading-relaxed mb-12">
            La primera IA que traduce lenguaje natural en proyecciones glucémicas de precisión. Diseñado para el control total de la diabetes.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onStartClick}
              className="bg-[#007AFF] text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-blue-200 flex items-center gap-3"
            >
              Empezar Análisis <ArrowRight size={20} />
            </button>
            <button className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE BENEFICIOS - ESTILO APPLE HEALTH (Imagen Deseada) */}
      <section className="bg-[#FBFBFD] py-24 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tarjeta 1: Conteo Natural */}
            <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-2 duration-500 group">
              <div className="w-24 h-24 bg-[#F2F7FF] rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Calculator size={40} className="text-[#007AFF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-[900] text-slate-900 mb-4 tracking-tight uppercase italic">
                Conteo Natural
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed">
                "Media taza de arroz y pollo" se convierte en carbohidratos netos automáticamente.
              </p>
            </div>

            {/* Tarjeta 2: Proyección HbA1c */}
            <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-2 duration-500 group">
              <div className="w-24 h-24 bg-[#F2FFF5] rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Zap size={40} className="text-[#34C759]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-[900] text-slate-900 mb-4 tracking-tight uppercase italic">
                Proyección HbA1c
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed">
                Mira cómo cada plato afecta tu promedio de tres meses antes del examen real.
              </p>
            </div>

            {/* Tarjeta 3: Grado Clínico */}
            <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-2 duration-500 group">
              <div className="w-24 h-24 bg-[#FFF9F2] rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={40} className="text-[#FF9500]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-[900] text-slate-900 mb-4 tracking-tight uppercase italic">
                Grado Clínico
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed">
                Basado en estándares ADA 2026 para máxima seguridad en el control de glucosa.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER DE MARCA CON LOGO ÁTOMO */}
      <footer className="py-20 flex flex-col items-center justify-center bg-white">
        <Logo className="scale-125 mb-6" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          The Future of Metabolic Health
        </p>
      </footer>
    </div>
  );
};

export default HomeTab;