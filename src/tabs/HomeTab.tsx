import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Activity, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  BarChart3,
  BrainCircuit,
  Fingerprint,
  Zap,
  Camera,
  Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// INFRAESTRUCTURA
import { apiService } from '../services/infrastructure/apiService';
import { MetraCore } from '../services/ai/metraCore';
import InsightCard from '../components/ui/InsightCard';
import { PostPrandialReminder } from '../components/PostPrandialReminder';
import PatientClinicalSummaryModal from '../components/modals/PatientClinicalSummaryModal';

import type { UserData, HistoryEntry } from '../types';

interface HomeTabProps {
  currentUser: UserData | null;
  onStartClick: () => void;
  history: HistoryEntry[];
}

const HomeTab: React.FC<HomeTabProps> = ({ currentUser, onStartClick, history = [] }) => {
  const navigate = useNavigate();
  const [quickGlucose, setQuickGlucose] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const [selectedMealForClosure, setSelectedMealForClosure] = useState<HistoryEntry | null>(null);
  const [showClinicalSummary, setShowClinicalSummary] = useState(false);
  const [runOnboarding, setRunOnboarding] = useState(false);

  // Verificar Onboarding en carga inicial
  React.useEffect(() => {
     const hasSeen = localStorage.getItem('hasSeenOnboarding');
     if (!hasSeen) {
         // Pequeño delay para que renderice la UI
         setTimeout(() => setRunOnboarding(true), 1500);
     }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
       setRunOnboarding(false);
       localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  const onboardingSteps = [
    {
      target: '.import-device-btn',
      content: '¿Usas bomba de insulina o medidor continuo (CGM)? Sube tu reporte aquí para que la IA cruce tus glucemias con las fotos de tu comida.',
      disableBeacon: true,
    }
  ];

  const clinicalSummary = useMemo(() => {
    if (!currentUser || !history.length) return null;
    return MetraCore.generateAdvancedMedicalSummary(history, currentUser);
  }, [history, currentUser]);

  // IA: Análisis de tendencias
  const insights = useMemo(() => {
    if (!currentUser || !history.length) return [];
    return MetraCore.analyzeMetabolicTrends(history, currentUser);
  }, [history, currentUser]);

  // Lógica de Gráfico Semanal
  const chartData = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return history
      .filter(entry => (entry.timestamp || entry.date) && new Date(entry.timestamp || entry.date) >= sevenDaysAgo)
      .map(entry => ({
        time: new Date(entry.timestamp || entry.date).toLocaleDateString('es-CL', { weekday: 'short' }),
        value: entry.bloodGlucoseValue || entry.value,
        fullDate: new Date(entry.timestamp || entry.date).getTime()
      }))
      .sort((a, b) => a.fullDate - b.fullDate);
  }, [history]);

  const glucoseStats = useMemo(() => {
    const glucoseEntries = history.filter(e => typeof e.bloodGlucoseValue === 'number' || typeof e.value === 'number');
    const count = glucoseEntries.length;
    if (count === 0) return { average: 0, count: 0, ranges: { hypo: 0, target: 0, mildHyper: 0, hyper: 0 } };

    let sum = 0;
    let hypo = 0;
    let target = 0;
    let mildHyper = 0;
    let hyper = 0;

    glucoseEntries.forEach(e => {
      const val = (e.bloodGlucoseValue || e.value) as number;
      sum += val;
      if (val < 70) hypo++;
      else if (val <= 150) target++;
      else if (val <= 200) mildHyper++;
      else hyper++;
    });

    return {
      average: Math.round(sum / count),
      count,
      ranges: {
        hypo: (hypo / count) * 100,
        target: (target / count) * 100,
        mildHyper: (mildHyper / count) * 100,
        hyper: (hyper / count) * 100
      }
    };
  }, [history]);

  const todaysCarbs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return history
      .filter(e => {
          const d = new Date(e.timestamp || e.date);
          return d >= today;
      })
      .reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0);
  }, [history]);

  const handleQuickLog = async () => {
    const val = parseFloat(quickGlucose);
    if (!val || val <= 0) {
      setFeedback({ type: 'error', msg: 'Valor inválido' });
      return;
    }
    
    setIsSaving(true);
    try {
      if (!currentUser?.id) {
        setFeedback({ type: 'error', msg: 'Sesión requerida' });
        return;
      }
      
      await apiService.addHistoryEntry(currentUser.id, {
        value: val,
        timestamp: new Date().toISOString(),
        type: 'GLUCOSE',
        notes: 'Registro rápido'
      });

      setFeedback({ type: 'success', msg: 'Sincronización completa' });
      setQuickGlucose('');
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback({ type: 'error', msg: 'Error de conexión' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-28 px-6 pt-6 antialiased">
      
      {/* SECCIÓN HERO: REPOSICIONADA PARA CONTEO DE CARBS E IA */}
      <section className="relative overflow-hidden bg-white rounded-[4rem] border border-slate-50 p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        
        {/* ONBOARDING TOOLTIP */}
        <Joyride
          steps={onboardingSteps}
          run={runOnboarding}
          continuous={true}
          showSkipButton={true}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#2563eb', // text-blue-600
              zIndex: 1000,
            },
            tooltipContainer: {
              textAlign: 'left',
              fontSize: '12px'
            }
          }}
          locale={{ back: 'Atrás', close: 'Cerrar', last: 'Entendido', next: 'Siguiente', skip: 'Saltar' }}
        />

        <div className="absolute top-0 right-0 p-12 text-blue-600/5 pointer-events-none rotate-12">
           <Activity size={400} />
        </div>

        {/* BADGE ELIMINADO SEGÚN REQUERIMIENTO */}

        <div className="relative">
          <h1 className="text-4xl md:text-7xl font-[1000] text-slate-900 tracking-tighter leading-[0.9] mb-6 italic uppercase">
            {currentUser?.firstName ? (
                <>Hola {currentUser.firstName}, <br/><span className="text-blue-600">Tu Vida, Sin Complicaciones</span> por la Diabetes.</>
            ) : (
                <>Tu Vida, <span className="text-blue-600">Sin Complicaciones</span> por la Diabetes.</>
            )}
          </h1>
          <p className="max-w-2xl text-slate-500 font-medium text-lg mb-12 leading-tight tracking-tight">
            Gestiona tu glucosa y cuenta carbohidratos en segundos con VitaMetras, tu asistente médico IA disponible 24/7. Tecnología diseñada para tu tranquilidad.
          </p>
        </div>

        {/* INPUT DE REGISTRO RÁPIDO Y COMIDA */}
        <div className="max-w-xl mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-600/20 rounded-[3rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <input 
              type="number" 
              inputMode="numeric"
              placeholder="000 mg/dL"
              value={quickGlucose}
              onChange={(e) => setQuickGlucose(e.target.value)}
              className="relative w-full px-10 py-7 bg-slate-50 border-none rounded-[2.5rem] text-3xl font-[1000] outline-none transition-all placeholder:text-slate-200 italic tracking-tighter text-blue-700"
            />
            <button 
              onClick={handleQuickLog}
              disabled={isSaving}
              className="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              {isSaving ? <Activity className="animate-spin" size={16} /> : 'Registrar comida o glucosa'}
            </button>
          </div>
          
          <p className="mt-4 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Camera size={14} className="text-blue-500" />
            Sube una foto de tu comida para estimar carbohidratos o registra tu medición de glucosa.
          </p>

          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-4 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${feedback.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}
              >
                {feedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {feedback.msg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onStartClick}
            className="px-12 py-6 bg-blue-600 text-white rounded-[2.5rem] font-[1000] uppercase text-[12px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 active:scale-95"
          >
            ANALIZAR PLATO <Camera size={20} />
          </button>
          
          <button 
            onClick={() => navigate('/import')}
            className="import-device-btn px-12 py-6 bg-white border border-slate-100 text-slate-900 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-3"
          >
            Cargar Reporte
          </button>
        </div>
      </section>

      {/* NUEVA SECCIÓN: CUADROS DE DATOS CON TOOLTIPS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 -mt-20 px-4">
        {/* Caja 1: Glucosa */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col justify-between group h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Glucosa (Promedio)</span>
              <div className="relative flex group/tooltip cursor-help">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">i</div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-50 text-center pointer-events-none">
                  Promedio histórico de todos tus niveles de azúcar en sangre medidos en mg/dL.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-[1000] text-slate-900 italic tracking-tighter leading-none">
              {glucoseStats.average > 0 ? glucoseStats.average : '--'} <span className="text-sm font-bold text-slate-400 not-italic">mg/dL</span>
            </p>
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{glucoseStats.count} registros totales</span>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
        </div>

        {/* Caja 2: Carbohidratos */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col justify-between group h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Carbohidratos (Hoy)</span>
              <div className="relative flex group/tooltip cursor-help">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">i</div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-50 text-center pointer-events-none">
                  Cantidad total de carbohidratos consumidos en el día de hoy (desde las 00:00).
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-[1000] text-slate-900 italic tracking-tighter leading-none">
              {todaysCarbs} <span className="text-sm font-bold text-slate-400 not-italic">g</span>
            </p>
          </div>
          <div className="flex items-center justify-end mt-6">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
        </div>

        {/* Caja 3: Distribución de Glucosa */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col justify-between group h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Distribución de Glucosa</span>
                <div className="relative flex group/tooltip cursor-help">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">i</div>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all shadow-xl z-50 text-center pointer-events-none">
                    Distribución de tus niveles históricos en Tiempo en Rango (TIR). Hipoglucemia, En Rango e Hiperglucemia (% del total).
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {glucoseStats.count > 0 ? (
                <div className="w-full space-y-3 mt-2">
                    <div className="w-full h-8 flex rounded-xl overflow-hidden shadow-inner">
                        {glucoseStats.ranges.hypo > 0 && <div style={{width: `${glucoseStats.ranges.hypo}%`}} className="bg-rose-300 transition-all duration-1000" title={`Hipoglucemia: ${Math.round(glucoseStats.ranges.hypo)}%`} />}
                        {glucoseStats.ranges.target > 0 && <div style={{width: `${glucoseStats.ranges.target}%`}} className="bg-emerald-300 transition-all duration-1000" title={`En Rango: ${Math.round(glucoseStats.ranges.target)}%`} />}
                        {glucoseStats.ranges.mildHyper > 0 && <div style={{width: `${glucoseStats.ranges.mildHyper}%`}} className="bg-amber-200 transition-all duration-1000" title={`Hiper Leve: ${Math.round(glucoseStats.ranges.mildHyper)}%`} />}
                        {glucoseStats.ranges.hyper > 0 && <div style={{width: `${glucoseStats.ranges.hyper}%`}} className="bg-amber-400 transition-all duration-1000" title={`Hiperglucemia: ${Math.round(glucoseStats.ranges.hyper)}%`} />}
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-[1000] text-slate-900 uppercase italic tracking-tighter">{Math.round(glucoseStats.ranges.target)}% En Rango</span>
                        <div className="flex items-center gap-1.5 opacity-60">
                           <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TIR</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[60px] flex items-center justify-center bg-slate-50 rounded-xl text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  Sin datos
                </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN INSIGHTS: FOCO MÉDICO */}
      <section className="space-y-8 mt-12">
        <div className="flex items-end justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-blue-400 rounded-3xl">
              <Stethoscope size={28} />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                Reportes para tu Diabetólogo
              </h3>
              <h4 className="text-3xl font-[1000] text-slate-900 tracking-tighter italic uppercase leading-none">
                Tu Diario <span className="text-blue-600">Inteligente</span>
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowClinicalSummary(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center gap-2"
             >
                <Stethoscope size={16} /> Ver Dashboard Médico
             </button>
             <Fingerprint size={32} className="text-slate-100" />
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3.5rem] p-16 border border-slate-50 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-blue-200">
                <Sparkles size={32} />
            </div>
            <p className="text-slate-900 text-lg font-[1000] uppercase italic tracking-tighter">Listo para analizar tu primera comida</p>
            <p className="text-slate-500 text-[12px] font-medium tracking-wide mt-2 max-w-sm mx-auto leading-relaxed">
              Sube una foto de tu plato o registra tu glucosa para que VitaMetras identifique patrones y te ayude a decidir mejor.
            </p>
          </div>
        )}
      </section>

      {/* SECCIÓN GRÁFICA */}
      <section className="bg-white rounded-[4rem] border border-slate-50 p-10 md:p-14 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-blue-600" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Curva Postprandial</h3>
            </div>
            <h4 className="text-4xl font-[1000] text-slate-900 tracking-tighter italic uppercase leading-none">
              Historial <span className="text-blue-600">Glucémico</span>
            </h4>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <Calendar size={18} className="text-blue-400" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Últimos 7 Días</span>
          </div>
        </div>

        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }}
                  dy={20}
                />
                <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900', padding: '15px' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <ReferenceLine y={100} stroke="#e2e8f0" strokeWidth={1} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={6} 
                  dot={{ r: 6, fill: '#2563eb', strokeWidth: 4, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 0 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
              <BarChart3 size={60} strokeWidth={1} className="text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin datos de glucemia</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER DE SEGURIDAD */}
      <footer className="flex flex-wrap justify-center items-center gap-10 opacity-30 pt-10 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <Shield size={16} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Datos Protegidos para Uso Médico</span>
        </div>
        <div className="flex items-center gap-3">
          <Activity size={16} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Sincronización con Glucometros</span>
        </div>
      </footer>

      {showClinicalSummary && currentUser && clinicalSummary && (
        <PatientClinicalSummaryModal 
            patientId={currentUser.id}
            patientName={`${currentUser.firstName} ${currentUser.lastName || ''}`}
            patientRut={currentUser.rut}
            diabetesType={currentUser.diabetesType}
            history={history}
            summary={clinicalSummary}
            onClose={() => setShowClinicalSummary(false)}
        />
      )}
    </div>
  );
};

export default HomeTab;