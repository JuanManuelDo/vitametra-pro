import React, { useState, useEffect } from 'react';
import { Timer, Zap, Moon } from 'lucide-react';

export const FastingTimerCard: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const targetHours = 16; // Meta estándar 16:8
  const targetSeconds = targetHours * 3600;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const progress = (seconds / targetSeconds) * 100;

  // Cálculo del círculo SVG
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
          <Timer size={20} />
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Bio-Fast Mode</span>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        {/* Temporizador Circular */}
        <div className="relative flex items-center justify-center mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64" cy="64" r={radius}
              stroke="currentColor" strokeWidth="8"
              fill="transparent" className="text-slate-50"
            />
            <circle
              cx="64" cy="64" r={radius}
              stroke="currentColor" strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
              className="text-indigo-600 shadow-xl"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-[1000] text-slate-900 italic leading-none">
              {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">
              Transcurrido
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
             {hours >= 12 ? <Moon size={12} className="text-indigo-400" /> : <Zap size={12} className="text-orange-400" />}
             <p className="text-[10px] font-black text-slate-900 uppercase italic">
               {hours >= 12 ? "Autofagia Activa" : "Estado Post-Prandial"}
             </p>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Meta: {targetHours}h Ayuno
          </p>
        </div>
      </div>
      
      <button className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
        Reiniciar Ciclo
      </button>
    </div>
  );
};