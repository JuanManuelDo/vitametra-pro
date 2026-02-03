import React from 'react';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface HomeTabProps {
  onStartClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ onStartClick }) => {
  return (
    <div className="w-full">
      {/* SECCIÓN HERO */}
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

      {/* SECCIÓN DE BENEFICIOS CON LOGO ÁTOMO */}
      <section className="bg-slate-50/50 py-24 border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {[
            { title: "Análisis Neural", desc: "IA que entiende tus comidas tal como las dices.", color: "text-[#007AFF]" },
            { title: "Predicción HbA1c", desc: "Algoritmos que proyectan tu hemoglobina a futuro.", color: "text-[#34C759]" },
            { title: "Grado Médico", desc: "Basado en estándares internacionales de salud.", color: "text-slate-900" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-start group">
              <div className={`mb-6 transition-transform group-hover:rotate-12 duration-500 ${item.color}`}>
                {/* Aquí usamos el componente Logo pero solo el icono si quieres, o el logo completo */}
                <div className="w-12 h-12">
                   <Logo className="scale-75 origin-left" />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">{item.title}</h3>
              <p className="text-slate-400 font-bold text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
};

export default HomeTab;