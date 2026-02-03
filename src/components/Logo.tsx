import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      {/* ICONO DE ÁTOMO MINIMALISTA - BIO-CORE */}
      <div className="relative w-12 h-12 flex items-center justify-center bg-[#007AFF] rounded-[1.25rem] shadow-xl shadow-blue-200/50 group transition-all duration-700 hover:rotate-[360deg]">
        <svg 
          viewBox="0 0 100 100" 
          className="w-7 h-7 text-white" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Núcleo Central (Protones/IA) */}
          <circle cx="50" cy="50" r="9" fill="currentColor"/>
          
          {/* Órbitas de Electrones (Datos/Ciencia) */}
          <ellipse 
            cx="50" cy="50" rx="44" ry="16" 
            stroke="currentColor" strokeWidth="5" 
            transform="rotate(0 50 50)" 
            className="opacity-40"
          />
          <ellipse 
            cx="50" cy="50" rx="44" ry="16" 
            stroke="currentColor" strokeWidth="5" 
            transform="rotate(60 50 50)" 
            className="opacity-70"
          />
          <ellipse 
            cx="50" cy="50" rx="44" ry="16" 
            stroke="currentColor" strokeWidth="5" 
            transform="rotate(120 50 50)"
          />
        </svg>
        
        {/* Indicador de Estado Activo (Verde Salud) */}
        <div className="absolute top-2.5 right-2.5">
          <div className="w-2 h-2 bg-[#34C759] rounded-full animate-ping opacity-75" />
          <div className="absolute inset-0 w-2 h-2 bg-[#34C759] rounded-full" />
        </div>
      </div>

      {/* IDENTIDAD VISUAL VITAMETRA */}
      <div className="flex flex-col -space-y-1.5">
        <div className="flex items-baseline">
          <span className="text-2xl font-[1000] tracking-tighter text-slate-900 leading-none italic uppercase">
            VITA<span className="text-[#007AFF]">METRA</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="h-[1.5px] w-4 bg-[#34C759] rounded-full"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
            BIO-CORE AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;