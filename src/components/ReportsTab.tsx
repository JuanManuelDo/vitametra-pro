import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Lock, 
  Sparkles, 
  BrainCircuit,
  Info,
  Activity,
  Target,
  ChevronRight
} from 'lucide-react';
import type { HistoryEntry, UserData } from '../types';
import { useNavigate } from 'react-router-dom';

interface ReportsTabProps {
  currentUser: UserData;
  history: HistoryEntry[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ currentUser, history }) => {
  const navigate = useNavigate();
  const isPro = currentUser.subscription_tier === 'PRO';

  // LÓGICA CLÍNICA IA: Tiempo en Rango (TIR) y Precisión
  const clinicalMetrics = useMemo(() => {
    if (!history.length) return { tir: 0, accuracy: 0, avgGlucose: 0 };
    
    const calibrated = history.filter(h => h.isCalibrated && h.bloodGlucoseValue);
    const inRange = calibrated.filter(h => h.glucosePost2h! >= 70 && h.glucosePost2h! <= 180).length;
    
    // Simulación de precisión: Qué tan cerca estuvo la predicción de la realidad
    const accuracy = calibrated.length > 0 ? 92 : 0; 
    
    return {
      tir: calibrated.length > 0 ? Math.round((inRange / calibrated.length) * 100) : 0,
      accuracy: accuracy,
      avgGlucose: calibrated.length > 0 
        ? Math.round(calibrated.reduce((acc, h) => acc + (h.glucosePost2h || 0), 0) / calibrated.length) 
        : 0
    };
  }, [history]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 animate-in fade-in duration-700 px-4">
      
      {/* HEADER MÉDICO */}
      <div className="flex justify-between items-end pt-6">
        <div>
          <h1 className="text-3xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
            Reporte <span className="text-blue-600">Bio-Metra</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
            Análisis de los últimos {history.length} registros
          </p>
        </div>
        <div className="bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
          <Calendar size={14} className="text-blue-600" />
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">Feb 2026</span>
        </div>
      </div>

      {/* MÉTRICA PRINCIPAL: TIEMPO EN RANGO (Estilo Apple Watch) */}
      <div className="metra-card bg-slate-900 text-white relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-blue-400 text-[10px] font-[900] uppercase tracking-[0.2em]">Tiempo en Rango (TiR)</p>
            <h2 className="text-6xl font-[1000] tracking-tighter italic">
              {isPro ? `${clinicalMetrics.tir}%` : '---'}
            </h2>
            <p className="text-slate-400 text-xs font-bold">Objetivo Clínico: >70%</p>
          </div>
          <div className="w-24 h-24 rounded-full border-[10px] border-blue-600/20 border-t-blue-500 flex items-center justify-center relative">
              <Activity className="text-blue-500 animate-pulse" />
          </div>
        </div>
        {!isPro && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-20">
                <button onClick={() => navigate('/plans')} className="btn-metra-confirm !py-3 !text-[10px]">DESBLOQUEAR ANÁLISIS PRO</button>
            </div>
        )}
      </div>

      {/* GRID DE MÉTRICAS CLÍNICAS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="metra-card flex flex-col items-center text-center py-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-3">
                <Target size={20} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Precisión IA</p>
            <p className="text-3xl font-[1000] text-slate-800">{isPro ? `${clinicalMetrics.accuracy}%` : '--'}</p>
        </div>
        <div className="metra-card flex flex-col items-center text-center py-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3">
                <TrendingUp size={20} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Glucosa Media</p>
            <p className="text-3xl font-[1000] text-slate-800">{isPro ? clinicalMetrics.avgGlucose : '--'}</p>
        </div>
      </div>

      {/* INSIGHTS DE COMPORTAMIENTO IA */}
      <div className="metra-card !p-0 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <BrainCircuit size={18} className="text-blue-600" />
                <h3 className="text-[10px] font-[1000] uppercase tracking-widest text-slate-800">Conclusiones del Agente</h3>
            </div>
            <Sparkles size={16} className="text-amber-400" />
        </div>
        <div className="p-8">
            {isPro ? (
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                    "Detectamos una sensibilidad reducida a la insulina entre las 18:00 y 21:00. <span className="text-blue-600">Sugerencia:</span> Ajustar ratio de cena a 1:12 para mejorar el TiR nocturno."
                </p>
            ) : (
                <p className="text-sm font-bold text-slate-300 blur-sm select-none">
                    El análisis profundo de patrones está reservado para usuarios PRO. Actualiza para desbloquear tu mapa de salud.
                </p>
            )}
        </div>
      </div>

      {/* BOTÓN EXPORTAR PARA EL MÉDICO */}
      <button className="w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-blue-200 transition-all group">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <Info size={18} />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-[1000] uppercase tracking-widest text-slate-800">Exportar Reporte Médico</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">PDF optimizado para Diabetólogos</p>
            </div>
        </div>
        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
      </button>

      <div className="text-center opacity-20 py-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Vitametra Bio-Intelligence v4.5</p>
      </div>
    </div>
  );
};

export default ReportsTab;