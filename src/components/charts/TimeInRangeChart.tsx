
import React, { useState, useMemo } from 'react';
/* Added BloodDropIcon to resolve the missing reference on line 174 */
import { InformationCircleIcon, XMarkIcon, TargetIcon, CheckCircleIcon, BloodDropIcon } from '../ui/Icons';

interface TIRDetailed {
    veryLow: number;  // <54
    low: number;      // 54-69
    target: number;   // 70-180
    high: number;     // 181-250
    veryHigh: number; // >250
}

interface ScatterPoint {
    x: number; // Hora del día 0-23.99
    y: number; // Valor glucemia
    date: Date;
}

interface TimeInRangeChartProps {
    tirData: TIRDetailed;
    totalRecords: number;
    scatterData?: ScatterPoint[];
    isSimple?: boolean;
}

const CLINICAL_COLORS = {
    veryHigh: '#E67E22', // Naranja Crítico (>250)
    high: '#F1C40F',     // Amarillo Alerta (181-250)
    target: '#2ECC71',   // Esmeralda Salud (70-180)
    low: '#E74C3C',      // Rojo Peligro (54-69)
    veryLow: '#8E44AD'   // Púrpura Emergencia (<54)
};

const TimeInRangeChart: React.FC<TimeInRangeChartProps> = ({ tirData, totalRecords, scatterData = [], isSimple = false }) => {
    const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

    // Dimensiones del gráfico
    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    const yScale = (val: number) => {
        const maxVal = 350; // Glucemia máxima visible
        return height - padding.bottom - ((val / maxVal) * (height - padding.top - padding.bottom));
    };

    const xScale = (hour: number) => {
        return padding.left + ((hour / 24) * (width - padding.left - padding.right));
    };

    const getPointColor = (val: number) => {
        if (val < 54) return CLINICAL_COLORS.veryLow;
        if (val < 70) return CLINICAL_COLORS.low;
        if (val <= 180) return CLINICAL_COLORS.target;
        if (val <= 250) return CLINICAL_COLORS.high;
        return CLINICAL_COLORS.veryHigh;
    };

    const segments = [
        { label: 'Muy Alto', val: tirData.veryHigh, color: CLINICAL_COLORS.veryHigh },
        { label: 'Alto', val: tirData.high, color: CLINICAL_COLORS.high },
        { label: 'En Rango', val: tirData.target, color: CLINICAL_COLORS.target },
        { label: 'Bajo', val: tirData.low, color: CLINICAL_COLORS.low },
        { label: 'Muy Bajo', val: tirData.veryLow, color: CLINICAL_COLORS.veryLow }
    ];

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        Análisis Tiempo en Rango (TIR)
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Basado en {totalRecords} {totalRecords === 1 ? 'medición' : 'mediciones'} (últimos 7 días)
                    </p>
                </div>
                {tirData.target >= 70 && totalRecords >= 1 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 animate-fade-in">
                        <CheckCircleIcon className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase">Objetivo Cumplido</span>
                    </div>
                )}
            </div>

            {/* SCATTER PLOT INTERACTIVO */}
            <div className="relative bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 shadow-inner overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    {/* Banda Verde Estándar ADA (70-180) */}
                    <rect 
                        x={padding.left} 
                        y={yScale(180)} 
                        width={width - padding.left - padding.right} 
                        height={yScale(70) - yScale(180)} 
                        className="fill-green-500/10 dark:fill-green-400/5"
                    />
                    
                    {/* Líneas de Guía Eje Y */}
                    {[70, 180, 250].map(val => (
                        <g key={val}>
                            <line 
                                x1={padding.left} 
                                y1={yScale(val)} 
                                x2={width - padding.right} 
                                y2={yScale(val)} 
                                className="stroke-slate-200 dark:stroke-slate-700" 
                                strokeDasharray="4 4" 
                            />
                            <text x={padding.left - 8} y={yScale(val) + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-mono">{val}</text>
                        </g>
                    ))}

                    {/* Guía Eje X (Horas) */}
                    {[0, 6, 12, 18, 24].map(h => (
                        <text key={h} x={xScale(h)} y={height - padding.bottom + 20} textAnchor="middle" className="fill-slate-400 text-[10px] font-bold">
                            {h === 24 ? '00' : h.toString().padStart(2, '0')}:00
                        </text>
                    ))}

                    {/* Glucemias del Usuario */}
                    {scatterData.map((p, i) => (
                        <g key={i}>
                            <circle 
                                cx={xScale(p.x)} 
                                cy={yScale(p.y)} 
                                r="6" 
                                className="cursor-pointer transition-all hover:r-8"
                                fill={getPointColor(p.y)}
                                stroke="white"
                                strokeWidth="2"
                                onMouseEnter={() => setHoveredPoint(p)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        </g>
                    ))}
                </svg>

                {/* Tooltip flotante */}
                {hoveredPoint && (
                    <div 
                        className="absolute bg-slate-900 text-white p-3 rounded-xl shadow-2xl z-50 pointer-events-none animate-fade-in border border-white/10"
                        style={{ 
                            left: `${(xScale(hoveredPoint.x) / width) * 100}%`, 
                            top: `${(yScale(hoveredPoint.y) / height) * 100}%`,
                            transform: 'translate(-50%, -110%)'
                        }}
                    >
                        <p className="text-lg font-black">{hoveredPoint.y} <span className="text-[10px] font-normal opacity-50">mg/dL</span></p>
                        <p className="text-[9px] font-bold uppercase text-brand-primary">{hoveredPoint.date.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                )}
            </div>

            {/* MINI BARRA Y LEYENDA */}
            <div className="space-y-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    {segments.map((seg, i) => seg.val > 0 && (
                        <div key={i} style={{ width: `${seg.val}%`, backgroundColor: seg.color }} className="h-full" />
                    ))}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {segments.map((seg, i) => (
                        <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{seg.label}</span>
                            <span className="text-sm font-black" style={{ color: seg.color }}>{seg.val}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {totalRecords === 0 && (
                <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <BloodDropIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin datos de glucemia en los últimos 7 días</p>
                </div>
            )}
        </div>
    );
};

export default TimeInRangeChart;
