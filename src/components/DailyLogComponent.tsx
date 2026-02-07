
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { HistoryEntry, UserData, MealType } from '../types'
import { 
    ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, BuildingOfficeIcon, 
    CubeIcon, PersonCycleIcon, PlusIcon, PencilIcon, TrashIcon,
    SparklesIcon, ArrowRightIcon, CheckBadgeIcon, HeartIcon, InformationCircleIcon,
    XMarkIcon
} from './ui/Icons'
import MealDetailModal from './modals/from './MealDetailModal'';
import { MetraCore, type CommunitySuggestion } from '../services/metraCore'

interface DailyLogProps {
    history: HistoryEntry[];
    currentUser: UserData;
    onQuickAdd: (date: Date, mealType: MealType) => void;
    onEditEntry: (entry: HistoryEntry) => void;
    onDeleteEntry: (entryId: string) => Promise<void>;
}

const mealSlotOrder: MealType[] = [
    'desayuno', 
    'snack-manana', 
    'almuerzo', 
    'snack-tarde', 
    'cena', 
    'snack-noche', 
    'snack-deportivo'
];

const mealSlotDetails: { [key in MealType]: { label: string; Icon: React.FC<{className?:string}>; insight?: string } } = {
    'desayuno': { label: 'Desayuno', Icon: SunIcon, insight: 'Prioriza proteínas para estabilizar la mañana.' },
    'snack-manana': { label: 'Snack (Mañana)', Icon: CubeIcon, insight: 'Un puñado de frutos secos evita el pico del almuerzo.' },
    'almuerzo': { label: 'Almuerzo', Icon: BuildingOfficeIcon, insight: 'Recuerda la regla del plato: 50% vegetales.' },
    'snack-tarde': { label: 'Snack (Tarde)', Icon: CubeIcon, insight: 'Hidratación extra en este bloque horaria.' },
    'cena': { label: 'Cena', Icon: MoonIcon, insight: 'Carbohidratos complejos para una noche estable.' },
    'snack-noche': { label: 'Snack (Noche)', Icon: CubeIcon, insight: 'Opción ligera si tu glucemia es < 100 mg/dL.' },
    'snack-deportivo': { label: 'Pre-Deporte', Icon: PersonCycleIcon, insight: 'Carga de energía rápida para tu rendimiento.' },
};

const DailyLogComponent: React.FC<DailyLogProps> = ({ history, currentUser, onQuickAdd, onEditEntry, onDeleteEntry }) => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
    const [expandedSuggestions, setExpandedSuggestions] = useState<Record<string, boolean>>({});
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const dayKey = currentDate.toISOString().split('T')[0];
    const isPro = currentUser?.subscription_tier === 'PRO'
    
    const entriesForDay = useMemo(() => {
        if (!history || !Array.isArray(history)) return [];
        return history.filter(e => e && typeof e.date === 'string' && e.date.startsWith(dayKey));
    }, [history, dayKey]);

    const toggleSuggestions = (slot: string) => {
        setExpandedSuggestions(prev => ({
            ...prev,
            [slot]: !prev[slot]
        }));
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        setIsDeleting(true);
        try {
            await onDeleteEntry(confirmDeleteId);
            setConfirmDeleteId(null);
        } catch (e) {
            console.error("Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* SELECTOR DE DÍA - SHARK STYLE */}
            <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
                <button onClick={() => setCurrentDate(d => {const n=new Date(d); n.setDate(d.getDate()-1); return n;})} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
                </button>
                <div className="text-center">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight capitalize">
                        {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                </div>
                <button onClick={() => setCurrentDate(d => {const n=new Date(d); n.setDate(d.getDate()+1); return n;})} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <ChevronRightIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* LISTA DE SLOTS PERSISTENTES (GAP 12PX) */}
            <div className="grid grid-cols-1 gap-3">
                {mealSlotOrder.map(slot => {
                    const entries = entriesForDay.filter(e => e.mealType === slot);
                    const hasEntries = entries.length > 0;
                    const isExpanded = expandedSuggestions[slot];
                    const { Icon, label, insight } = mealSlotDetails[slot];
                    const communityTips = isPro && !hasEntries ? MetraCore.getCommunitySuggestions(slot) : [];
                    
                    return (
                        <div key={slot} className="flex flex-col animate-fade-in">
                            <div 
                                className={`group p-5 rounded-[1.75rem] border transition-all flex flex-col md:flex-row items-center gap-6 ${
                                    hasEntries 
                                    ? 'bg-white border-slate-100 shadow-sm' 
                                    : 'bg-slate-50/30 border-dashed border-slate-200 hover:border-brand-primary/40 cursor-pointer hover:bg-slate-50/50'
                                }`}
                                onClick={() => !hasEntries && !isExpanded && onQuickAdd(currentDate, slot)}
                            >
                                {/* Icono del Momento */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                    hasEntries ? 'bg-brand-primary/10 text-[#1e3a8a]' : 'bg-white text-slate-300 shadow-inner'
                                }`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                
                                {/* Contenido del Slot */}
                                <div className="flex-grow text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                        {isPro && insight && (
                                            <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold text-brand-secondary bg-green-50 px-2 py-0.5 rounded-full border border-green-100 animate-fade-in">
                                                <SparklesIcon className="w-3 h-3" /> Sugerencia PRO
                                            </span>
                                        )}
                                    </div>

                                    {hasEntries ? (
                                        <div className="space-y-3">
                                            {entries.map((entry, idx) => (
                                                <div key={entry.id} className={`flex items-center justify-between ${idx > 0 ? 'pt-3 border-t border-slate-50' : '}`}>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-800 tracking-tight">
                                                            {entry.totalCarbs}g <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter ml-1">Carbohidratos</span>
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {entry.bloodGlucoseValue && (
                                                                <p className="text-xs font-bold text-slate-500">
                                                                    Glucemia: <span className="text-[#1e3a8a]">{entry.bloodGlucoseValue} mg/dL</span>
                                                                </p>
                                                            )}
                                                            <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[150px]">
                                                                "{entry.userInput}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry); }}
                                                            className="px-4 py-2 bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-blue-50 rounded-xl text-[10px] font-black uppercase transition-all"
                                                        >
                                                            Ver
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onEditEntry(entry); }}
                                                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-brand-primary transition-all shadow-lg shadow-black/5"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(entry.id); }}
                                                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                                                            title="Eliminar registro"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-400">Sin registro clínico</h4>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Toca para completar tu día</p>
                                            </div>
                                            {isPro && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleSuggestions(slot); }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-[10px] font-black uppercase transition-all border border-indigo-100"
                                                >
                                                    <SparklesIcon className="w-3.5 h-3.5" />
                                                    {isExpanded ? 'Cerrar Guía' : 'Sabiduría de la Multitud'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Acción Rápida Slot Vacío */}
                                {!hasEntries && !isExpanded && (
                                    <div className="shrink-0 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-brand-primary group-hover:text-brand-primary group-hover:bg-white transition-all">
                                            <PlusIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PANEL DE SUGERENCIAS DE COMUNIDAD (PREMIUM EXCLUSIVE) */}
                            {isPro && !hasEntries && isExpanded && (
                                <div className="mt-2 mx-4 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl border border-white/5 animate-fade-in">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                                                <CheckBadgeIcon className="w-6 h-6 text-brand-primary" />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black uppercase tracking-widest text-brand-primary">Opciones de Éxito</h5>
                                                <p className="text-[10px] text-slate-400 font-medium">Sugerencias basadas en el 80% superior de usuarios</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                            <InformationCircleIcon className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Datos Anonimizados</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {communityTips.map((tip, tIdx) => (
                                            <div key={tIdx} className="group/tip flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold">{tip.food}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                                            tip.impact === 'bajo' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-amber-900/40 text-amber-400 border border-amber-800'
                                                        }`}>
                                                            Impacto {tip.impact}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 italic">"{tip.insight}"</p>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-brand-secondary">✅ {tip.successRate}%</p>
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Éxito TIR</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => alert("Agregado a favoritos (Demo)")}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                            title="Guardar en favoritos"
                                                        >
                                                            <HeartIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => onQuickAdd(currentDate, slot)}
                                                            className="px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all"
                                                        >
                                                            Registrar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                                        <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                                            Sugerencias basadas en tendencias reales de VitaMetra. Consulta siempre con tu nutricionista tratante.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Banner Informativo PRO para usuarios FREE */}
                            {!isPro && hasEntries && (
                                <div 
                                    onClick={() => navigate('/plans')}
                                    className="mx-6 p-2 bg-blue-50/50 rounded-b-2xl border-x border-b border-blue-100 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors"
                                >
                                    <SparklesIcon className="w-3 h-3 text-brand-primary" />
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        Pásate a PRO para ver sugerencias nutricionales en este slot
                                    </p>
                                    <ArrowRightIcon className="w-3 h-3 text-brand-primary" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => !isDeleting && setConfirmDeleteId(null)}>
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TrashIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">¿Eliminar registro?</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                            Esta acción eliminará permanentemente los datos clínicos del historial y no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center"
                            >
                                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedEntry && (
                <MealDetailModal 
                    entry={selectedEntry} 
                    onClose={() => setSelectedEntry(null)} 
                    onEdit={() => { onEditEntry(selectedEntry); setSelectedEntry(null); }} 
                />
            )}
        </div>
    );
};

export default DailyLogComponent;
