import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, History, Clock, Activity, ShieldCheck } from 'lucide-react';

// Dashboard Components
import { MetabolicSummaryCard } from '../components/dashboard/MetabolicSummaryCard';
import { WeightProgressCard } from '../components/dashboard/WeightProgressCard';
import { NutritionLogger } from '../components/nutrition/NutritionLogger';
import { GlucoseChart } from '../components/dashboard/GlucoseChart';
import { BioDetailModal } from '../components/dashboard/BioDetailModal';
import { StreakCard } from '../components/dashboard/StreakCard';
import { FastingTimerCard } from '../components/dashboard/FastingTimerCard';
import { EnergyBudgetCard } from '../components/dashboard/EnergyBudgetCard';
import { NutrientTargetsCard } from '../components/dashboard/NutrientTargetsCard';
import { ActivityTrackerCard } from '../components/dashboard/ActivityTrackerCard';
import { BioAvailabilityCard } from '../components/dashboard/BioAvailabilityCard';
import { BioSuggestionToast } from '../components/dashboard/BioSuggestionToast';
import { BioComparisonCard } from '../components/dashboard/BioComparisonCard';

// Services & Types
import { glucosePredictor } from '../services/glucosePredictor';
import { bioAdvisor } from '../services/bioAdvisor';
import { UserData } from '../types';

interface IngestionRecord {
  id: string;
  time: string;
  foodName: string;
  carbs: number;
  impact: 'Bajo' | 'Medio' | 'Alto';
}

interface HomeTabProps {
  onStartClick: () => void;
  userName?: string;
  lastGlucose?: number;
  currentUser: UserData; 
}

const INITIAL_GLUCOSE_HISTORY = [
  { time: '08:00', value: 95 },
  { time: '09:00', value: 105 },
  { time: '10:00', value: 98 },
  { time: '11:00', value: 102 },
];

const HomeTab: React.FC<HomeTabProps> = ({ onStartClick, userName, lastGlucose, currentUser }) => {
  // --- ESTADOS ---
  const [chartData, setChartData] = useState<any[]>(() => {
    const saved = localStorage.getItem('vitaMetra_chartData');
    return saved ? JSON.parse(saved) : INITIAL_GLUCOSE_HISTORY;
  });

  const [ingestionHistory, setIngestionHistory] = useState<IngestionRecord[]>(() => {
    const saved = localStorage.getItem('vitaMetra_ingestionHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IngestionRecord | null>(null);
  const [suggestion, setSuggestion] = useState<{msg: string, action: string} | null>(null);
  const [showToast, setShowToast] = useState(false);

  // --- PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem('vitaMetra_chartData', JSON.stringify(chartData));
  }, [chartData]);

  useEffect(() => {
    localStorage.setItem('vitaMetra_ingestionHistory', JSON.stringify(ingestionHistory));
  }, [ingestionHistory]);

  // --- MOTOR DE LOGICA DE NUTRICIÓN (handleNutritionLogged) ---
  const handleNutritionLogged = (dataString: string) => {
    try {
      const newFoods = JSON.parse(dataString);
      const totalCarbs = newFoods.reduce((acc: number, f: any) => acc + (f.carbs || 0), 0);

      // 1. Obtener consejo y factores de modulación del BioAdvisor
      const advice = bioAdvisor.getAdvice(newFoods);
      
      // 2. Generar predicción de curva usando los factores (altura y retraso)
      const currentLevel = lastGlucose || (chartData[chartData.length - 1]?.value) || 100;
      const projection = glucosePredictor.predictImpact(
        currentLevel, 
        totalCarbs, 
        { delay: advice.delayFactor, height: advice.heightFactor }
      );

      // 3. Preparar el Toast con el veredicto de la IA
      setSuggestion({
        msg: advice.message,
        action: advice.action
      });
      setShowToast(true);

      // 4. Actualizar el Historial Visual
      const maxLevel = Math.max(...projection.map(p => p.value));
      const newRecord: IngestionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        foodName: newFoods.map((f: any) => f.name).join(', '),
        carbs: totalCarbs,
        impact: maxLevel > 160 ? 'Alto' : maxLevel > 130 ? 'Medio' : 'Bajo'
      };
      
      setIngestionHistory(prev => [newRecord, ...prev]);

      // 5. Integrar Proyección en el Gráfico
      const formattedProjection = projection.map(p => ({ 
        time: p.time, 
        value: p.value, 
        isProjection: true 
      }));
      
      const historyOnly = chartData.filter(p => !p.isProjection);
      setChartData([...historyOnly, ...formattedProjection]);

    } catch (error) {
      console.error("Error en Bio-Core Engine:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] font-sans antialiased pb-24">
      
      {/* HEADER: APPLE HEALTH STYLE */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007AFF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 leading-none">Dashboard</p>
              <h2 className="text-lg font-black italic uppercase leading-none">{currentUser.firstName || 'Usuario'}</h2>
            </div>
          </div>
          <button 
            onClick={onStartClick}
            className="bg-[#007AFF] text-white px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#0062CC] transition-all flex items-center gap-2"
          >
            <Zap size={14} fill="currentColor" /> Nuevo Registro
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 pt-10">
        
        {/* SECCIÓN 1: GRÁFICO DE PREDICCIÓN */}
        <section className="mb-10">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-[1000] italic uppercase tracking-tighter leading-none mb-2">
                  Estado <span className="text-[#007AFF]">Bio-Core</span>
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#34C759]" /> Sincronización Metabólica Activa
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <GlucoseChart data={chartData} />
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: GRID DE INTELIGENCIA */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          <div className="xl:col-span-8 space-y-10">
            {/* Fila 1: Energía y Actividad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EnergyBudgetCard target={2200} consumed={1450} bmr={1650} activity={350} />
              <ActivityTrackerCard type="Bio-Entrenamiento" duration={45} intensity="Media" glucoseDrop={22} />
            </div>

            {/* Fila 2: Simulador */}
            <BioComparisonCard />

            {/* Fila 3: Sinergia y Hábitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <BioAvailabilityCard />
              <div className="space-y-8">
                <StreakCard days={currentUser.streak || 0} />
                <FastingTimerCard />
              </div>
            </div>
            
            {/* Historial de Eventos */}
            <div className="space-y-6">
              <h2 className="text-[11px] font-[1000] text-slate-400 uppercase tracking-[0.25em]">Eventos Recientes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ingestionHistory.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-2"><Clock size={12}/> {item.time}</span>
                      <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${item.impact === 'Alto' ? 'bg-red-50 text-[#FF3B30]' : 'bg-green-50 text-[#34C759]'}`}>
                        Impacto {item.impact}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase italic truncate">{item.foodName}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: LOGS Y WEIGHT */}
          <div className="xl:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <NutritionLogger onAnalysisComplete={handleNutritionLogged} />
              <WeightProgressCard currentUser={currentUser} />
              <NutrientTargetsCard />
              <MetabolicSummaryCard currentUser={currentUser} />
            </div>
          </div>
        </div>
      </main>

      {/* FEEDBACK SYSTEMS */}
      <BioSuggestionToast 
        isVisible={showToast} 
        message={suggestion?.msg || ""} 
        action={suggestion?.action}
        onClose={() => setShowToast(false)} 
      />

      <footer className="mt-20 py-10 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">VitaMetra Bio-Systems • 2026</p>
      </footer>
    </div>
  );
};

export default HomeTab;