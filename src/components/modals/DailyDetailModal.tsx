import React, { useMemo, useState, useEffect } from 'react';
import type { HistoryEntry, MealType } from '../../types';
import { XMarkIcon, SunIcon, MoonIcon, BuildingOfficeIcon, CubeIcon, PersonCycleIcon } from '../ui/Icons';

interface DailyDetailModalProps {
  dayData: HistoryEntry[];
  onClose: () => void;
}

const mealTypeDetails: { [key in MealType]: { Icon: React.FC<{className?: string}>, colors: string, label: string } } = {
    desayuno: { Icon: SunIcon, colors: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400', label: 'Desayuno' },
    almuerzo: { Icon: BuildingOfficeIcon, colors: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400', label: 'Almuerzo' },
    cena: { Icon: MoonIcon, colors: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400', label: 'Cena' },
    'snack-manana': { Icon: CubeIcon, colors: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', label: 'Snack Mañana' },
    'snack-tarde': { Icon: CubeIcon, colors: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', label: 'Snack Tarde' },
    'snack-noche': { Icon: CubeIcon, colors: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', label: 'Snack Noche' },
    'snack-deportivo': { Icon: PersonCycleIcon, colors: 'bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-300', label: 'Snack Deportivo' },
};

const LineChart: React.FC<{ data: number[] }> = ({ data }) => {
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, value: number } | null>(null);

    const chartWidth = 500;
    const chartHeight = 200; // Aumentado ligeramente para mejor visualización
    const padding = { top: 40, right: 30, bottom: 30, left: 40 };
    const maxVal = Math.max(...data, 10); 
    const yMax = Math.ceil(maxVal / 10) * 10;

    const getX = (i: number) => padding.left + (i / (data.length - 1)) * (chartWidth - padding.left - padding.right);
    const getY = (val: number) => chartHeight - padding.bottom - (val / yMax) * (chartHeight - padding.top - padding.bottom);

    const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
            {/* Y Axis Grid Lines */}
            {[0, yMax / 2, yMax].map(val => (
                <g key={val}>
                    <line x1={padding.left} y1={getY(val)} x2={chartWidth - padding.right} y2={getY(val)} className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="2 2" />
                    <text x={padding.left - 5} y={getY(val) + 4} textAnchor="end" className="text-xs fill-slate-500 dark:fill-slate-400">{val}</text>
                </g>
            ))}
            {/* X Axis labels */}
            {[0, 6, 12, 18, 23].map(hour => (
                <text key={hour} x={getX(hour)} y={chartHeight - padding.bottom + 15} textAnchor="middle" className="text-xs fill-slate-500 dark:fill-slate-400">{`${hour.toString().padStart(2, '0')}:00`}</text>
            ))}

            {/* Gradient Area */}
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007BFF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#007BFF" stopOpacity="0" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                </filter>
            </defs>
            <path d={`${pathData} L ${getX(data.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`} fill="url(#chartGradient)" />

            {/* Main Line */}
            <path d={pathData} className="stroke-brand-primary" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

             {/* Points & Tooltip Interaction */}
            {data.map((d, i) => d > 0 && (
                <g key={i}>
                    {/* Invisible larger circle for easier hovering */}
                    <circle 
                        cx={getX(i)} 
                        cy={getY(d)} 
                        r="12" 
                        fill="transparent" 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ x: getX(i), y: getY(d), value: d })}
                        onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Visible Point */}
                    <circle 
                        cx={getX(i)} 
                        cy={getY(d)} 
                        r={hoveredPoint?.x === getX(i) ? 6 : 4}
                        className="fill-brand-surface stroke-brand-primary pointer-events-none transition-all duration-200" 
                        strokeWidth="2"
                    />
                </g>
            ))}

            {/* Floating Tooltip */}
            {hoveredPoint && (
                <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 15})`} className="pointer-events-none transition-opacity duration-200">
                    <g transform="translate(0, -25)">
                        {/* Background Box */}
                        <rect 
                            x="-30" 
                            y="-15" 
                            width="60" 
                            height="24" 
                            rx="6" 
                            className="fill-slate-800 dark:fill-white shadow-lg" 
                            filter="url(#shadow)"
                        />
                        {/* Small Arrow */}
                        <path d="M -6 9 L 0 15 L 6 9 Z" className="fill-slate-800 dark:fill-white" />
                        {/* Text */}
                        <text 
                            x="0" 
                            y="2" 
                            textAnchor="middle" 
                            className="text-[11px] font-bold fill-white dark:fill-slate-900"
                        >
                            {hoveredPoint.value.toFixed(1)}g
                        </text>
                    </g>
                </g>
            )}
        </svg>
    );
};


const DailyDetailModal: React.FC<DailyDetailModalProps> = ({ dayData, onClose }) => {

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sortedDayData = useMemo(() => {
    return [...dayData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dayData]);

  const hourlyCarbsData = useMemo(() => {
    const hours = Array(24).fill(0);
    sortedDayData.forEach(entry => {
        const hour = new Date(entry.date).getHours();
        hours[hour] += entry.totalCarbs;
    });
    return hours;
  }, [sortedDayData]);

  const totalCarbsForDay = useMemo(() => sortedDayData.reduce((sum, entry) => sum + entry.totalCarbs, 0), [sortedDayData]);
  const totalInsulinForDay = useMemo(() => sortedDayData.reduce((sum, entry) => sum + (entry.recommendedInsulinUnits || 0), 0), [sortedDayData]);

  const selectedDate = useMemo(() => {
    if (sortedDayData.length === 0) return new Date();
    return new Date(sortedDayData[0].date);
  }, [sortedDayData]);


  if (sortedDayData.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-brand-surface dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative border border-slate-200 dark:border-slate-700" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Sticky */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-brand-surface dark:bg-slate-800 rounded-t-xl z-10">
            <div>
                <h3 className="text-xl font-bold text-brand-primary dark:text-blue-400">Análisis del Día</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium capitalize">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                title="Cerrar (Esc)"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 custom-scrollbar">
            {/* Chart View */}
            <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 shadow-inner">
                <div className="flex items-center justify-between mb-2 px-2">
                     <h4 className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">Distribución Horaria</h4>
                     <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">g Carbs</span>
                </div>
                <LineChart data={hourlyCarbsData} />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-500 dark:text-blue-400 uppercase font-bold mb-1">Total Carbohidratos</p>
                        <p className="text-3xl font-black text-brand-secondary">{totalCarbsForDay.toFixed(1)}<span className="text-lg font-medium text-slate-400 ml-1">g</span></p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center border border-indigo-100 dark:border-indigo-800">
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase font-bold mb-1">Insulina Total</p>
                        <p className="text-3xl font-black text-brand-primary">{totalInsulinForDay.toFixed(1)}<span className="text-lg font-medium text-slate-400 ml-1">U</span></p>
                    </div>
            </div>

            {/* Detail List */}
            <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-sm uppercase tracking-wide">Detalle de Ingestas</h4>
                <div className="space-y-2">
                    {sortedDayData.map(entry => {
                        const details = mealTypeDetails[entry.mealType];
                        return (
                            <div key={entry.id} className="group flex items-center gap-4 bg-white dark:bg-slate-700/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-primary/30 hover:shadow-sm transition-all">
                                <div className={`p-3 rounded-lg ${details.colors} group-hover:scale-110 transition-transform`}>
                                    <details.Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-700 dark:text-slate-200 capitalize text-sm">{details.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{new Date(entry.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{entry.totalCarbs.toFixed(1)} g</p>
                                    {entry.recommendedInsulinUnits ? (
                                        <p className="text-xs text-brand-primary dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md inline-block mt-1">
                                            {entry.recommendedInsulinUnits.toFixed(1)} U
                                        </p>
                                    ) : <span className="text-slate-300">-</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDetailModal;