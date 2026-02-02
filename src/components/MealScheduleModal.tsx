
import React, { useState, useEffect } from 'react';
import type { MealType, MealScheduleConfig } from '../types';
import { XMarkIcon, CheckCircleIcon, SunIcon, CubeIcon, BuildingOfficeIcon, MoonIcon, PersonCycleIcon } from './Icons';

interface MealScheduleModalProps {
    currentSchedule?: MealScheduleConfig[];
    onClose: () => void;
    onSave: (schedule: MealScheduleConfig[]) => void;
}

const DEFAULT_SCHEDULE: Record<MealType, string> = {
    'desayuno': '08:00',
    'snack-manana': '11:00',
    'almuerzo': '13:00',
    'snack-tarde': '17:00',
    'cena': '20:00',
    'snack-noche': '23:00',
    'snack-deportivo': '18:00'
};

const MEAL_DETAILS: Record<MealType, { label: string, icon: React.FC<{className?:string}>, color: string }> = {
    'desayuno': { label: 'Desayuno', icon: SunIcon, color: 'text-orange-500 bg-orange-100' },
    'snack-manana': { label: 'Snack (Mañana)', icon: CubeIcon, color: 'text-slate-500 bg-slate-100' },
    'almuerzo': { label: 'Almuerzo', icon: BuildingOfficeIcon, color: 'text-blue-500 bg-blue-100' },
    'snack-tarde': { label: 'Snack (Tarde)', icon: CubeIcon, color: 'text-slate-500 bg-slate-100' },
    'cena': { label: 'Cena', icon: MoonIcon, color: 'text-indigo-500 bg-indigo-100' },
    'snack-noche': { label: 'Snack (Noche)', icon: CubeIcon, color: 'text-slate-500 bg-slate-100' },
    'snack-deportivo': { label: 'Pre-Deporte', icon: PersonCycleIcon, color: 'text-green-500 bg-green-100' }
};

const ORDERED_MEALS: MealType[] = [
    'desayuno', 'snack-manana', 'almuerzo', 'snack-tarde', 'snack-deportivo', 'cena', 'snack-noche'
];

const MealScheduleModal: React.FC<MealScheduleModalProps> = ({ currentSchedule, onClose, onSave }) => {
    const [scheduleMap, setScheduleMap] = useState<Record<MealType, string>>({ ...DEFAULT_SCHEDULE });

    useEffect(() => {
        if (currentSchedule && currentSchedule.length > 0) {
            const newMap = { ...DEFAULT_SCHEDULE };
            currentSchedule.forEach(item => {
                newMap[item.mealType] = item.startTime;
            });
            setScheduleMap(newMap);
        }
    }, [currentSchedule]);

    const handleTimeChange = (type: MealType, time: string) => {
        setScheduleMap(prev => ({
            ...prev,
            [type]: time
        }));
    };

    const handleSave = () => {
        const config: MealScheduleConfig[] = Object.entries(scheduleMap).map(([type, time]) => ({
            mealType: type as MealType,
            startTime: time as string
        }));
        onSave(config);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-brand-surface dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md relative border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                    <div>
                        <h3 className="text-xl font-bold text-brand-primary dark:text-blue-400">Personalizar Horarios</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Define la hora de inicio habitual para cada comida.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content List */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {ORDERED_MEALS.map((mealType) => {
                        const details = MEAL_DETAILS[mealType];
                        return (
                            <div key={mealType} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${details.color}`}>
                                        <details.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                        {details.label}
                                    </span>
                                </div>
                                <input 
                                    type="time" 
                                    value={scheduleMap[mealType]} 
                                    onChange={(e) => handleTimeChange(mealType, e.target.value)}
                                    className="p-1.5 border border-slate-300 dark:border-slate-500 rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-lg bg-brand-secondary hover:bg-green-600 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        Guardar Horarios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealScheduleModal;
