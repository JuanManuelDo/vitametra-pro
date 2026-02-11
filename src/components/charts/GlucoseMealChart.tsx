import React, { useMemo, useState } from 'react';
import type { HistoryEntry, MealType, UserData } from '../../types';
import { InformationCircleIcon } from '../ui/Icons';

// Orden cronológico lógico para el paciente
const orderedMealTypes: MealType[] = [
    'desayuno', 'snack-manana', 'almuerzo', 'snack-tarde', 'cena', 'snack-noche', 'snack-deportivo'
];

const axisLabels: { [key in MealType]: string } = {
    'desayuno': 'Desayuno', 'snack-manana': 'Snack M', 'almuerzo': 'Almuerzo',
    'snack-tarde': 'Snack T', 'cena': 'Cena', 'snack-noche': 'Snack N', 'snack-deportivo': 'Pre-Dep'
};

interface GlucoseMealChartProps {
    history: any[]; // Acepta historial antiguo o clinical_events
    currentUser: UserData;
}

const GlucoseMealChart: React.FC<GlucoseMealChartProps> = ({ history, currentUser }) => {
    const [tooltip, setTooltip] = useState<any | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const preferredUnit = currentUser.glucoseUnitPreference || 'mg/dL';
    const targetMin = currentUser.clinicalConfig?.glucoseRanges?.targetMin || 70;
    const targetMax = currentUser.clinicalConfig?.glucoseRanges?.targetMax || 180;

    // Procesamiento de datos orientado a INSIGHTS (Prompt 3)
    const chartData = useMemo(() => {
        const stats: Record<string, { total: number, count: number, max: number }> = {};
        orderedMealTypes.forEach(t => stats[t] = { total: 0, count: 0, max: 0 });

        history.forEach(entry => {
            // Compatibilidad con ambos esquemas: entry.bloodGlucoseValue o entry.value
            const val = entry.bloodGlucoseValue || (entry.type === 'GLUCOSE' ? entry.value : null);
            if (!val) return;

            const mType = entry.mealType || entry.metadata?.mealType || 'desayuno';
            
            if (stats[mType]) {
                stats[mType].total += val;
                stats[mType].count += 1;
                if (val > stats[mType].max) stats[mType].max = val;
            }
        });

        return orderedMealTypes
            .map(type => ({
                type,
                avg: stats[type].count > 0 ? stats[type].total / stats[type].count : 0,
                max: stats[type].max,
                count: stats[type].count
            }))
            .filter(d => d.count > 0);
    }, [history]);

    if (chartData.length === 0) return (
        <div className="p-8 text-center text-slate-400 border-2 border-dashed rounded-xl">
            Esperando datos de clinical_events...
        </div>
    );

    // Configuración visual del SVG
    const chartHeight = 250;
    const chartWidth = 500;
    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    const maxVal = Math.max(250, ...chartData.map(d => d.max));

    const getX = (i: number) => padding.left + (i * (chartWidth - padding.left - padding.right)) / (chartData.length - 1 || 1);
    const getY = (v: number) => chartHeight - padding.bottom - (v / maxVal) * (chartHeight - padding.top - padding.bottom);

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Respuesta por Comida</h3>
                    <p className="text-xs text-slate-500">Promedio de glucosa post-prandial</p>
                </div>
                <button onClick={() => setShowInfo(!showInfo)} className="text-slate-400 hover:text-brand-primary">
                    <InformationCircleIcon className="w-5 h-5" />
                </button>
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                {/* Rango Objetivo (UX Insight) */}
                <rect 
                    x={padding.left} y={getY(targetMax)} 
                    width={chartWidth - padding.left - padding.right} 
                    height={getY(targetMin) - getY(targetMax)} 
                    className="fill-green-500/10 dark:fill-green-400/5"
                />

                {/* Ejes y Líneas de fondo */}
                <line x1={padding.left} y1={getY(targetMax)} x2={chartWidth - padding.right} y2={getY(targetMax)} className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray="4" />
                
                {/* Línea de tendencia entre promedios */}
                <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData.map((d, i) => `${getX(i)},${getY(d.avg)}`).join(' ')}
                />

                {/* Puntos de datos (Prompt 2: Visualizar picos) */}
                {chartData.map((d, i) => (
                    <g key={d.type} onMouseEnter={() => setTooltip({ ...d, x: getX(i), y: getY(d.avg) })} onMouseLeave={() => setTooltip(null)}>
                        {/* Indicador de Máximo (Pico) */}
                        <line x1={getX(i)} y1={getY(d.avg)} x2={getX(i)} y2={getY(d.max)} className="stroke-slate-300" strokeDasharray="2" />
                        <circle cx={getX(i)} cy={getY(d.max)} r="3" className="fill-orange-400" />
                        
                        {/* Punto Promedio */}
                        <circle 
                            cx={getX(i)} cy={getY(d.avg)} r="6" 
                            className={`${d.avg > targetMax ? 'fill-red-500' : 'fill-blue-600'} cursor-pointer hover:r-8 transition-all`}
                        />
                        
                        {/* Etiquetas Eje X */}
                        <text x={getX(i)} y={chartHeight - 10} textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">
                            {axisLabels[d.type as MealType]}
                        </text>
                    </g>
                ))}
            </svg>

            {tooltip && (
                <div 
                    className="absolute bg-slate-800 text-white p-2 rounded-lg text-xs shadow-xl z-50 pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y - 40, transform: 'translateX(-50%)' }}
                >
                    <p className="font-bold uppercase text-[9px] text-blue-300">{tooltip.type}</p>
                    <p>Avg: {Math.round(tooltip.avg)} {preferredUnit}</p>
                    <p className="text-orange-300">Pico: {Math.round(tooltip.max)}</p>
                </div>
            )}
        </div>
    );
};

export default GlucoseMealChart;
