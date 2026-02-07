
import React, { useMemo, useState } from 'react';
import type { HistoryEntry, MealType, UserData } from '../../types';
import { InformationCircleIcon, XMarkIcon, BloodDropIcon } from '../ui/Icons';

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

// Etiquetas cortas para el eje X para evitar superposición
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
    averageGlucose: number;
    count: number;
}

interface GlucoseMealChartProps {
    history: HistoryEntry[];
    currentUser: UserData;
}

const GlucoseMealChart: React.FC<GlucoseMealChartProps> = ({ history, currentUser }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: MealTypeData } | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const preferredUnit = currentUser.glucoseUnitPreference || 'mg/dL';
    const targetMin = currentUser.clinicalConfig?.glucoseRanges?.targetMin || 70;
    const targetMax = currentUser.clinicalConfig?.glucoseRanges?.targetMax || 180;

    const chartData = useMemo(() => {
        const mealData: Record<string, { totalGlucose: number, count: number }> = {};
        orderedMealTypes.forEach(type => {
            mealData[type] = { totalGlucose: 0, count: 0 };
        });

        history.forEach(entry => {
            if (!entry.bloodGlucoseValue) return;

            let val = entry.bloodGlucoseValue;
            if (entry.bloodGlucoseUnit === 'mmol/L') {
                val = val * 18.0182;
            }

            if (mealData[entry.mealType]) {
                mealData[entry.mealType].totalGlucose += val;
                mealData[entry.mealType].count += 1;
            }
        });

        const result: MealTypeData[] = orderedMealTypes.map(key => ({
            mealType: key,
            averageGlucose: mealData[key].count > 0 ? mealData[key].totalGlucose / mealData[key].count : 0,
            count: mealData[key].count
        }));
        
        return result.filter(d => d.count > 0);

    }, [history]);
    
    if (chartData.length === 0) return null;
    
    const chartHeight = 300;
    const chartWidth = 500;
    const padding = { top: 40, right: 20, bottom: 50, left: 70 };
    
    const maxGlucose = useMemo(() => {
        const maxVal = Math.max(...chartData.map(d => d.averageGlucose));
        return Math.max(250, Math.ceil(maxVal / 50) * 50);
    }, [chartData]);
    
    const xScale = (index: number) => {
        return padding.left + (index * (chartWidth - padding.left - padding.right)) / chartData.length;
    };
    
    const yScale = (value: number) => {
        return chartHeight - padding.bottom - (value / maxGlucose) * (chartHeight - padding.top - padding.bottom);
    };

    const formatValue = (valMgDl: number) => {
        if (preferredUnit === 'mmol/L') return (valMgDl / 18.0182).toFixed(1);
        return Math.round(valMgDl).toString();
    };

    const getDotColor = (valMgDl: number) => {
        if (valMgDl < targetMin) return 'fill-yellow-400 stroke-yellow-200';
        if (valMgDl > targetMax) return 'fill-orange-500 stroke-orange-200';
        return 'fill-brand-secondary stroke-green-200';
    };

    const handleMouseOver = (e: React.MouseEvent<SVGCircleElement | SVGRectElement>, data: MealTypeData, index: number) => {
        const bandWidth = (chartWidth - padding.left - padding.right) / chartData.length;
        const x = xScale(index) + bandWidth / 2; 
        const y = yScale(data.averageGlucose) - 15;
        setTooltip({ x, y, data });
    };

    const rangeYTop = yScale(targetMax);
    const rangeYBottom = yScale(targetMin);
    const rangeHeight = rangeYBottom - rangeYTop;

    return (
        <div className="relative bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 h-full flex flex-col">
            <div className="flex justify-center items-center gap-2 mb-4 relative shrink-0">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Promedio de Glucemia</h3>
                <button 
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    className="text-[#1e3a8a] focus:outline-none"
                >
                    <InformationCircleIcon className="w-5 h-5" />
                </button>

                {showInfo && (
                    <div className="absolute top-8 right-0 w-64 bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-[70] animate-fade-in text-left border border-white/10">
                        <h4 className="font-black text-[10px] text-brand-primary uppercase mb-2">Metodología Glucemia</h4>
                        <p className="text-[10px] leading-relaxed opacity-90">
                            Representa la media aritmética de tus mediciones de glucosa segmentadas por slot diario. 
                            <br/><br/>
                            La banda verde resalta tu rango objetivo personalizado: <strong>{targetMin}-{targetMax} {preferredUnit}</strong>.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex-grow flex items-center justify-center w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <rect x={padding.left} y={rangeYTop} width={chartWidth - padding.left - padding.right} height={rangeHeight} className="fill-green-50/50 dark:fill-green-900/20" />
                    <line x1={padding.left} y1={rangeYTop} x2={chartWidth - padding.right} y2={rangeYTop} strokeDasharray="4 2" className="stroke-green-200 dark:stroke-green-800" strokeWidth="1" />
                    <line x1={padding.left} y1={rangeYBottom} x2={chartWidth - padding.right} y2={rangeYBottom} strokeDasharray="4 2" className="stroke-green-200 dark:stroke-green-800" strokeWidth="1" />

                    {Array.from({ length: 6 }).map((_, i) => {
                        const value = (i * maxGlucose) / 5;
                        const y = yScale(value);
                        return (
                            <g key={i}>
                                <line x1={padding.left - 5} y1={y} x2={chartWidth - padding.right} y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1"/>
                                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" className="fill-slate-400 dark:fill-slate-500 font-mono">{formatValue(value)}</text>
                            </g>
                        );
                    })}

                    {chartData.map((day, index) => {
                        const bandWidth = (chartWidth - padding.left - padding.right) / chartData.length;
                        const centerX = xScale(index) + bandWidth / 2;
                        const yVal = yScale(day.averageGlucose);
                        const yBase = chartHeight - padding.bottom;
                        const colorClass = getDotColor(day.averageGlucose);

                        return (
                            <g key={day.mealType}>
                                <line x1={centerX} y1={yBase} x2={centerX} y2={yVal} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
                                <circle cx={centerX} cy={yVal} r="6" className={`${colorClass} stroke-[2px] cursor-pointer transition-all duration-300 hover:r-8`} onMouseOver={(e) => handleMouseOver(e, day, index)} onMouseOut={() => setTooltip(null)} />
                                <text x={centerX} y={chartHeight - padding.bottom + 20} textAnchor="middle" fontSize="10" className="fill-slate-500 dark:fill-slate-400 font-medium">{axisLabels[day.mealType]}</text>
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
                    <p className="font-bold">{tooltip.data.mealType.replace('-', ' ')}</p>
                    <p>Media: <span className="font-mono font-bold text-base">{formatValue(tooltip.data.averageGlucose)}</span> {preferredUnit}</p>
                </div>
            )}
        </div>
    );
};

export default GlucoseMealChart;
