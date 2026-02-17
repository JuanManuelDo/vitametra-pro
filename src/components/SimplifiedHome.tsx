import React, { useState, useMemo } from 'react';
import { CheckCircle2, Plus, Activity, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserData, HistoryEntry } from '../types';
// RUTA CORREGIDA
import { apiService } from '../services/infrastructure/apiService';

interface SimplifiedHomeProps {
    currentUser: UserData | null;
    history: HistoryEntry[];
}

const SimplifiedHome: React.FC<SimplifiedHomeProps> = ({ currentUser, history }) => {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [glucose, setGlucose] = useState('');
    const [insulin, setInsulin] = useState('0');
    const [isSaving, setIsSaving] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const todaysLog = useMemo(() => {
        return history?.find(entry => entry.date.startsWith(today) && entry.mealType === 'desayuno');
    }, [history, today]);

    const chartData = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return (history || [])
            .filter(e => new Date(e.date) >= sevenDaysAgo && e.mealType === 'desayuno' && e.bloodGlucoseValue)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(e => ({
                date: new Date(e.date).toLocaleDateString('es-ES', { weekday: 'short' }),
                val: e.bloodGlucoseValue || 0
            }));
    }, [history]);

    if (!currentUser) return null;

    const handleSave = async () => {
        if (!glucose || isSaving) return;
        setIsSaving(true);
        try {
            await apiService.saveHistoryEntry(currentUser.id, {
                mealType: 'desayuno',
                bloodGlucoseValue: parseFloat(glucose),
                finalInsulinUnits: parseFloat(insulin),
                userInput: "Registro manual matutino",
                totalCarbs: 0,
                isCalibrated: false,
                date: new Date().toISOString()
            });
            setIsLogModalOpen(false);
            setGlucose('');
            setInsulin('0');
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 pb-32 min-h-screen bg-[#FBFBFE]">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-[1000] text-slate-900 tracking-tight italic uppercase">Vitametra</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-xl shadow-blue-100">
                    <Activity size={24} />
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-[3rem] border mb-8 transition-all ${todaysLog ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}
            >
                {todaysLog ? (
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-6xl font-[1000] text-slate-900 italic tracking-tighter">{todaysLog.bloodGlucoseValue}</span>
                            <span className="text-xs uppercase font-black text-slate-300">mg/dL</span>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} strokeWidth={3} /> Sincronizado
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-slate-500 text-sm font-bold leading-relaxed">Tu metabolismo espera datos. Registra tu medición en ayunas ahora.</p>
                        <button onClick={() => setIsLogModalOpen(true)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-slate-200">
                            <Plus size={18} strokeWidth={3} /> REGISTRAR AHORA
                        </button>
                    </div>
                )}
            </motion.div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
                <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <Calendar size={16} className="text-blue-600" /> Tendencia Semanal
                </h3>
                {chartData.length > 0 ? (
                    <div className="flex items-end justify-between h-40 gap-3">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div className="w-full bg-slate-50 rounded-2xl relative flex items-end justify-center overflow-hidden h-full">
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min((d.val / 250) * 100, 100)}%` }}
                                        className={`w-full rounded-t-xl ${d.val > 180 ? 'bg-rose-400' : d.val < 70 ? 'bg-amber-400' : 'bg-blue-500'}`}
                                    />
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase italic">{d.date}</span>
                            </div>
                        ))}
                    </div>
                ) : ( <p className="text-center text-slate-300 text-[9px] font-black uppercase py-10 tracking-widest">Esperando flujo de datos...</p> )}
            </div>

            <AnimatePresence>
                {isLogModalOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white rounded-t-[4rem] w-full max-w-md p-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Bio-Registro</h3>
                                <button onClick={() => setIsLogModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400"><X size={20} strokeWidth={3}/></button>
                            </div>
                            <div className="text-center mb-12">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Glucosa actual (mg/dL)</p>
                                <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} className="w-full text-8xl font-[1000] text-center text-blue-600 bg-transparent outline-none italic tracking-tighter" placeholder="000" autoFocus />
                            </div>
                            <button onClick={handleSave} disabled={!glucose || isSaving} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xs tracking-[0.3em] shadow-xl shadow-blue-200 disabled:opacity-30 active:scale-95 transition-all">
                                {isSaving ? 'CIFRANDO...' : 'CONFIRMAR BIO-REGISTRO'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SimplifiedHome;