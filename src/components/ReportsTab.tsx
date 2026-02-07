import React, { useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts'
import { TrendingUp, Target, Activity, Calendar, Zap, Clock } from 'lucide-react'
import type { HistoryEntry, UserData } from '../types'

interface ReportsTabProps {
  currentUser: UserData | null;
  history: HistoryEntry[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ history }) => {
  
  // 1. Preparar datos para la curva de glucosa (últimos 7 registros)
  const chartData = useMemo(() => {
    return history
      .slice(0, 7)
      .reverse()
      .map(entry => ({
        name: new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        valor: entry.bloodGlucoseValue || Math.floor(Math.random() * (140 - 90) + 90), 
        carbs: entry.totalCarbs
      }));
  }, [history]);

  // 2. Datos para el desglose por tipo de comida
  const mealData = [
    { name: 'Desayuno', value: 40, color: '#FF9500' },
    { name: 'Almuerzo', value: 85, color: '#007AFF' },
    { name: 'Cena', value: 65, color: '#34C759' },
    { name: 'Snacks', value: 30, color: '#FF2D55' },
  ];

  return (
    <div className="min-h-screen bg-metra-dark text-white pb-32">
      {/* HEADER TIPO DASHBOARD DE CONTROL */}
      <header className="px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-metra-blue rounded-full animate-pulse shadow-[0_0_8px_#007AFF]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Bio-Analytics Engine</span>
        </div>
        <h2 className="text-4xl font-[1000] tracking-tighter leading-none">
          Reporte de <br/> <span className="text-metra-blue italic">Estabilidad</span>
        </h2>
      </header>

      <main className="px-6 space-y-8">
        
        {/* GRÁFICO DE ÁREA PREMIUM (NEÓN LOOK) */}
        <section className="relative group">
          {/* Resplandor de fondo para efecto OLED */}
          <div className="absolute inset-0 bg-metra-blue/10 blur-[60px] rounded-[3rem] -z-10 group-hover:bg-metra-blue/20 transition-all duration-700" />
          
          <div className="apple-card bg-white/5 backdrop-blur-3xl border-white/10 p-6 overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tendencia de Glucosa</p>
                <h3 className="text-2xl font-black italic">Bio-Core <span className="text-sm not-italic font-medium text-slate-400">Sync</span></h3>
              </div>
              <div className="bg-metra-green/20 text-metra-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-metra-green/30">
                Rango Óptimo
              </div>
            </div>

            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fill: '#64748b', fontWeight: 800}} 
                    dy={10}
                  />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      fontWeight: '900'
                    }}
                    itemStyle={{ color: '#007AFF' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#007AFF" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2500}
                    // Este filtro añade el brillo neón a la línea
                    filter="drop-shadow(0px 0px 8px rgba(0, 122, 255, 0.8))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* DISTRIBUCIÓN Y MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BAR CHART DE CRISTAL */}
          <div className="apple-card bg-white/5 border-white/5 p-6 backdrop-blur-md">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Carga por Categoría</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealData}>
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={35}>
                    {mealData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ filter: `drop-shadow(0px 0px 4px ${entry.color}80)` }}
                      />
                    ))}
                  </Bar>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INSIGHTS DE BIO-CORE */}
          <div className="space-y-4">
            <MetricCard 
              icon={<Target className="text-metra-green" size={20} />} 
              label="Estabilidad" 
              value="92%" 
              status="En Rango"
            />
            <MetricCard 
              icon={<Activity className="text-metra-blue" size={20} />} 
              label="Variabilidad" 
              value="12.4" 
              status="Baja"
            />
            <MetricCard 
              icon={<Calendar className="text-indigo-400" size={20} />} 
              label="Racha Activa" 
              value="14 Días" 
              status="Bio-Sync"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

/* COMPONENTE REUTILIZABLE PARA MÉTRICAS */
const MetricCard = ({ icon, label, value, status }: any) => (
  <div className="apple-card bg-white/[0.03] border-white/5 p-5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-black">{value}</p>
        <span className="text-[10px] font-bold text-metra-green uppercase tracking-tighter opacity-80">{status}</span>
      </div>
    </div>
  </div>
);

export default ReportsTab;