import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className} select-none shrink-0 group`}>
      {/* CONTENEDOR DEL ICONO: BIO-CORE UNIT */}
      <div className="relative">
        <div className="w-11 h-11 flex items-center justify-center bg-gradient-to-tr from-[#007AFF] to-[#47a1ff] rounded-[1.15rem] shadow-lg shadow-blue-200/50 transition-all duration-500 group-hover:scale-105 group-hover:rotate-6">
          <svg 
            viewBox="0 0 100 100" 
            className="w-6 h-6 text-white" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Núcleo de Precisión */}
            <circle cx="50" cy="50" r="10" fill="currentColor"/>
            
            {/* Órbitas Metabólicas con grosores dinámicos */}
            <ellipse 
              cx="50" cy="50" rx="44" ry="16" 
              stroke="currentColor" strokeWidth="6" 
              transform="rotate(0 50 50)" 
              className="opacity-30"
            />
            <ellipse 
              cx="50" cy="50" rx="44" ry="16" 
              stroke="currentColor" strokeWidth="6" 
              transform="rotate(60 50 50)" 
              className="opacity-60"
            />
            <ellipse 
              cx="50" cy="50" rx="44" ry="16" 
              stroke="currentColor" strokeWidth="6" 
              transform="rotate(120 50 50)"
            />
          </svg>
          
          {/* Luz de Estado 'Live' (Sincronizado) */}
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </div>
        </div>
      </div>

      {/* TEXTO DE MARCA: TIPOGRAFÍA DE ALTA PRECISIÓN */}
      <div className="flex flex-col -space-y-1">
        <div className="flex items-baseline">
          <span className="text-xl font-[1000] tracking-tighter text-slate-900 leading-none italic uppercase">
            VITA<span className="text-[#007AFF]">METRA</span>
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-1">
          {/* Línea de estabilidad glucémica */}
          <div className="h-[2px] w-3 bg-emerald-500 rounded-full"></div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">
            Bio-Intelligence
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;