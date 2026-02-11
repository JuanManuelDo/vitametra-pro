import React, { useState, useMemo } from 'react';
import { 
    CheckCircle2, Plus, Activity, Syringe, Calendar, 
    ChevronRight, AlertCircle, Clock, Sparkles, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserData, HistoryEntry } from '../types';
import { apiService } from '../services/apiService';

interface SimplifiedHomeProps {
    currentUser: UserData | null;
    history: HistoryEntry[];
}

const SimplifiedHome: React.FC<SimplifiedHomeProps> = ({ currentUser, history }) => {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [glucose, setGlucose] = useState('');
    const [insulin, setInsulin] = useState('0');
    const [isSaving, setIsSaving] = useState(false);

    // --- LÓGICA DE CONTROL DIARIO ---
    const today = new Date().toISOString().split('T')[0];
    const todaysLog = useMemo(() => {
        return history?.find(entry => entry.date.startsWith(today) && entry.mealType === 'desayuno');
    }, [history, today]);

    // --- LÓGICA DE TENDENCIA ---
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

    // --- CORRECCIÓN DE ERROR (Línea 47-53) ---
    const handleSave = async () => {
        if (!glucose || isSaving) return;
        setIsSaving(true);
        try {
            // Se envía un solo objeto que incluye el userId según espera el apiService
            await apiService.saveHistoryEntry({
                userId: currentUser.id,
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
        } catch (error) {
            console.error("Error al guardar registro:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 pb-32 min-h-screen bg-[#FBFBFE]">
            {/* HEADER ESTILO APPLE HEALTH */}
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-[1000] text-slate-900 tracking-tight">Vitametra</h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Activity size={24} />
                </div>
            </header>

            {/* CARD DE ESTADO METABÓLICO (Inspirado en Oura) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden p-8 rounded-[3rem] border transition-all duration-700 mb-8 ${
                    todaysLog 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-white border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)]'
                }`}
            >
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${todaysLog ? 'bg-white' : 'bg-blue-50 text-blue-600'}`}>
                            <Sparkles size={20} className={todaysLog ? 'text-emerald-500' : ''} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado Diario</p>
                            <h2 className="font-extrabold text-slate-900 text-xl">Sintonía Glucémica</h2>
                        </div>
                    </div>
                </div>

                {todaysLog ? (
                    <div className="flex items-end gap-10">
                        <div>
                            <p className="text-5xl font-black text-slate-900 tracking-tighter">
                                {todaysLog.bloodGlucoseValue}
                                <span className="text-sm font-bold text-slate-300 ml-2 uppercase tracking-widest">mg/dL</span>
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase">
                                <CheckCircle2 size={12} /> Registro Completo
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            No has registrado tu medición en ayunas. Conecta tu metabolismo ahora.
                        </p>
                        <button 
                            onClick={() => setIsLogModalOpen(true)}
                            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} /> REGISTRAR MEDICIÓN
                        </button>
                    </div>
                )}
            </motion.div>

            {/* GRÁFICO DE TENDENCIAS (Minimalismo Apple) */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        <Calendar size={18} className="text-blue-600" /> Historial
                    </h3>
                    <ChevronRight size={18} className="text-slate-300" />
                </div>
                
                {chartData.length > 0 ? (
                    <div className="flex items-end justify-between h-40 gap-3">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div className="w-full bg-slate-50 rounded-2xl relative flex items-end justify-center overflow-hidden h-full">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.min((d.val / 250) * 100, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`w-full rounded-t-xl ${
                                            d.val > 180 ? 'bg-rose-400' : d.val < 70 ? 'bg-amber-400' : 'bg-blue-500'
                                        }`}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase">{d.date}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="text-slate-200" size={32} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Esperando datos...</p>
                    </div>
                )}
            </div>

            {/* MODAL ESTADO DEL ARTE (Inspirado en IA interfaces) */}
            <AnimatePresence>
                {isLogModalOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLogModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative bg-white rounded-t-[3.5rem] sm:rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl overflow-hidden"
                        >
                            {/* Glow decorativo interior */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 blur-3xl rounded-full -mr-16 -mt-16" />
                            
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Entrada de Datos</h3>
                                <button onClick={() => setIsLogModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
                            </div>

                            <div className="space-y-10">
                                <div className="text-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Glucosa en mg/dL</label>
                                    <input 
                                        type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)}
                                        className="w-full text-7xl font-black text-center text-blue-600 bg-transparent outline-none placeholder:text-blue-50" 
                                        placeholder="000" autoFocus
                                    />
                                </div>

                                <div className="bg-slate-50 p-8 rounded-[2.5rem] flex items-center justify-between border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosis Insulina</p>
                                        <p className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                            <Syringe size={18} className="text-blue-500" /> {insulin} <span className="text-xs text-slate-400 uppercase">UI</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setInsulin((prev) => Math.max(0, parseFloat(prev) - 0.5).toString())} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 active:scale-90">-</button>
                                        <button onClick={() => setInsulin((prev) => (parseFloat(prev) + 0.5).toString())} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg active:scale-90">+</button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleSave} disabled={!glucose || isSaving}
                                className="w-full mt-10 bg-blue-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {isSaving ? 'Sincronizando...' : 'CONFIRMAR REGISTRO'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SimplifiedHome;