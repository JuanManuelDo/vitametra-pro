
import React, { useMemo, useState } from 'react';
import type { HistoryEntry, MealType } from '../../types';
import { InformationCircleIcon, XMarkIcon } from '../ui/Icons';

// Orden específico solicitado
const orderedMealTypes: MealType[] = [
    'desayuno',
    'snack-manana',
    'almuerzo',
    'snack-tarde',
    'cena',
    'snack-noche',
    'snack-deportivo'
];

const mealTypeLabels: { [key in MealType]: string } = {
    'desayuno': 'Desayuno',
    'snack-manana': 'Snack (Mañana)',
    'almuerzo': 'Almuerzo',
    'snack-tarde': 'Snack (Tarde)',
    'cena': 'Cena',
    'snack-noche': 'Snack (Noche)',
    'snack-deportivo': 'Pre-Deporte'
};

const axisLabels: { [key in MealType]: string } = {
    'desayuno': 'Desayuno',
    'snack-manana': 'Snack M',
    'almuerzo': 'Almuerzo',
    'snack-tarde': 'Snack T',
    'cena': 'Cena',
    'snack-noche': 'Snack N',
    'snack-deportivo': 'Pre-Dep'
};

type MealTypeData = {
    mealType: MealType;
    averageCarbs: number;
    count: number;
}

const MealTypeChart: React.FC<{ history: HistoryEntry[] }> = ({ history }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: MealTypeData } | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const chartData = useMemo(() => {
        const mealData: Record<string, { totalCarbs: number, count: number }> = {};
        orderedMealTypes.forEach(type => {
            mealData[type] = { totalCarbs: 0, count: 0 };
        });

        history.forEach(entry => {
            if (mealData[entry.mealType]) {
                mealData[entry.mealType].totalCarbs += (entry.totalCarbs || 0);
                mealData[entry.mealType].count += 1;
            }
        });

        const result: MealTypeData[] = orderedMealTypes.map(key => ({
            mealType: key,
            averageCarbs: mealData[key].count > 0 ? mealData[key].totalCarbs / mealData[key].count : 0,
            count: mealData[key].count
        }));
        
        return result.filter(d => d.count > 0);

    }, [history]);
    
    const { minAverage, maxAverage } = useMemo(() => {
        if (chartData.length === 0) return { minAverage: 0, maxAverage: 0 };
        const values = chartData.map(d => d.averageCarbs);
        return {
            minAverage: Math.min(...values),
            maxAverage: Math.max(...values)
        };
    }, [chartData]);

    if (chartData.length === 0) return null;
    
    const chartHeight = 300;
    const chartWidth = 500;
    const padding = { top: 40, right: 20, bottom: 50, left: 50 };
    
    const maxCarbsScale = useMemo(() => {
        if (chartData.length === 0) return 0;
        return Math.ceil(maxAverage / 25) * 25 || 25;
    }, [maxAverage, chartData]);
    
    const xScale = (index: number) => {
        return padding.left + (index * (chartWidth - padding.left - padding.right)) / chartData.length;
    };
    
    const yScale = (value: number) => {
        if (maxCarbsScale === 0) return chartHeight - padding.bottom;
        return chartHeight - padding.bottom - (value / maxCarbsScale) * (chartHeight - padding.top - padding.bottom);
    };

    const barWidth = useMemo(() => {
        if (chartData.length === 0) return 0;
        return (chartWidth - padding.left - padding.right) / chartData.length * 0.5;
    }, [chartData.length]);

    const getRelativeColor = (value: number) => {
        if (maxAverage === minAverage) return 'fill-brand-primary'; 
        const percentage = (value - minAverage) / (maxAverage - minAverage || 1);
        if (percentage <= 0.25) return 'fill-brand-secondary';
        if (percentage <= 0.60) return 'fill-brand-primary/60';
        if (percentage <= 0.85) return 'fill-orange-400';
        return 'fill-red-500';
    };

    const handleMouseOver = (e: React.MouseEvent<SVGRectElement>, data: MealTypeData, index: number) => {
        const bandWidth = (chartWidth - padding.left - padding.right) / chartData.length;
        const x = xScale(index) + bandWidth / 2;
        const y = yScale(data.averageCarbs) - 10;
        setTooltip({ x, y, data });
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 h-full flex flex-col">
            <div className="flex justify-center items-center gap-2 mb-4 relative">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Promedio de Carbohidratos</h3>
                <button 
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    className="text-[#1e3a8a] focus:outline-none"
                >
                    <InformationCircleIcon className="w-5 h-5" />
                </button>

                {showInfo && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-[70] animate-fade-in text-left border border-white/10">
                        <h4 className="font-black text-[10px] text-brand-primary uppercase mb-2">Metodología de Promedio</h4>
                        <p className="text-[10px] leading-relaxed opacity-90 mb-2">
                            Se calcula dividiendo la suma total de carbohidratos registrados por el número de entradas en cada slot (ej: Almuerzo).
                        </p>
                        <ul className="text-[10px] space-y-1 opacity-80 list-disc pl-3">
                            <li>Verde: Carga baja (Estable).</li>
                            <li>Azul: Carga media.</li>
                            <li>Rojo: Carga máxima.</li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex-grow flex items-center w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {Array.from({ length: 5 }).map((_, i) => {
                        const y = chartHeight - padding.bottom - i * (chartHeight - padding.top - padding.bottom) / 4;
                        const value = (i * maxCarbsScale) / 4;
                        return (
                            <g key={i}>
                                <line x1={padding.left - 5} y1={y} x2={chartWidth - padding.right} y2={y} stroke="currentColor" strokeDasharray="2 2" className="text-slate-200 dark:text-slate-700"/>
                                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">
                                    {value.toFixed(0)}
                                </text>
                            </g>
                        );
                    })}

                    {chartData.map((day, index) => {
                        const barColor = getRelativeColor(day.averageCarbs);
                        const bandWidth = (chartWidth - padding.left - padding.right) / chartData.length;
                        const barX = xScale(index) + (bandWidth - barWidth) / 2;
                        const barY = yScale(day.averageCarbs);
                        const barH = (chartHeight - padding.bottom) - barY;
                        const centerX = xScale(index) + bandWidth / 2;

                        return (
                            <g key={day.mealType}>
                                <rect x={barX} y={barY} width={barWidth} height={barH} className={`${barColor} transition-opacity duration-200 hover:opacity-80`} onMouseOver={(e) => handleMouseOver(e, day, index)} onMouseOut={() => setTooltip(null)} rx="4" />
                                <text x={centerX} y={barY - 8} textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-slate-700 dark:fill-slate-200">{Math.round(day.averageCarbs)}</text>
                                <text x={centerX} y={chartHeight - padding.bottom + 20} textAnchor="middle" fontSize="11" className="fill-slate-600 dark:fill-slate-300 font-medium">{axisLabels[day.mealType]}</text>
                            </g>
                        )
                    })}
                    <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="currentColor" className="text-slate-300 dark:text-slate-600" />
                </svg>
            </div>

            {tooltip && (
                <div
                    className="absolute bg-slate-800 text-white text-xs rounded-md p-2 shadow-lg pointer-events-none transition-opacity duration-200 opacity-100 z-30"
                    style={{ left: `${tooltip.x * 100 / chartWidth}%`, top: `${tooltip.y * 100 / chartHeight}%`, transform: `translate(-50%, -100%)` }}
                >
                    <p className="font-bold">{mealTypeLabels[tooltip.data.mealType]}</p>
                    <p>Media: <span className="font-semibold">{tooltip.data.averageCarbs.toFixed(1)}g</span></p>
                </div>
            )}
        </div>
    );
};

export default MealTypeChart;
