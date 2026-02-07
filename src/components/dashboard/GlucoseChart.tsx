import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

interface GlucoseChartProps {
  data: any[];
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({ data }) => {
  // Umbral crítico de glucosa
  const THRESHOLD = 140;

  return (
    <div className="w-full h-[380px] bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Bio-Monitor en Tiempo Real
          </h3>
          <p className="text-2xl font-[1000] text-metra-dark italic uppercase tracking-tighter">
            Dinámica de Glucosa
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-metra-blue" />
            <span className="text-[9px] font-black uppercase text-slate-400 italic">Historial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] font-black uppercase text-slate-400 italic">Alerta Pico</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            {/* Gradiente para historial (Azul Metra) */}
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007AFF" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
            </linearGradient>

            {/* GRADIENTE DINÁMICO PARA PROYECCIÓN */}
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={1} /> {/* Rojo si es muy alto */}
              <stop offset="50%" stopColor="#34C759" stopOpacity={1} /> {/* Verde si es normal */}
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }}
          />
          
          <YAxis 
            domain={[60, 220]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: '#cbd5e1' }} 
          />
          
          <Tooltip 
            cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
            contentStyle={{ 
              borderRadius: '20px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              fontSize: '11px',
              fontWeight: '900'
            }} 
          />

          {/* Línea de Alerta Visual */}
          <ReferenceLine 
            y={THRESHOLD} 
            stroke="#EF4444" 
            strokeDasharray="3 3" 
            label={{ position: 'right', value: 'PICO ALTO', fill: '#EF4444', fontSize: 8, fontWeight: 900 }} 
          />

          {/* Historial Real */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#007AFF"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorValue)"
            connectNulls
          />

          {/* Proyección con Alerta de Color */}
          <Area
            type="monotone"
            dataKey="projectedValue"
            stroke="url(#splitColor)" // <--- Aquí ocurre la magia del color
            strokeWidth={5}
            strokeDasharray="10 5"
            fillOpacity={0.05}
            fill="#34C759"
            animationDuration={2500}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};