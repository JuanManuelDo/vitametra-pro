
import React, { useState } from 'react';
import { MealType, MealScheduleConfig } from '../../types';
import { XMarkIcon, CheckCircleIcon, ClockIcon, SparklesIcon, InformationCircleIcon } from '../ui/Icons';
import Spinner from './Spinner';

interface ScheduleSetupModalProps {
    onClose: () => void;
    onConfirm: (schedule: MealScheduleConfig[]) => Promise<void>;
}

const DEFAULT_ADA_SCHEDULE: Record<MealType, string> = {
    'desayuno': '07:00',
    'snack-manana': '10:30',
    'almuerzo': '13:30',
    'snack-tarde': '17:00',
    'cena': '20:30',
    'snack-noche': '23:30',
    'snack-deportivo': '18:30'
};

const MEAL_LABELS: Record<MealType, string> = {
    'desayuno': 'Desayuno',
    'snack-manana': 'Snack Mañana',
    'almuerzo': 'Almuerzo',
    'snack-tarde': 'Snack Tarde',
    'cena': 'Cena',
    'snack-noche': 'Snack Noche',
    'snack-deportivo': 'Pre-Deporte'
};

const ScheduleSetupModal: React.FC<ScheduleSetupModalProps> = ({ onClose, onConfirm }) => {
    const [schedule, setSchedule] = useState<Record<MealType, string>>({ ...DEFAULT_ADA_SCHEDULE });
    const [isSaving, setIsSaving] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleTimeChange = (type: MealType, time: string) => {
        setSchedule(prev => ({ ...prev, [type]: time }));
    };

    const handleSave = async (useDefaults: boolean = false) => {
        setIsSaving(true);
        const targetSchedule = useDefaults ? DEFAULT_ADA_SCHEDULE : schedule;
        const config: MealScheduleConfig[] = Object.entries(targetSchedule).map(([type, time]) => ({
            mealType: type as MealType,
            startTime: time as string
        }));
        await onConfirm(config);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120] p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-xl relative overflow-hidden flex flex-col max-h-[90vh] border-t-8 border-brand-primary">
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Bloques Horarios {currentYear}</h3>
                            <p className="text-slate-500 text-sm mt-1">Configura tus momentos de ingesta para un análisis clínico preciso este año.</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-6 h-6"/></button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 mb-6">
                        <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                            La IA {currentYear} usará estos horarios para correlacionar tus picos de glucosa con tus comidas de forma automatizada.
                        </p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto px-8 space-y-3 custom-scrollbar">
                    {(Object.keys(MEAL_LABELS) as MealType[]).map((key) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{MEAL_LABELS[key]}</span>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="time" 
                                    value={schedule[key]} 
                                    onChange={(e) => handleTimeChange(key, e.target.value)}
                                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-mono font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                    <button 
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="w-full py-4 bg-brand-primary hover:bg-brand-dark text-white font-black rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Spinner /> : <><CheckCircleIcon className="w-5 h-5" /> Confirmar Configuración {currentYear}</>}
                    </button>
                    <button 
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="w-full py-3 bg-white text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-4 h-4 text-brand-secondary" /> Guías ADA {currentYear} (Recomendado)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleSetupModal;
