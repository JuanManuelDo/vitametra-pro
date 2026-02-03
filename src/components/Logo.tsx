import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ICONO DE ÁTOMO MINIMALISTA */}
      <div className="relative w-12 h-12 flex items-center justify-center bg-[#007AFF] rounded-2xl shadow-xl shadow-blue-100 group transition-all duration-500 hover:rotate-90">
        <svg 
          viewBox="0 0 100 100" 
          className="w-8 h-8 text-white" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Núcleo Central */}
          <circle cx="50" cy="50" r="8" fill="currentColor"/>
          
          {/* Órbitas del Átomo */}
          <ellipse 
            cx="50" cy="50" rx="42" ry="16" 
            stroke="currentColor" strokeWidth="4" 
            transform="rotate(0 50 50)" 
            className="opacity-70"
          />
          <ellipse 
            cx="50" cy="50" rx="42" ry="16" 
            stroke="currentColor" strokeWidth="4" 
            transform="rotate(60 50 50)" 
            className="opacity-90"
          />
          <ellipse 
            cx="50" cy="50" rx="42" ry="16" 
            stroke="currentColor" strokeWidth="4" 
            transform="rotate(120 50 50)"
          />
        </svg>
        
        {/* Destello de Actividad IA */}
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
        </div>
      </div>

      {/* TEXTO CORPORATIVO REFINADO */}
      <div className="flex flex-col -space-y-1.5">
        <div className="flex items-baseline">
          <span className="text-2xl font-[1000] tracking-tighter text-slate-900 leading-none italic uppercase">
            VITA<span className="text-[#007AFF]">METRA</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-[1px] w-4 bg-slate-300"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
            BIO-CORE AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;