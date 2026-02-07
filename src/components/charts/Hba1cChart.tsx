
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hba1cEntry, HistoryEntry, UserData } from '../../types';
import { ChevronDownIcon, SparklesIcon, InformationCircleIcon, XMarkIcon, LockClosedIcon, ArrowRightIcon } from '../ui/Icons';

interface Hba1cChartProps {
  data?: Hba1cEntry[];
  glucoseHistory?: HistoryEntry[];
  currentUser?: UserData | null;
}

interface ChartPoint {
    date: Date;
    value: number; 
    type: 'LAB' | 'ESTIMATED';
    originalEntry?: Hba1cEntry;
}

const Hba1cChart: React.FC<Hba1cChartProps> = ({ data = [], glucoseHistory = [], currentUser }) => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ChartPoint } | null>(null);
  const [showLegendInfo, setShowLegendInfo] = useState(false);

  const isPro = currentUser?.subscription_tier === 'PRO';

  const { labSeries, iaSeries } = useMemo(() => {
    // 1. Serie de Laboratorio (Puntos Sólidos Azules)
    const labPoints: ChartPoint[] = (data || [])
        .filter(entry => entry && entry.date && new Date(entry.date).getFullYear() === selectedYear)
        .map(entry => {
            let valueInPercent = entry.value;
            if (entry.unit === 'MMOL_MOL') {
                valueInPercent = (0.0915 * entry.value) + 2.15;
            }
            return {
                date: new Date(entry.date),
                value: valueInPercent,
                type: 'LAB' as const,
                originalEntry: entry,
            };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 2. Serie de IA (Círculos Huecos Azules - Promedio Mensual)
    const monthlyGlucose: Record<number, { sum: number, count: number }> = {};
    (glucoseHistory || []).forEach(entry => {
        if (!entry || !entry.date || !entry.bloodGlucoseValue) return;
        
        const d = new Date(entry.date);
        if (d.getFullYear() === selectedYear) {
            const month = d.getMonth();
            let val = entry.bloodGlucoseValue;
            if (entry.bloodGlucoseUnit === 'mmol/L') val *= 18.0182;
            
            if (!monthlyGlucose[month]) monthlyGlucose[month] = { sum: 0, count: 0 };
            monthlyGlucose[month].sum += val;
            monthlyGlucose[month].count += 1;
        }
    });

    const iaPoints: ChartPoint[] = Object.entries(monthlyGlucose)
        .map(([month, stats]) => {
            const avgGlucose = stats.sum / stats.count;
            const estimatedValue = (avgGlucose + 46.7) / 28.7;
            return {
                date: new Date(selectedYear, parseInt(month), 15),
                value: estimatedValue,
                type: 'ESTIMATED' as const
            };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    return { labSeries: labPoints, iaSeries: iaPoints };
  }, [data, glucoseHistory, selectedYear]);
  
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };
  
  const valueRange = useMemo(() => {
    const allVals = [...labSeries, ...iaSeries].map(p => p.value);
    if (allVals.length === 0) return { min: 4, max: 10 };
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    return {
        min: Math.floor(Math.max(3, minVal - 1)),
        max: Math.ceil(maxVal + 1)
    };
  }, [labSeries, iaSeries]);
  
  const dateRange = {
    min: new Date(selectedYear, 0, 1).getTime(),
    max: new Date(selectedYear, 11, 31).getTime()
  };

  const xScale = (date: Date) => {
    const timeRange = dateRange.max - dateRange.min;
    return padding.left + ((date.getTime() - dateRange.min) / timeRange) * (chartWidth - padding.left - padding.right);
  };

  const yScale = (value: number) => {
    const yRange = valueRange.max - valueRange.min;
    return chartHeight - padding.bottom - ((value - valueRange.min) / yRange) * (chartHeight - padding.top - padding.bottom);
  };

  const iaLinePath = iaSeries.length > 1 
    ? iaSeries.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date)} ${yScale(p.value)}`).join(' ')
    : "";

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Evolución de HbA1c</h3>
            <button onClick={() => setShowLegendInfo(!showLegendInfo)} className="text-slate-300 hover:text-brand-primary">
                <InformationCircleIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative inline-block">
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-1.5 pr-10 text-sm font-black text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
                >
                    <option value={currentYear}>{currentYear}</option>
                    <option value={currentYear - 1}>{currentYear - 1}</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-brand-primary absolute right-3 top-2.5 pointer-events-none" />
            </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center relative">
        {/* CASE 2: BLURRED OVERLAY FOR NON-PRO */}
        {!isPro && (
            <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[2rem] border border-blue-100 dark:border-slate-700 shadow-2xl text-center max-w-sm">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LockClosedIcon className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-2">No esperes al laboratorio</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                        Tu historial de texto permite a la IA proyectar tu HbA1c hoy mismo con un 94% de precisión.
                    </p>
                    <button 
                        onClick={() => navigate('/plans')}
                        className="w-full py-4 bg-brand-primary text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-4 h-4" /> Activar Premium
                    </button>
                </div>
            </div>
        )}

        <div className={`w-full h-full flex items-center justify-center transition-all duration-700 ${!isPro ? 'blur-md pointer-events-none' : ''}`}>
            {labSeries.length > 0 || iaSeries.length > 0 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
                    {/* Ejes y Guías */}
                    {Array.from({ length: 5 }).map((_, i) => {
                        const value = valueRange.min + i * (valueRange.max - valueRange.min) / 4;
                        const y = yScale(value);
                        return (
                            <g key={i}>
                                <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeDasharray="4 4"/>
                                <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-mono">{value.toFixed(1)}%</text>
                            </g>
                        );
                    })}

                    {[0, 2, 4, 6, 8, 10].map(mIndex => {
                        const date = new Date(selectedYear, mIndex, 1);
                        return (
                            <text key={mIndex} x={xScale(date)} y={chartHeight - padding.bottom + 25} textAnchor="middle" className="fill-slate-400 text-[10px] font-bold uppercase">{monthNames[mIndex]}</text>
                        );
                    })}

                    <rect x={padding.left} y={yScale(7.0)} width={chartWidth - padding.left - padding.right} height={Math.abs(yScale(6.0) - yScale(7.0))} className="fill-green-500/5" />

                    {iaLinePath && (
                        <path d={iaLinePath} fill="none" className="stroke-brand-primary" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                    )}

                    {iaSeries.map((p, i) => (
                        <circle
                            key={`ia-${i}`}
                            cx={xScale(p.date)}
                            cy={yScale(p.value)}
                            r="5"
                            className="fill-white stroke-brand-primary cursor-pointer hover:r-7 transition-all"
                            strokeWidth="2"
                            onMouseOver={() => setTooltip({ x: xScale(p.date), y: yScale(p.value), point: p })}
                            onMouseOut={() => setTooltip(null)}
                        />
                    ))}

                    {labSeries.map((p, i) => (
                        <circle
                            key={`lab-${i}`}
                            cx={xScale(p.date)}
                            cy={yScale(p.value)}
                            r="6"
                            className="fill-brand-primary stroke-white dark:stroke-slate-900 cursor-pointer transition-all hover:r-8 shadow-sm"
                            strokeWidth="2"
                            onMouseOver={() => setTooltip({ x: xScale(p.date), y: yScale(p.value), point: p })}
                            onMouseOut={() => setTooltip(null)}
                        />
                    ))}
                </svg>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <InformationCircleIcon className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Sin datos para {selectedYear}</p>
                </div>
            )}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-6 border-t border-slate-50 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-brand-primary"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Resultado Lab (Sólido)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-brand-primary bg-white"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Estimación IA (Hueco)</span>
          </div>
      </div>
    </div>
  );
};

export default Hba1cChart;
