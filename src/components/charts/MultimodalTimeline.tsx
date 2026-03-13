import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea
} from 'recharts';
import { HistoryEntry } from '../../types';

interface MultimodalTimelineProps {
  history: HistoryEntry[];
  filterMode: 'ALL' | 'SPORT' | 'SEDENTARY';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-100 text-xs z-50">
        <p className="font-bold text-slate-800 mb-1">
          {new Date(data.timestamp).toLocaleString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        {data.bloodGlucose && (
          <p className="text-blue-600 font-bold"> Glucosa: {data.bloodGlucose} mg/dL</p>
        )}
        {data.carbs > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="font-bold text-orange-600">{data.foodName || 'Comida'}</p>
            <p className="text-slate-600">Carbohidratos: {data.carbs}g</p>
          </div>
        )}
        {data.insulin > 0 && (
          <p className="text-teal-600 font-bold mt-1">Insulina: {data.insulin} U</p>
        )}
        {data.activity === 'alto' && (
          <p className="text-purple-600 font-bold mt-1">Actividad Física Fuerte</p>
        )}
      </div>
    );
  }
  return null;
};

// Custom shape for meals and insulin
interface CustomShapeProps {
  cx?: number;
  cy?: number;
  payload?: any;
}

const CustomShape = (props: CustomShapeProps) => {
  const { cx, cy, payload } = props;
  
  if (!cx || !cy) return null;

  return (
    <g transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }}>
      {/* Comida: Círculo Naranja */}
      {payload.carbs > 0 && (
        <circle r="6" fill="#F97316" stroke="#fff" strokeWidth="2" />
      )}
      
      {/* Insulina: Gota Azul Claro */}
      {payload.insulin > 0 && (
        <path 
           d="M0 -12 C 5 -4, 5 4, 0 8 C -5 4, -5 -4, 0 -12 Z" 
           fill="#0EA5E9" 
           stroke="#fff" 
           strokeWidth="1.5" 
           transform={`translate(0, ${payload.carbs > 0 ? 12 : 0}) scale(0.8)`} 
        />
      )}
      
      {/* Deporte/Actividad: Rayo Amarillo */}
      {(payload.activity === 'alto' || payload.activity === 'medio') && (
        <path 
           d="M-2 -8 L -6 2 L -1 2 L -2 10 L 6 0 L 1 0 Z" 
           fill="#EAB308" 
           stroke="#fff" 
           strokeWidth="1" 
           transform={`translate(${payload.carbs > 0 ? 12 : 0}, ${payload.insulin > 0 ? -10 : -5}) scale(0.8)`}
        />
      )}
    </g>
  );
};

export const MultimodalTimeline: React.FC<MultimodalTimelineProps> = ({ history, filterMode }) => {
  const chartData = useMemo(() => {
    // 1. Filter by activity
    let filtered = history;
    if (filterMode === 'SPORT') {
        const sportDays = new Set(
            history.filter(h => h.physicalActivityLevel === 'alto')
                   .map(h => new Date(h.date || h.createdAt?.seconds * 1000).toDateString())
        );
        filtered = history.filter(h => sportDays.has(new Date(h.date || h.createdAt?.seconds * 1000).toDateString()));
    } else if (filterMode === 'SEDENTARY') {
        const sportDays = new Set(
            history.filter(h => h.physicalActivityLevel === 'alto')
                   .map(h => new Date(h.date || h.createdAt?.seconds * 1000).toDateString())
        );
        filtered = history.filter(h => !sportDays.has(new Date(h.date || h.createdAt?.seconds * 1000).toDateString()));
    }

    // 2. Format data for recharts
    const data = filtered.map(entry => {
      const ts = new Date(entry.timestamp || entry.date || (entry.createdAt?.seconds * 1000)).getTime();
      return {
        timestamp: ts,
        bloodGlucose: entry.bloodGlucoseValue || entry.postPrandialGlucose || null,
        carbs: entry.totalCarbs || 0,
        insulin: entry.finalInsulinUnits || entry.bolusInsulin || 0,
        activity: entry.physicalActivityLevel,
        foodName: entry.foodName || entry.userInput,
        imageUrl: entry.imageUrl
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
    
    return data;
  }, [history, filterMode]);

  if (chartData.length === 0) {
      return (
          <div className="h-64 flex justify-center items-center text-slate-400 text-xs uppercase tracking-widest font-bold">
              Sin datos para este filtro
          </div>
      );
  }

  return (
    <div className="w-full h-80 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          
          <XAxis 
            dataKey="timestamp" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            tickFormatter={(ts) => new Date(ts).toLocaleDateString('es-ES', { weekday: 'short' })}
            stroke="#cbd5e1"
            tick={{ fontSize: 10 }}
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            dataKey="bloodGlucose"
            domain={[0, 350]}
            stroke="#cbd5e1"
            tick={{ fontSize: 10 }}
            ticks={[70, 180, 250]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Rango Objetivo */}
          <ReferenceArea y1={70} y2={180} fill="#22c55e" fillOpacity={0.05} {...({} as any)} />
          
          {/* Línea de Glucosa */}
          <Line 
            type="monotone" 
            dataKey="bloodGlucose" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
            connectNulls
          />

          {/* Eventos Multimodales (Comida, Insulina) */}
          <Scatter 
            dataKey="bloodGlucose" // Uses glucose's Y position to plot over the line
            shape={<CustomShape />}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Leyenda Custom */}
      <div className="absolute top-4 right-6 flex items-center justify-end gap-2 md:gap-4 flex-wrap text-[9px] font-bold uppercase text-slate-400">
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Glucosa</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Comida</div>
         <div className="flex items-center gap-1">
            <svg width="10" height="14" viewBox="-6 -12 12 20">
               <path d="M0 -12 C 5 -4, 5 4, 0 8 C -5 4, -5 -4, 0 -12 Z" fill="#0EA5E9"/>
            </svg> Insulina
         </div>
         <div className="flex items-center gap-1">
            <svg width="10" height="14" viewBox="-6 -8 12 18">
               <path d="M-2 -8 L -6 2 L -1 2 L -2 10 L 6 0 L 1 0 Z" fill="#EAB308"/>
            </svg> Deporte
         </div>
      </div>
    </div>
  );
};

export default MultimodalTimeline;
