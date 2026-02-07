
import React from 'react'
import { 
    SparklesIcon, CheckCircleIcon, CloudArrowUpIcon, 
    RobotIcon, ChartPieIcon, ActivityIcon, BuildingOfficeIcon,
    ShieldCheckIcon, TargetIcon
} from './ui/Icons'

interface MissionTabProps {
  onRegisterClick: () => void;
}

const MissionTab: React.FC<MissionTabProps> = ({ onRegisterClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
      
      {/* 1. HERO SEO-DRIVEN SECTION */}
      <section className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-brand-primary rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 animate-bounce">
            <SparklesIcon className="w-4 h-4" />
            Salud Digital de Próxima Generación {currentYear}
        </div>
        <h1 className="text-4xl md:text-7xl font-black text-slate-800 leading-[1.05] tracking-tight mb-8">
            Liderando la <span className="text-brand-primary">Transformación Digital</span> en el Cuidado de la Diabetes.
        </h1>
        <h2 className="text-xl md:text-3xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-medium">
            Nuestra misión es empoderar a personas con <strong className="text-slate-700">diabetes tipo 1 y tipo 2</strong> eliminando la carga cognitiva del registro manual mediante <strong className="text-brand-primary">insights clínicos accionables</strong>.
        </h2>
      </section>

      {/* 2. THE THREE PILLARS (HOW IT WORKS) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-blue-50 text-brand-primary rounded-3xl flex items-center justify-center mb-6">
                <CloudArrowUpIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Importación Inteligente (IIG)</h3>
            <p className="text-slate-500 leading-relaxed">
                Digitalizamos reportes de sensores y glucómetros en segundos. Convierte PDFs y Excels complejos en <strong className="text-brand-primary">tendencias metabólicas</strong> claras para optimizar tu tratamiento {currentYear}.
            </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-green-50 text-brand-secondary rounded-3xl flex items-center justify-center mb-6">
                <RobotIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Nutrición de Precisión con IA</h3>
            <p className="text-slate-500 leading-relaxed">
                Nuestro motor {currentYear} de <strong className="text-brand-secondary">análisis de carbohidratos</strong> procesa texto y voz para ofrecer conteos exactos. Elimina el error humano.
            </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-6">
                <TargetIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4">Cálculo de Dosis Asistido</h3>
            <p className="text-slate-500 leading-relaxed">
                El <strong className="text-orange-500">Chatbot I:C PRO</strong> calcula la relación insulina-carbohidrato al instante. Transformamos datos masivos en decisiones clínicas seguras.
            </p>
        </div>
      </section>

      {/* 3. B2B / INSTITUTIONAL PROMISE */}
      <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden mb-24 shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10">
              <BuildingOfficeIcon className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-4xl">
              <h3 className="text-brand-primary font-black text-sm uppercase tracking-[0.3em] mb-4">Módulo Institucional & B2B {currentYear}</h3>
              <h4 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                  El puente entre el <span className="text-brand-secondary">Éxito Clínico</span> y la Eficiencia Operativa.
              </h4>
              <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10">
                  VitaMetra facilita el seguimiento poblacional mediante <strong className="text-white">reportes clínicos consolidados</strong> y la <strong className="text-white">estimación predictiva de eHbA1c</strong>, permitiendo intervenciones preventivas efectivas.
              </p>
          </div>
      </section>

      {/* 4. CLINICAL INTEGRITY / SEO SOCIAL PROOF */}
      <section className="text-center space-y-12">
          <h5 className="text-2xl md:text-4xl font-black text-slate-800">Comprometidos con la Gestión Glucémica Avanzada.</h5>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2"><ShieldCheckIcon className="w-6 h-6"/> <span className="font-bold text-sm">HIPAA Compliant Data</span></div>
              <div className="flex items-center gap-2"><ActivityIcon className="w-6 h-6"/> <span className="font-bold text-sm">Basado en Guías ADA {currentYear}</span></div>
              <div className="flex items-center gap-2"><ChartPieIcon className="w-6 h-6"/> <span className="font-bold text-sm">IA Auditada 2026</span></div>
          </div>
          
          <div className="pt-12">
            <button 
                onClick={onRegisterClick}
                className="group relative inline-flex items-center gap-3 px-12 py-6 bg-brand-primary text-white font-black text-2xl rounded-2xl shadow-xl hover:shadow-brand-primary/20 hover:bg-brand-dark transition-all transform hover:-translate-y-1 active:scale-95"
            >
                <CheckCircleIcon className="w-8 h-8" />
                Comenzar Control Inteligente {currentYear}
                <div className="absolute -top-3 -right-3 bg-brand-secondary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md animate-pulse">GRATIS</div>
            </button>
            <p className="mt-8 text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" /> Registro seguro. Tus datos metabólicos están protegidos por encriptación de grado clínico.
            </p>
          </div>
      </section>
      
      <footer className="mt-24 border-t border-slate-100 pt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          © {currentYear} VitaMetra • Digital Healthcare Solutions
      </footer>

    </div>
  );
};

export default MissionTab;
