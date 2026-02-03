import React from 'react';
import { ChevronRight, Database, TrendingUp, Activity } from 'lucide-react';

interface HomeTabProps {
  onStartClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ onStartClick }) => {
  return (
    <div className="w-full pt-16 md:pt-24">
      {/* SECCIÓN HERO - INICIO 1 */}
      <section className="max-w-[1200px] mx-auto px-8 py-20 text-left">
        <h1 className="text-6xl md:text-8xl hero-text text-metra-dark max-w-4xl">
          Convierte tus <br />
          <span className="text-metra-blue">Palabras</span> en <span className="text-metra-green">datos Clínicos.</span>
        </h1>
        
        <p className="mt-10 text-xl md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
          Escribe o dicta lo que comes. Nuestra IA desglosa carbohidratos, estima picos glucémicos y proyecta tu HbA1c al instante.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <button 
            onClick={onStartClick}
            className="bg-metra-blue text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            Empezar Análisis con IA
          </button>
          <button className="bg-slate-100 text-metra-blue px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all">
            Ver Demo Analitizer
          </button>
        </div>
      </section>

      {/* SECCIÓN TARJETAS - INICIO 2 */}
      <section className="max-w-[1400px] mx-auto px-8 pb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tarjeta 1: Conteo */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:shadow-xl transition-all">
          <div className="bg-blue-50 text-metra-blue p-4 rounded-2xl mb-6">
            <Database size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Conteo Natural</h3>
          <p className="text-slate-400 font-medium">IA que entiende lenguaje humano para registrar carbohidratos.</p>
        </div>

        {/* Tarjeta 2: HbA1c */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:shadow-xl transition-all">
          <div className="bg-green-50 text-metra-green p-4 rounded-2xl mb-6">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Proyección HbA1c</h3>
          <p className="text-slate-400 font-medium">Predicciones matemáticas de tu hemoglobina glicosilada.</p>
        </div>

        {/* Tarjeta 3: Grado Clínico */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:shadow-xl transition-all">
          <div className="bg-orange-50 text-orange-500 p-4 rounded-2xl mb-6">
            <Activity size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Grado Clínico</h3>
          <p className="text-slate-400 font-medium">Basado en estándares internacionales de diabetes.</p>
        </div>

      </section>

      {/* FOOTER DISCRETO TIPO APPLE */}
      <footer className="w-full border-t border-slate-100 py-10 text-center">
        <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">
          VITAMETRA — CIENCIA DE DATOS APLICADA A LA SALUD METABÓLICA
        </p>
      </footer>
    </div>
  );
};

export default HomeTab;