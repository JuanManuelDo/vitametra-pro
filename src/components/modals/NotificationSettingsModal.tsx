
import React, { useState } from 'react';
import type { NotificationPreferences } from '../../types';
import { XMarkIcon, BellIcon, ClockIcon, CheckCircleIcon } from '../ui/Icons';

interface NotificationSettingsModalProps {
    currentPreferences?: NotificationPreferences;
    onClose: () => void;
    onSave: (prefs: NotificationPreferences) => void;
}

const DEFAULT_PREFS: NotificationPreferences = {
    inactivityAlert: true,
    mealReminders: false,
    postPrandialReminders: false,
    customTimes: {
        breakfast: "08:00",
        lunch: "13:00",
        dinner: "20:00"
    }
};

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ currentPreferences, onClose, onSave }) => {
    const [prefs, setPrefs] = useState<NotificationPreferences>(currentPreferences || DEFAULT_PREFS);

    const handleToggle = (key: keyof NotificationPreferences) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key as keyof NotificationPreferences] }));
    };

    const handleTimeChange = (meal: 'breakfast' | 'lunch' | 'dinner', value: string) => {
        setPrefs(prev => ({
            ...prev,
            customTimes: {
                ...prev.customTimes,
                [meal]: value
            }
        }));
    };

    const handleSave = () => {
        onSave(prefs);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-brand-surface dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <BellIcon className="w-5 h-5 text-brand-primary" />
                            Gestionar Recordatorios
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Mientras más datos registres, más precisas serán tus estadísticas.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* 1. Meal Reminders */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200">Recordatorios de Comidas</h4>
                                <p className="text-xs text-slate-500">Te avisaremos si olvidas registrar.</p>
                            </div>
                            <button 
                                onClick={() => handleToggle('mealReminders')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${prefs.mealReminders ? 'bg-brand-secondary' : 'bg-slate-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${prefs.mealReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {/* Time Pickers (Conditional) */}
                        {prefs.mealReminders && (
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-3 border border-slate-100 dark:border-slate-600 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Desayuno</span>
                                    <input 
                                        type="time" 
                                        value={prefs.customTimes.breakfast}
                                        onChange={(e) => handleTimeChange('breakfast', e.target.value)}
                                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Almuerzo</span>
                                    <input 
                                        type="time" 
                                        value={prefs.customTimes.lunch}
                                        onChange={(e) => handleTimeChange('lunch', e.target.value)}
                                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Cena</span>
                                    <input 
                                        type="time" 
                                        value={prefs.customTimes.dinner}
                                        onChange={(e) => handleTimeChange('dinner', e.target.value)}
                                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* 2. Inactivity Alert */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Alerta de Inactividad</h4>
                            <p className="text-xs text-slate-500">Notificar si pasan 24h sin registros.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('inactivityAlert')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${prefs.inactivityAlert ? 'bg-brand-secondary' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${prefs.inactivityAlert ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* 3. Post Prandial */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Recordatorio Post-Prandial</h4>
                            <p className="text-xs text-slate-500">Aviso 2 horas después de comer.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('postPrandialReminders')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${prefs.postPrandialReminders ? 'bg-brand-secondary' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${prefs.postPrandialReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                    <button 
                        onClick={handleSave}
                        className="w-full py-3 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        Guardar Preferencias
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
