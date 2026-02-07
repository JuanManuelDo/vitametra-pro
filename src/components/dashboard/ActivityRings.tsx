import React from 'react';

interface RingProps {
  progress: number;
  color: string;
  size: number;
  strokeWidth: number;
  gradientId: string;
}

const Ring = ({ progress, color, size, strokeWidth, gradientId }: RingProps) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  // Limitamos el progreso para que siempre se vea un rastro del anillo
  const displayProgress = Math.max(progress, 2);
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90 absolute overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.8} />
        </linearGradient>
        
        {/* Filtro de brillo y profundidad para los extremos redondeados */}
        <filter id={`shadow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.4" />
        </filter>
      </defs>
      
      {/* Pista del anillo (Fondo oscuro) */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        className="text-white/5"
      />
      
      {/* Anillo de progreso con Glow y Animación */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        filter={`url(#shadow-${gradientId})`}
        className="transition-all duration-[2000ms] ease-out"
      />
    </svg>
  );
};

const ActivityRings = () => {
  // Datos simulados (puedes pasarlos por props en el futuro)
  const stats = {
    carbs: 78,    // Impacto Glucémico (Rojo)
    glucose: 92,  // Tiempo en Rango (Verde)
    activity: 55  // Bio-Energía (Azul)
  };

  return (
    <div className="bg-metra-dark p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between w-full shadow-2xl shadow-metra-dark/40 border border-white/5">
      {/* Contenedor de Anillos Apilados */}
      <div className="relative flex items-center justify-center mb-8 md:mb-0" style={{ width: 160, height: 160 }}>
        {/* Anillo Exterior: Carbohidratos */}
        <Ring size={160} strokeWidth={16} progress={stats.carbs} color="#FF2D55" gradientId="gradCarbs" />
        
        {/* Anillo Medio: Tiempo en Rango */}
        <Ring size={124} strokeWidth={16} progress={stats.glucose} color="#34C759" gradientId="gradGlucose" />
        
        {/* Anillo Interior: Energía */}
        <Ring size={88} strokeWidth={16} progress={stats.activity} color="#007AFF" gradientId="gradEnergy" />
      </div>

      {/* Leyenda y Barras Detalladas */}
      <div className="flex flex-col gap-5 w-full md:ml-10 flex-1">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF2D55] shadow-[0_0_8px_#FF2D55]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto Carbs</span>
            </div>
            <span className="text-sm font-black text-white">{stats.carbs}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#FF2D55] rounded-full transition-all duration-[2000ms]" style={{ width: `${stats.carbs}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_#34C759]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo en Rango</span>
            </div>
            <span className="text-sm font-black text-white">{stats.glucose}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#34C759] rounded-full transition-all duration-[2000ms]" style={{ width: `${stats.glucose}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#007AFF] shadow-[0_0_8px_#007AFF]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio-Energía</span>
            </div>
            <span className="text-sm font-black text-white">{stats.activity}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#007AFF] rounded-full transition-all duration-[2000ms]" style={{ width: `${stats.activity}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRings;