import React from 'react';
import { ArrowRight, Play, Zap, ShieldCheck, Sparkles, TrendingUp, Target, Flame } from 'lucide-react';
import { type UserData, type HistoryEntry } from '../types';

interface HomeTabProps {
  onStartClick: () => void;
  user?: UserData | null;
  history?: HistoryEntry[];
}

const HomeTab: React.FC<HomeTabProps> = ({ onStartClick, user, history = [] }) => {
  
  // Lógica para el Dashboard (Imagen 1 y 2)
  const totalCarbsToday = history
    .filter(e => {
      const today = new Date().toDateString();
      return new Date(e.createdAt).toDateString() === today;
    })
    .reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0);

  const carbGoal = 150; // Meta ejemplo
  const progress = Math.min((totalCarbsToday / carbGoal) * 100, 100);

  // VISTA 1: DASHBOARD (Si el usuario ya entró)
  if (user) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* SALUDO INICIAL */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Resumen Diario</p>
            <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 italic uppercase">Hola, {user.name?.split(' ')[0] || 'Vitametra'}</h1>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
            <TrendingUp className="text-metra-blue" size={24} />
          </div>
        </div>

        {/* ANILLO DE PROGRESO ESTILO APPLE HEALTH (Imagen 1) */}
        <div className="metra-card relative overflow-hidden flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-metra-blue rounded-full" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo Hoy</p>
                <p className="text-3xl font-black text-slate-800">{totalCarbsToday}g <span className="text-sm text-slate-300">/ {carbGoal}g</span></p>
              </div>
            </div>
            <button 
              onClick={() => onStartClick()} // Aquí puedes navegar al analyzer
              className="bg-metra-blue text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              Nuevo Análisis
            </button>
          </div>

          {/* Círculo de Progreso SVG */}
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-metra-blue transition-all duration-1000 ease-out" strokeWidth="4" strokeDasharray={`${progress}, 100`} strokeLinecap="round" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Zap size={20} className="text-metra-blue" />
              <span className="text-xs font-black">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* MÉTRICAS SECUNDARIAS (Imagen 2) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="metra-card !p-5 flex flex-col gap-3">
            <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-500">
              <Target size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta Semanal</p>
              <p className="text-xl font-black text-slate-800 tracking-tight">85% Logrado</p>
            </div>
          </div>
          <div className="metra-card !p-5 flex flex-col gap-3">
            <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center text-orange-500">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Racha Vitametra</p>
              <p className="text-xl font-black text-slate-800 tracking-tight">12 Días 🔥</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: LANDING PAGE (Si no hay usuario)
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden -mt-20">
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 text-center space-y-10 max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/50 backdrop-blur-md border border-blue-100 shadow-sm">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700">Tecnología de Precisión 10X</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-[110px] font-black tracking-tighter text-slate-900 leading-[0.85] uppercase italic">
            Transforma tu<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400">
              Metabolismo
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium leading-tight">
            La primera IA que <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-4">entiende tu cuerpo</span>. Predice picos de glucosa con una foto.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={onStartClick}
            className="group relative bg-metra-blue text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            Empezar Conteo con IA
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>

          <button 
            onClick={onStartClick}
            className="group flex items-center gap-4 text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] px-8 py-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-50 group-hover:border-blue-600 transition-all">
              <Play size={20} className="fill-current ml-1" />
            </div>
            Ver Demo
          </button>
        </div>

        <div className="pt-12 flex flex-wrap justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
            <ShieldCheck size={16} /> Privacidad Encriptada
          </div>
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
            <Zap size={16} /> Resultados en 3s
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;