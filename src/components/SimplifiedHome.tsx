
import React, { useState, useMemo } from 'react'
import type { UserData, HistoryEntry } from '../types'
import { CheckCircleIcon, PlusIcon, BloodDropIcon, SyringeIcon, CalendarDaysIcon } from './ui/Icons'
import { apiService } from '../services/apiService'
import Spinner from './ui/Spinner'

interface SimplifiedHomeProps {
    currentUser: UserData;
    history: HistoryEntry[];
}

const SimplifiedHome: React.FC<SimplifiedHomeProps> = ({ currentUser, history }) => {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [glucose, setGlucose] = useState('');
    const [insulin, setInsulin] = useState(currentUser.defaultBasalDose?.toString() || '');
    const [isSaving, setIsSaving] = useState(false);

    // --- LOGIC: Check if task completed today ---
    const today = new Date().toISOString().split('T')[0];
    const todaysLog = useMemo(() => {
        return history.find(entry => entry.date.startsWith(today) && entry.mealType === 'desayuno');
    }, [history, today]);

    const isCompleted = !!todaysLog;

    // --- CHART DATA: Last 7 Days Fasting ---
    const chartData = useMemo(() => {
        // Filter last 7 days of 'desayuno' entries
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        return history
            .filter(e => new Date(e.date) >= sevenDaysAgo && e.mealType === 'desayuno' && e.bloodGlucoseValue)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(e => ({
                date: new Date(e.date).toLocaleDateString('es-ES', { weekday: 'short' }),
                val: e.bloodGlucoseValue || 0
            }));
    }, [history]);

    const handleSave = async () => {
        if (!glucose) return;
        setIsSaving(true);
        try {
            const entry: any = {
                id: `simple-${Date.now()}`,
                userId: currentUser.id,
                date: new Date().toISOString(),
                mealType: 'desayuno', // Mapping "Fasting" to desayuno for consistency
                userInput: 'Registro Diario Simplificado',
                totalCarbs: 0,
                items: [],
                glycemicIndex: 'medio',
                bloodGlucoseValue: parseFloat(glucose),
                bloodGlucoseUnit: 'mg/dL',
                finalInsulinUnits: insulin ? parseFloat(insulin) : undefined
            };
            await apiService.saveHistoryEntry(entry);
            setIsLogModalOpen(false);
        } catch (error) {
            alert("Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const adjustInsulin = (delta: number) => {
        const current = parseFloat(insulin || '0');
        const next = Math.max(0, current + delta);
        setInsulin(next.toString());
    };

    return (
        <div className="max-w-md mx-auto p-4 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Hola, {currentUser.firstName}</h1>

            {/* MAIN TASK CARD */}
            <div className={`p-6 rounded-3xl shadow-lg transition-all duration-500 mb-8 border-2 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-blue-100'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-700">Tu Rutina de Hoy</h2>
                        <p className="text-sm text-slate-500">Registro Matutino</p>
                    </div>
                    {isCompleted ? (
                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></span>
                        </div>
                    )}
                </div>

                {isCompleted ? (
                    <div className="text-center py-4">
                        <p className="text-xl font-bold text-green-700">¡Todo listo por hoy!</p>
                        <p className="text-sm text-green-600">Has registrado {todaysLog?.bloodGlucoseValue} mg/dL</p>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsLogModalOpen(true)}
                        className="w-full py-4 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-6 h-6" />
                        Registrar Medición
                    </button>
                )}
            </div>

            {/* SIMPLE TREND CHART */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-brand-secondary" />
                    Tendencia Semanal (Ayunas)
                </h3>
                
                {chartData.length > 0 ? (
                    <div className="flex items-end justify-between h-40 pt-4 px-2 space-x-2">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        className="w-3 bg-brand-primary/30 rounded-t-sm group-hover:bg-brand-primary transition-colors"
                                        style={{ height: `${Math.min((d.val / 200) * 100, 100)}px` }}
                                    ></div>
                                    <span className="absolute -top-6 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {d.val}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-2">{d.date}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-8">Registra unos días para ver tu tendencia.</p>
                )}
            </div>

            {/* MODAL SIMPLIFICADO */}
            {isLogModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Registro del Día</h3>
                        
                        <div className="space-y-6">
                            {/* Glucose Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                                    <BloodDropIcon className="w-4 h-4" /> Nivel de Azúcar
                                </label>
                                <input 
                                    type="number" 
                                    step="1"
                                    value={glucose}
                                    onChange={(e) => setGlucose(e.target.value)}
                                    placeholder="Ej: 110"
                                    className="w-full text-center text-4xl font-bold border-b-2 border-slate-200 focus:border-brand-primary outline-none py-2 text-brand-primary"
                                    autoFocus
                                />
                                <p className="text-center text-xs text-slate-400 mt-1">mg/dL</p>
                            </div>

                            {/* Insulin Input (Pre-filled) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                                    <SyringeIcon className="w-4 h-4" /> Dosis Insulina
                                </label>
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={() => adjustInsulin(-0.5)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-xl font-bold">-</button>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={insulin}
                                        onChange={(e) => setInsulin(e.target.value)}
                                        className="w-24 text-center text-2xl font-bold border border-slate-200 rounded-lg py-2"
                                    />
                                    <button onClick={() => adjustInsulin(0.5)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-xl font-bold">+</button>
                                </div>
                                <p className="text-center text-xs text-slate-400 mt-1">Unidades (Paso de 0.5 UI)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setIsLogModalOpen(false)} className="py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50">Cancelar</button>
                            <button 
                                onClick={handleSave} 
                                disabled={!glucose || isSaving}
                                className="py-3 rounded-xl bg-brand-secondary text-white font-bold shadow-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSaving ? <Spinner /> : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimplifiedHome;
