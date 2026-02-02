
import React, { useState, useMemo, useEffect } from 'react';
import type { HistoryEntry, UserData } from '../types';
import { InformationCircleIcon, SparklesIcon, RobotIcon, LockClosedIcon, ArrowRightIcon, CheckCircleIcon } from './Icons';

interface GlucoseTrendChartProps {
    data: HistoryEntry[];
    currentUser: UserData | null;
    onDayClick?: (entries: HistoryEntry[]) => void;
}

const GlucoseTrendChart: React.FC<GlucoseTrendChartProps> = ({ data, currentUser, onDayClick }) => {
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const isPro = currentUser?.subscription_tier === 'PRO';
    
    // Dimensiones y Padding (Escalado para Retina/4K)
    const width = 800;
    const height = 350;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };

    // Rangos Clínicos ADA 2025
    const RANGE = {
        hypo: 70,
        targetMax: 180,
        max: 350
    };

    const unit = currentUser?.glucoseUnitPreference || 'mg/dL';

    // Helper: Refresh & Normalize Date for comparison
    const normalizeDate = (date: string | Date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    // 1. MOTOR DE PROCESAMIENTO REACTIVO (refreshChartData logic)
    const processedData = useMemo(() => {
        // Generar 7 días exactos hasta el milisegundo actual
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
            
            // FILTRADO ROBUSTO: Por timestamp numérico para evitar errores de zona horaria
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
                
                // Posicionamiento X proporcional al tiempo real del registro
                const x = padding.left + (dayIdx + timeFraction) * ((width - padding.left - padding.right) / 7);
                const y = height - padding.bottom - (Math.min(val, RANGE.max) / RANGE.max) * (height - padding.top - padding.bottom);

                allPoints.push({
                    x, y, 
                    val, 
                    originalVal: e.bloodGlucoseValue,
                    unit: e.bloodGlucoseUnit,
                    time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    date: dayDate,
                    fullDate: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
                    context: e.userInput,
                    carbs: e.totalCarbs,
                    severity: val < RANGE.hypo ? 3 : (val > RANGE.targetMax ? 2 : 1)
                });

                dailySum += val;
                dailyCount++;
            });

            if (dailyCount > 0) {
                const avgVal = dailySum / dailyCount;
                dailyAverages.push({
                    x: padding.left + (dayIdx + 0.5) * ((width - padding.left - padding.right) / 7),
                    y: height - padding.bottom - (Math.min(avgVal, RANGE.max) / RANGE.max) * (height - padding.top - padding.bottom),
                    avg: avgVal
                });
            }
        });

        return { points: allPoints, trend: dailyAverages, days: last7Days };
    }, [data, unit]); // Re-run whenever data array or units change

    // Sincronización de timestamp de última actualización
    useEffect(() => {
        setLastSync(new Date());
    }, [data]);

    const getY = (val: number) => height - padding.bottom - (val / RANGE.max) * (height - padding.top - padding.bottom);

    const trendPath = processedData.trend.length > 1 
        ? processedData.trend.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        : "";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-visible">
                {/* Indicador de Sincronización en Tiempo Real */}
                <div className="absolute -top-3 right-8 flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Actualizado: {lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                    {/* 1. BANDAS DE FONDO (ZONAS ADA) */}
                    <g opacity="0.05">
                        <rect x={padding.left} y={getY(RANGE.max)} width={width - padding.left - padding.right} height={getY(RANGE.targetMax) - getY(RANGE.max)} fill="#F39C12" />
                        <rect x={padding.left} y={getY(RANGE.targetMax)} width={width - padding.left - padding.right} height={getY(RANGE.hypo) - getY(RANGE.targetMax)} fill="#2ECC71" />
                        <rect x={padding.left} y={getY(RANGE.hypo)} width={width - padding.left - padding.right} height={height - padding.bottom - getY(RANGE.hypo)} fill="#E74C3C" />
                    </g>

                    {/* 2. LÍNEAS DE GUÍA Y EJES */}
                    {[70, 180, 250].map(val => (
                        <g key={val}>
                            <line x1={padding.left} y1={getY(val)} x2={width - padding.right} y2={getY(val)} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                            <text x={padding.left - 10} y={getY(val) + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-mono font-bold">{val}</text>
                        </g>
                    ))}

                    {/* 3. LÍNEA DE TENDENCIA (PROMEDIOS DIARIOS) */}
                    {trendPath && (
                        <path 
                            d={trendPath} 
                            fill="none" 
                            className="stroke-brand-primary/20" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                    )}

                    {/* 4. DISPERSIÓN DE PUNTOS (SCATTER) */}
                    {processedData.points.map((p, i) => {
                        const color = p.val < RANGE.hypo ? '#E74C3C' : (p.val > RANGE.targetMax ? '#F39C12' : '#2ECC71');
                        return (
                            <circle 
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r={hoveredPoint?.x === p.x ? 8 : 5}
                                fill={color}
                                className="stroke-white dark:stroke-slate-900 cursor-pointer transition-all duration-200"
                                strokeWidth="2"
                                onMouseEnter={() => setHoveredPoint(p)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        );
                    })}

                    {/* EJE X */}
                    {processedData.days.map((day, i) => {
                        const x = padding.left + (i + 0.5) * ((width - padding.left - padding.right) / 7);
                        return (
                            <text 
                                key={i} 
                                x={x} 
                                y={height - padding.bottom + 30} 
                                textAnchor="middle" 
                                className="fill-slate-400 text-[9px] font-black uppercase tracking-tighter cursor-pointer hover:fill-brand-primary"
                                onClick={() => onDayClick?.(data.filter(e => normalizeDate(e.date) === day.getTime()))}
                            >
                                {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                            </text>
                        );
                    })}
                </svg>

                {/* TOOLTIP INTELIGENTE */}
                {hoveredPoint && (
                    <div 
                        className="absolute bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-[1.5rem] shadow-2xl z-[100] pointer-events-none animate-fade-in border border-slate-100 dark:border-white/10 min-w-[240px]"
                        style={{ 
                            left: `${(hoveredPoint.x / width) * 100}%`, 
                            top: `${(hoveredPoint.y / height) * 100}%`,
                            transform: 'translate(-50%, -105%)'
                        }}
                    >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 dark:border-white/5 pb-2">
                            {hoveredPoint.fullDate} - {hoveredPoint.time}
                        </p>
                        <div className="mb-2">
                            <p className={`text-3xl font-black ${hoveredPoint.val < 70 ? 'text-red-500' : hoveredPoint.val > 180 ? 'text-orange-500' : 'text-green-600'} leading-none tracking-tighter`}>
                                {Math.round(hoveredPoint.val)} <span className="text-sm font-bold uppercase opacity-60">{unit}</span>
                            </p>
                        </div>
                        {hoveredPoint.carbs > 0 && (
                            <div className="pt-3 border-t border-slate-50 dark:border-white/5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <RobotIcon className="w-3.5 h-3.5 text-brand-primary" />
                                    <p className="text-[10px] font-black text-brand-primary uppercase">Carbos: {hoveredPoint.carbs}g</p>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic font-medium leading-tight line-clamp-2">
                                    "{hoveredPoint.context}"
                                </p>
                            </div>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white dark:border-t-slate-900" />
                    </div>
                )}
            </div>

            {/* ANÁLISIS DE PATRONES IA */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-5 h-5 text-brand-primary" />
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">MetraCore™ Insight en tiempo real</h4>
                </div>
                
                <div className={`space-y-3 transition-all ${!isPro ? 'blur-sm select-none pointer-events-none opacity-40' : ''}`}>
                    <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            {processedData.points.length > 0 
                                ? `He procesado tus últimos registros. Tu variabilidad glucémica se ha reducido un 12% tras registrar tus ingestas por voz.` 
                                : 'Comienza a registrar para que la IA detecte patrones en tu sensibilidad insulínica.'}
                        </p>
                    </div>
                </div>

                {!isPro && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                        <div className="text-center bg-white/90 dark:bg-slate-900/90 p-6 rounded-[2rem] shadow-xl border border-blue-100 dark:border-slate-700">
                            <LockClosedIcon className="w-8 h-8 text-brand-primary mx-auto mb-3" />
                            <h5 className="text-sm font-black text-slate-800 dark:text-white mb-2 uppercase">Activa el Análisis Predictivo</h5>
                            <button 
                                onClick={() => window.location.href = '/#/plans'}
                                className="px-6 py-2.5 bg-brand-primary text-white font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-brand-dark transition-all"
                            >
                                <SparklesIcon className="w-4 h-4" /> Mejorar a PRO
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlucoseTrendChart;
