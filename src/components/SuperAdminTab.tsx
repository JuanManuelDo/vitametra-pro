
import React, { useState, useEffect } from 'react';
import { 
    ActivityIcon, BuildingOfficeIcon, RobotIcon, 
    DocumentTextIcon, UserCircleIcon, 
    CheckCircleIcon, ShieldCheckIcon,
    SparklesIcon, ChartPieIcon, CreditCardIcon, ArrowRightIcon,
    ClockIcon, TargetIcon
} from './Icons';
import Spinner from './Spinner';
import { apiService } from '../services/apiService';
import type { FounderBusinessMetrics } from '../types';

const SharkMetric: React.FC<{ label: string; value: string | number; sub: string; icon: any; color: string }> = ({ label, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
        <div className={`p-4 rounded-2xl ${color} mb-4`}>
            <Icon className="w-8 h-8" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h4>
        <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase">{sub}</p>
    </div>
);

const SuperAdminTab: React.FC = () => {
    const [metrics, setMetrics] = useState<FounderBusinessMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await apiService.fetchFounderMetrics();
            setMetrics(data);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) return <div className="flex flex-col items-center justify-center py-40 gap-4"><Spinner /><p className="text-xs font-black uppercase text-slate-400 tracking-widest">Iniciando Shark Dashboard...</p></div>;

    return (
        <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 p-10 rounded-[3rem] text-white">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center">
                            <RobotIcon className="w-7 h-7 text-white" />
                        </div>
                        MetraCore Control
                    </h1>
                    <p className="text-brand-primary font-bold text-xs uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4" /> Monitor de Escala Global 2025
                    </p>
                </div>
                <div className="bg-white/10 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Runway Estimado</p>
                    <p className="text-2xl font-black">24 Meses <span className="text-xs font-normal opacity-50">@ 9k Usuarios</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SharkMetric 
                    label="Viralidad (Retención D1)" 
                    value={`${metrics!.retentionRate}%`} 
                    sub="Usuarios que vuelven el 2do día" 
                    icon={ActivityIcon} 
                    color="bg-emerald-50 text-emerald-600" 
                />
                <SharkMetric 
                    label="Conversión PRO" 
                    value={`${(metrics!.revenueStats.activeSubscriptions / 10).toFixed(1)}%`} 
                    sub="Free-to-Paid Conversion" 
                    icon={CreditCardIcon} 
                    color="bg-blue-50 text-blue-600" 
                />
                <SharkMetric 
                    label="Latencia IA" 
                    value="1.4s" 
                    sub="Promedio de inferencia MetraCore" 
                    icon={ClockIcon} 
                    color="bg-amber-50 text-amber-600" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5 text-brand-primary" /> Objetivos de Crecimiento
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-400 uppercase">Hito: 1,000 Usuarios (Beta Stage)</span>
                                <span className="text-brand-primary">84%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div className="h-full bg-brand-primary animate-pulse" style={{ width: '84%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-400 uppercase">Hito: 9,000 Usuarios (Market Fit)</span>
                                <span className="text-slate-300">12%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div className="h-full bg-slate-200" style={{ width: '12%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><ChartPieIcon className="w-48 h-48" /></div>
                    <div className="relative z-10">
                        <h3 className="font-black text-xs uppercase tracking-[0.3em] mb-8 text-blue-200">Facturación Recurrente (MRR)</h3>
                        <div className="space-y-2">
                            <p className="text-5xl font-black">$12,500 <span className="text-lg opacity-40">USD</span></p>
                            <p className="text-sm font-medium text-blue-100">Crecimiento intermensual: <span className="text-green-400 font-black">+18%</span></p>
                        </div>
                        <button className="mt-10 flex items-center justify-between w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group">
                            <span className="text-[10px] font-black uppercase tracking-widest">Auditar Transacciones GPay</span>
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminTab;
