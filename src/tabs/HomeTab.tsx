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
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { PostPrandialReminder } from '../components/PostPrandialReminder'; // Asegúrate de crear este archivo
// import ClosureModal from '../components/modals/ClosureModal'; // Importar cuando lo tengas en archivos

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
  
  // Estado para el modal de cierre de bucle
  const [selectedMealForClosure, setSelectedMealForClosure] = useState<HistoryEntry | null>(null);

  // IA: Análisis de tendencias
  const insights = useMemo(() => {
    if (!currentUser || !history.length) return [];
    return MetraCore.analyzeMetabolicTrends(history, currentUser);
  }, [history, currentUser]);

  // LÓGICA DE CIERRE DE BUCLE: Detectar comida reciente (entre 1.5 y 4 horas atrás) sin glucosa post-prandial
  const pendingMealForClosure = useMemo(() => {
    if (!history.length) return null;
    
    const now = new Date().getTime();
    const windowStart = now - (4 * 60 * 60 * 1000); // 4 horas máximo
    const windowEnd = now - (1.5 * 60 * 60 * 1000); // 1.5 horas mínimo
    
    return history.find(entry => {
      const entryTime = new Date(entry.timestamp || entry.date).getTime();
      return (
        entry.type === 'MEAL' && 
        !entry.postPrandialGlucose && 
        entryTime > windowStart && 
        entryTime < windowEnd
      );
    });
  }, [history]);

  // Lógica de Gráfico Semanal
  const chartData = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return history
      .filter(entry => entry.timestamp && new Date(entry.timestamp) >= sevenDaysAgo)
      .map(entry => ({
        time: new Date(entry.timestamp).toLocaleDateString('es-CL', { weekday: 'short' }),
        value: entry.bloodGlucoseValue || entry.value,
        fullDate: new Date(entry.timestamp).getTime()
      }))
      .sort((a, b) => a.fullDate - b.fullDate);
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
        setFeedback({ type: 'error', msg: 'Bio-Identidad requerida' });
        return;
      }
      
      await apiService.addHistoryEntry(currentUser.id, {
        value: val,
        timestamp: new Date().toISOString(),
        type: 'GLUCOSE',
        notes: 'Quick Log Automático'
      });

      setFeedback({ type: 'success', msg: 'Sincronización completa' });
      setQuickGlucose('');
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback({ type: 'error', msg: 'Fallo de enlace' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClosure = async (id: string, glucose: number, score: number) => {
    // Aquí iría la llamada a la API para actualizar el registro con postPrandialGlucose
    console.log("Cerrando bucle para:", id, "Glucosa:", glucose);
    setSelectedMealForClosure(null);
    setFeedback({ type: 'success', msg: 'Bucle cerrado: IA entrenada' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-28 px-6 pt-6 antialiased">
      
      {/* SECCIÓN HERO: BIENVENIDA & STATUS */}
      <section className="relative overflow-hidden bg-white rounded-[4rem] border border-slate-50 p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 p-12 text-indigo-600/5 pointer-events-none rotate-12">
           <Activity size={400} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10"
        >
          <Zap size={14} className="fill-current" /> Vitametra Core v4.2
        </motion.div>

        <div className="relative">
          <h1 className="text-5xl md:text-8xl font-[1000] text-slate-900 tracking-tighter leading-[0.9] mb-6 italic uppercase">
            {currentUser?.name ? (
                <>Hola, <span className="text-indigo-600">{currentUser.name.split(' ')[0]}</span></>
            ) : (
                <>Control <span className="text-indigo-600">Total</span></>
            )}
          </h1>
          <p className="max-w-xl text-slate-400 font-bold text-lg mb-12 leading-tight uppercase tracking-tight">
            Análisis biométrico en tiempo real impulsado por inteligencia artificial.
          </p>
        </div>

        {/* INPUT DE REGISTRO RÁPIDO - LOOK PROFESIONAL */}
        <div className="max-w-md mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-indigo-600/20 rounded-[3rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <input 
              type="number" 
              inputMode="numeric"
              placeholder="000 mg/dL"
              value={quickGlucose}
              onChange={(e) => setQuickGlucose(e.target.value)}
              className="relative w-full px-10 py-7 bg-slate-50 border-none rounded-[2.5rem] text-3xl font-[1000] outline-none transition-all placeholder:text-slate-200 italic tracking-tighter"
            />
            <button 
              onClick={handleQuickLog}
              disabled={isSaving}
              className="absolute right-3 top-3 bottom-3 px-8 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
              {isSaving ? <Activity className="animate-spin" size={16} /> : 'REGISTRAR'}
            </button>
          </div>

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
            className="px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-[1000] uppercase text-[12px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
          >
            PANEL DE ANÁLISIS <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={() => navigate('/planes')}
            className="px-12 py-6 bg-white border border-slate-100 text-slate-400 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95"
          >
            Ver Planes (Aviones)
          </button>
        </div>
      </section>

      {/* BLOQUE DE CIERRE DE BUCLE (DINÁMICO) */}
      <AnimatePresence>
        {pendingMealForClosure && (
          <section className="px-2">
             <PostPrandialReminder 
                pendingMeal={{
                  id: pendingMealForClosure.id!,
                  foodName: pendingMealForClosure.foodName || 'Análisis Previo',
                  timestamp: pendingMealForClosure.timestamp || pendingMealForClosure.date
                }}
                onOpenClosure={() => setSelectedMealForClosure(pendingMealForClosure)}
             />
          </section>
        )}
      </AnimatePresence>

      {/* SECCIÓN INSIGHTS: BRAIN CORE */}
      <section className="space-y-8">
        <div className="flex items-end justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-indigo-400 rounded-3xl">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                Motor de Inferencia IA
              </h3>
              <h4 className="text-3xl font-[1000] text-slate-900 tracking-tighter italic uppercase leading-none">
                Bio-Insights
              </h4>
            </div>
          </div>
          <Fingerprint size={32} className="text-slate-100" />
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3.5rem] p-16 border border-slate-50 text-center shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-indigo-200">
                <Sparkles size={32} />
            </div>
            <p className="text-slate-900 text-lg font-[1000] uppercase italic tracking-tighter">Esperando Bio-Data</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed">Analiza una comida o registra tu glucosa <br/> para activar patrones.</p>
          </div>
        )}
      </section>

      {/* SECCIÓN GRÁFICA: BIOMETRÍA SEMANAL */}
      <section className="bg-white rounded-[4rem] border border-slate-50 p-10 md:p-14 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-indigo-600" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Fluctuación Glicémica</h3>
            </div>
            <h4 className="text-4xl font-[1000] text-slate-900 tracking-tighter italic uppercase leading-none">
              Tendencia <span className="text-indigo-600">Vital</span>
            </h4>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <Calendar size={18} className="text-indigo-400" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Últimos 7 Días</span>
          </div>
        </div>

        <div className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
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
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <ReferenceLine y={100} stroke="#e2e8f0" strokeWidth={1} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={6} 
                  dot={{ r: 6, fill: '#4f46e5', strokeWidth: 4, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 0 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
              <BarChart3 size={60} strokeWidth={1} className="text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Visualización Desactivada</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER DE SEGURIDAD */}
      <footer className="flex flex-wrap justify-center items-center gap-10 opacity-30 pt-10 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <Shield size={16} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">AES-256 Health Guard</span>
        </div>
        <div className="flex items-center gap-3">
          <Activity size={16} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Predictive Engine v4</span>
        </div>
      </footer>

      {/* RENDERIZADO CONDICIONAL DEL MODAL DE CIERRE (Cuando lo integres) */}
      {/* {selectedMealForClosure && (
        <ClosureModal 
          mealEntry={selectedMealForClosure}
          onClose={() => setSelectedMealForClosure(null)}
          onSaveClosure={handleSaveClosure}
        />
      )} */}
    </div>
  );
};

export default HomeTab;