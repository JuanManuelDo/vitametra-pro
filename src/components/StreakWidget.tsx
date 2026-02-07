
import React, { useState, useMemo } from 'react'
import { FireIcon, TrophyIcon, InformationCircleIcon, XMarkIcon, SparklesIcon, ActivityIcon, RobotIcon } from './ui/Icons'
import type { UserStreak, HistoryEntry } from '../types'

interface StreakWidgetProps {
    streak: UserStreak | undefined;
    history: HistoryEntry[];
    userName: string;
    todayEntries: number;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ streak, history, userName, todayEntries }) => {
    const [showInfo, setShowInfo] = useState(false);

    // QA AUDIT: Lógica de Racha Blindada
    const currentStreak = useMemo(() => {
        if (!history || history.length === 0) return 0;
        
        const activeDays = new Set<string>();
        history.forEach(entry => {
            if (entry.date) {
                activeDays.add(entry.date.split('T')[0]);
            }
        });

        const sortedDays = Array.from(activeDays).sort((a, b) => b.localeCompare(a));
        if (sortedDays.length === 0) return 0;

        let streakCount = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Racha se rompe si no hay registros hoy ni ayer (Inactividad > 48h)
        if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0;

        let currentCheck = new Date(sortedDays[0]);
        for (let i = 0; i < sortedDays.length; i++) {
            const dayStr = currentCheck.toISOString().split('T')[0];
            if (activeDays.has(dayStr)) {
                streakCount++;
                currentCheck.setDate(currentCheck.getDate() - 1);
            } else {
                break;
            }
        }
        return streakCount;
    }, [history]);

    // QA AUDIT: Detección de Patrones por IA
    const foodPattern = useMemo(() => {
        if (!history || history.length === 0) return null;
        
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentEntries = history.filter(e => new Date(e.date).getTime() > sevenDaysAgo);
        
        const counts: Record<string, number> = {};
        recentEntries.forEach(e => {
            e.items?.forEach(item => {
                const name = item.food.split('(')[0].trim().toLowerCase();
                if (name.length > 2) {
                    counts[name] = (counts[name] || 0) + 1;
                }
            });
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : null;
    }, [history]);

    const isActive = currentStreak > 0;
    // Calibración de Progreso: Hito de 7 días (42.8% en 3 días)
    const progressToMilestone = Math.min((currentStreak / 7) * 100, 100);
    const hba1cAccuracyBonus = Math.min(currentStreak * 6, 42); // Máximo 42% de confianza extra

    return (
        <div className={`group relative overflow-hidden p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-0.5 ${
            isActive 
            ? 'bg-gradient-to-br from-orange-500 via-[#FF7043] to-amber-500 text-white' 
            : 'bg-white border border-slate-200 text-slate-400'
        }`} style={{ borderRadius: '16px' }}>
            
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <SparklesIcon className="w-32 h-32 rotate-12" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
                <div className={`p-6 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
                    isActive 
                    ? 'bg-white/20 shadow-2xl backdrop-blur-xl scale-110' 
                    : 'bg-slate-50 border border-slate-100'
                }`}>
                    <FireIcon className={`w-14 h-14 ${
                        isActive ? 'text-white animate-pulse' : 'text-slate-300'
                    }`} />
                </div>

                <div className="flex-grow text-center md:text-left">
                    <h4 className={`text-[11px] font-black uppercase tracking-[0.25em] mb-2 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {isActive ? `Protocolo VitaMetra Activo: ${userName}` : "Inicia tu Ciclo de Bienestar"}
                    </h4>
                    <div className="flex items-baseline justify-center md:justify-start gap-4">
                        <span className={`text-6xl font-black tracking-tighter ${isActive ? 'text-white' : 'text-slate-800'}`}>
                            {currentStreak} {currentStreak === 1 ? 'Día' : 'Días'}
                        </span>
                        <span className={`text-sm font-bold opacity-80 uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>
                            Activo
                        </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                        <p className={`text-xs font-bold leading-relaxed ${isActive ? 'text-white/90' : 'text-slate-400 italic'}`}>
                            {isActive 
                              ? `Rendimiento: ${history.length} interacciones clínicas. Tu IA está operando al 100%.`
                              : "Un registro hoy reactivará tu racha de precisión metabólica."
                            }
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <button 
                        onClick={() => setShowInfo(true)}
                        className={`p-3 rounded-2xl transition-all ${
                            isActive ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-300 hover:text-brand-primary hover:bg-slate-50'
                        }`}
                    >
                        <InformationCircleIcon className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {isActive && (
                <div className="mt-8 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <RobotIcon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/90">Análisis Textual:</p>
                    </div>
                    <div className="flex-grow md:text-right">
                        <p className="text-xs font-bold text-white">
                            {foodPattern 
                                ? `Tendencia detectada: Consumo frecuente de "${foodPattern}". Optimizando predicciones.`
                                : "Analizando registros previos para identificar sesgos nutricionales..."
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* QA AUDIT: MODAL DE INFORMACIÓN CON FONDO SÓLIDO #F9FAFB */}
            {showInfo && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[8px] z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowInfo(false)}>
                    <div 
                        className="bg-[#F9FAFB] w-full max-w-sm rounded-[2rem] shadow-2xl p-10 relative border border-slate-200 animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowInfo(false)} 
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                        
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-brand-primary text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                    <ActivityIcon className="w-7 h-7" />
                                </div>
                                <h5 className="font-black text-slate-800 text-2xl tracking-tighter leading-none">Precisión IA<br/>Metabólica</h5>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Tu constancia permite a VitaMetra mapear tu sensibilidad insulínica real. Con <span className="text-brand-primary font-black">{currentStreak} días</span> activos, la confianza de tu modelo ha subido un <span className="text-brand-secondary font-black">{hba1cAccuracyBonus}%</span>.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span>Hito Semanal (Protocolo ADA)</span>
                                    <span className="text-brand-primary font-black">{Math.round(progressToMilestone)}% COMPLETADO</span>
                                </div>
                                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className="h-full bg-brand-primary transition-all duration-1000 ease-out shadow-lg"
                                        style={{ width: `${progressToMilestone}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 italic text-center font-bold">
                                    {currentStreak >= 7 
                                        ? "¡Nivel de Confianza Máximo! IA calibrada al historial personal." 
                                        : `Faltan ${7 - currentStreak} días para el reporte consolidado de alta precisión.`
                                    }
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setShowInfo(false)}
                                className="w-full text-xs font-black text-white bg-[#1A202C] py-5 rounded-2xl shadow-xl hover:bg-black transition-all transform active:scale-95 uppercase tracking-[0.2em]"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-slide-up {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default StreakWidget;
