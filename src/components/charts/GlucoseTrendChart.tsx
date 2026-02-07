import React, { useState, useMemo, useEffect } from 'react';
import type { HistoryEntry, UserData } from '../../types';
import { Sparkles, Activity, Lock, ArrowUpRight, CheckCircle2, BrainCircuit } from 'lucide-react';

interface GlucoseTrendChartProps {
    data: HistoryEntry[];
    currentUser: UserData | null;
    onDayClick?: (entries: HistoryEntry[]) => void;
}

const GlucoseTrendChart: React.FC<GlucoseTrendChartProps> = ({ data, currentUser, onDayClick }) => {
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const isPro = currentUser?.subscription_tier === 'PRO';
    
    // Dimensiones optimizadas para respuesta visual fluida
    const width = 800;
    const height = 350;
    const padding = { top: 50, right: 40, bottom: 60, left: 60 };

    const RANGE = { hypo: 70, targetMax: 180, max: 350 };
    const unit = currentUser?.glucoseUnitPreference || 'mg/dL';

    const normalizeDate = (date: string | Date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    const processedData = useMemo(() => {
        const now = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            return d;
        });

        const allPoints: any[] = [];
        const dailyAverages: any[] = [];

        last7Days.forEach((dayDate, dayIdx) => {
            const dayStart = dayDate.getTime();
            const dayEnd = dayStart + 86400000;
            
            const entries = data.filter(e => {
                const entryTime = new Date(e.date).getTime();
                return entryTime >= dayStart && entryTime < dayEnd && e.bloodGlucoseValue;
            });
            
            let dailySum = 0;
            let dailyCount = 0;

            entries.forEach(e => {
                let val = e.bloodGlucoseValue!;
                if (e.bloodGlucoseUnit === 'mmol/L') val *= 18.0182;
                
                const d = new Date(e.date);
                const hour = d.getHours();
                const minute = d.getMinutes();
                const timeFraction = (hour + minute / 60) / 24;
                
                const x = padding.left + (dayIdx + timeFraction) * ((width - padding.left - padding.right) / 7);
                const y = height - padding.bottom - (Math.min(val, RANGE.max) / RANGE.max) * (height - padding.top - padding.bottom);

                allPoints.push({
                    x, y, val,
                    time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    fullDate: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
                    carbs: e.totalCarbs || 0,
                    food: e.userInput || "Registro manual"
                });

                dailySum += val;
                dailyCount++;
            });

            if (dailyCount > 0) {
                const avgVal = dailySum / dailyCount;
                dailyAverages.push({
                    x: padding.left + (dayIdx + 0.5) * ((width - padding.left - padding.right) / 7),
                    y: height - padding.bottom - (Math.min(avgVal, RANGE.max) / RANGE.max) * (height - padding.top - padding.bottom)
                });
            }
        });

        return { points: allPoints, trend: dailyAverages, days: last7Days };
    }, [data, unit]);

    useEffect(() => { setLastSync(new Date()); }, [data]);

    const getY = (val: number) => height - padding.bottom - (val / RANGE.max) * (height - padding.top - padding.bottom);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                
                {/* Header del Gráfico */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={16} className="text-[#007AFF]" />
                            <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.2em]">Tendencia Metabólica</span>
                        </div>
                        <h3 className="text-3xl font-[1000] text-slate-900 italic uppercase tracking-tighter leading-none">
                            Últimos 7 Días
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Live Sync: {lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                        {/* Zonas de Fondo (Áreas de Color Suave) */}
                        <rect x={padding.left} y={getY(RANGE.max)} width={width - padding.left - padding.right} height={getY(RANGE.targetMax) - getY(RANGE.max)} fill="#FF9500" fillOpacity="0.03" />
                        <rect x={padding.left} y={getY(RANGE.targetMax)} width={width - padding.left - padding.right} height={getY(RANGE.hypo) - getY(RANGE.targetMax)} fill="#34C759" fillOpacity="0.05" />
                        
                        {/* Líneas de Guía */}
                        {[70, 180, 250].map(val => (
                            <g key={val}>
                                <line x1={padding.left} y1={getY(val)} x2={width - padding.right} y2={getY(val)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="6 4" />
                                <text x={padding.left - 12} y={getY(val) + 4} textAnchor="end" className="fill-slate-300 text-[10px] font-black">{val}</text>
                            </g>
                        ))}

                        {/* Línea de Tendencia Curva */}
                        {processedData.trend.length > 1 && (
                            <path 
                                d={processedData.trend.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} 
                                fill="none" stroke="#007AFF" strokeWidth="3" strokeOpacity="0.15" strokeLinecap="round" 
                            />
                        )}

                        {/* Puntos de Glucosa */}
                        {processedData.points.map((p, i) => {
                            const color = p.val < RANGE.hypo ? '#FF3B30' : (p.val > RANGE.targetMax ? '#FF9500' : '#34C759');
                            const isHovered = hoveredPoint?.x === p.x;
                            return (
                                <g key={i}>
                                    {isHovered && (
                                        <line x1={p.x} y1={padding.top} x2={p.x} y2={height - padding.bottom} stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                                    )}
                                    <circle 
                                        cx={p.x} cy={p.y} r={isHovered ? 8 : 5}
                                        fill={color} className="cursor-pointer transition-all duration-300"
                                        onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                </g>
                            );
                        })}

                        {/* Etiquetas Eje X */}
                        {processedData.days.map((day, i) => {
                            const x = padding.left + (i + 0.5) * ((width - padding.left - padding.right) / 7);
                            return (
                                <text key={i} x={x} y={height - padding.bottom + 30} textAnchor="middle" 
                                    className="fill-slate-400 text-[10px] font-black uppercase tracking-tighter italic">
                                    {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                                </text>
                            );
                        })}
                    </svg>

                    {/* Tooltip Proyectado */}
                    {hoveredPoint && (
                        <div 
                            className="absolute bg-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] border border-slate-100 min-w-[200px] animate-in zoom-in-95"
                            style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%`, transform: 'translate(-50%, -115%)' }}
                        >
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{hoveredPoint.time} • {hoveredPoint.fullDate}</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className={`text-4xl font-[1000] italic tracking-tighter ${hoveredPoint.val > 180 ? 'text-[#FF9500]' : 'text-[#34C759]'}`}>
                                    {Math.round(hoveredPoint.val)}
                                </span>
                                <span className="text-xs font-black text-slate-300 uppercase italic">{unit}</span>
                            </div>
                            {hoveredPoint.carbs > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-[#007AFF]">
                                        <Sparkles size={12} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase italic">IA: {hoveredPoint.carbs}g Carbs</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel de Insights MetraCore™ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FBFBFD] p-6 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <BrainCircuit size={18} />
                        </div>
                        <h4 className="text-xs font-[1000] text-slate-900 uppercase tracking-widest italic italic">MetraCore™ Insight</h4>
                    </div>
                    
                    <div className={`space-y-4 transition-all ${!isPro ? 'blur-md opacity-20' : ''}`}>
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-[#34C759] shrink-0" size={18} />
                            <p className="text-[11px] font-bold text-slate-500 leading-snug uppercase">
                                Tu variabilidad ha bajado un <span className="text-slate-900">12.4%</span> esta semana tras registrar ingestas por voz.
                            </p>
                        </div>
                    </div>

                    {!isPro && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/40 backdrop-blur-[2px]">
                            <button onClick={() => window.location.href = '/#/plans'}
                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                <Lock size={12} /> Desbloquear Análisis IA
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 italic">Promedio 7 Días</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-[1000] italic tracking-tighter text-[#34C759]">
                            {processedData.trend.length > 0 
                                ? Math.round(processedData.trend.reduce((acc, p) => acc + (height - padding.bottom - p.y) / (height - padding.top - padding.bottom) * RANGE.max, 0) / processedData.trend.length)
                                : '--'}
                        </span>
                        <span className="text-xs font-black text-slate-300 uppercase italic">{unit}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-[#34C759]">
                        <ArrowUpRight size={14} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Estable</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlucoseTrendChart;