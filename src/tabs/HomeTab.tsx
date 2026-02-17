import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  BarChart3,
  BrainCircuit
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

// IMPORTACIONES DE SERVICIOS E INFRAESTRUCTURA ACTUALIZADAS
import { apiService } from '../services/infrastructure/apiService';
import { MetraCore } from '../services/ai/metraCore';
import InsightCard from '../components/ui/InsightCard';
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

  // 1. Lógica de IA: Análisis Proactivo de Tendencias
  const insights = useMemo(() => {
    if (!currentUser || !history.length) return [];
    return MetraCore.analyzeMetabolicTrends(history, currentUser);
  }, [history, currentUser]);

  // 2. Lógica de Gráfico (Tendencia Semanal)
  const chartData = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return history
      .filter(entry => new Date(entry.timestamp) >= sevenDaysAgo)
      .map(entry => ({
        time: new Date(entry.timestamp).toLocaleDateString('es-CL', { weekday: 'short' }),
        value: entry.value,
        fullDate: new Date(entry.timestamp).getTime()
      }))
      .sort((a, b) => a.fullDate - b.fullDate);
  }, [history]);

  const handleQuickLog = async () => {
    const val = parseFloat(quickGlucose);
    
    if (!val || val <= 0) {
      setFeedback({ type: 'error', msg: 'Ingresa un valor válido mayor a 0' });
      return;
    }
    if (val > 600) {
      setFeedback({ type: 'error', msg: 'Valor fuera de rango clínico normal' });
      return;
    }

    setIsSaving(true);
    try {
      if (!currentUser?.id) throw new Error("Inicia sesión primero");
      
      await apiService.addHistoryEntry(currentUser.id, {
        value: val,
        timestamp: new Date().toISOString(),
        type: 'GLUCOSE',
        notes: 'Registro rápido desde Inicio'
      });

      setFeedback({ type: 'success', msg: 'Glucemia guardada' });
      setQuickGlucose('');
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      
      {/* SECCIÓN HERO - IA DE GRADO CLÍNICO */}
      <section className="relative overflow-hidden bg-white rounded-[4rem] border border-slate-100 p-8 md:p-16 shadow-sm text-center">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Activity size={240} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] mb-10"
        >
          <Sparkles size={14} className="animate-pulse" /> Ecosistema Vitametra 2026
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-[1000] text-slate-900 tracking-tighter leading-[0.85] uppercase italic mb-10">
          Tu salud <br />
          <span className="text-blue-600">Automatizada</span>
        </h1>

        <div className="max-w-md mx-auto mb-12">
          <div className="relative group">
            <input 
              type="number" 
              placeholder="Ingresa tu glucosa actual..."
              value={quickGlucose}
              onChange={(e) => setQuickGlucose(e.target.value)}
              className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[2rem] text-xl font-black outline-none transition-all placeholder:text-slate-300 placeholder:italic"
            />
            <button 
              onClick={handleQuickLog}
              disabled={isSaving}
              className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              {isSaving ? '...' : <><Plus size={16} /> Log</>}
            </button>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${feedback.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}
              >
                {feedback.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {feedback.msg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStartClick}
            className="w-full sm:w-auto px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95 shadow-2xl shadow-slate-200"
          >
            {currentUser ? 'Iniciar Análisis IA' : 'Comenzar ahora'} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* --- NUEVA SECCIÓN: ANÁLISIS PROACTIVO IA --- */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Metra Cognitive Engine
            </h3>
            <h4 className="text-3xl font-[1000] text-slate-900 tracking-tighter uppercase italic">
              Insights <span className="text-blue-600">Metabólicos</span>
            </h4>
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[3rem] p-10 border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
              Analizando tu comportamiento...
            </p>
            <p className="text-slate-300 text-[10px] font-bold italic mt-2">
              Registra más comidas y glucemias para activar las recomendaciones inteligentes.
            </p>
          </div>
        )}
      </section>

      {/* MÓDULO DE TENDENCIA SEMANAL */}
      <section className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-sm">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-600" /> Biometría Predictiva
            </h3>
            <h4 className="text-3xl font-[1000] text-slate-900 tracking-tighter uppercase italic">
              Tendencia <span className="text-blue-600">Semanal</span>
            </h4>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
            <Calendar size={20} />
          </div>
        </div>

        <div className="h-[300px] w-full flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
                  dy={10}
                />
                <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
                />
                <ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="5 5" />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={5} 
                  dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                <BarChart3 size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400 max-w-[220px] mx-auto italic">
                Aún no hay suficientes datos para mostrar la tendencia semanal.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* FOOTER DE CONFIANZA TÉCNICA */}
      <footer className="flex justify-center items-center gap-10 opacity-30 pb-10">
        <div className="flex items-center gap-2">
          <Shield size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">AES-256 Encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Health Level Seven v2</span>
        </div>
      </footer>
    </div>
  );
};

export default HomeTab;