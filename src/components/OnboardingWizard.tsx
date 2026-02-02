import React, { useState } from 'react';
import type { UserData } from '../types';
import { RobotIcon, BloodDropIcon, GlucometerIcon, ArrowRightIcon } from './Icons';

interface OnboardingWizardProps {
    userFirstName: string;
    onComplete: (data: Partial<UserData>) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userFirstName, onComplete }) => {
    const [step, setStep] = useState(0);

    const handleFinish = (unit: 'mg/dL' | 'mmol/L') => {
        const ranges = unit === 'mg/dL' 
            ? { targetMin: 70, targetMax: 140, veryHigh: 180 }
            : { targetMin: 3.9, targetMax: 7.8, veryHigh: 10.0 };

        onComplete({
            glucoseUnitPreference: unit,
            glucoseRanges: ranges,
            onboardingCompleted: true,
            daily_ia_usage: 0
        });
    };

    if (step === 0) return (
        <div className="flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
                <RobotIcon className="w-10 h-10 text-white -rotate-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">¡Bienvenido, {userFirstName}!</h2>
            <p className="text-slate-500 mb-8 max-w-sm font-medium">Configuraremos tu IA para que hable el mismo idioma que tu glucómetro.</p>
            <button onClick={() => setStep(1)} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3">
                Comenzar <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>
    );

    return (
        <div className="p-8 animate-in slide-in-from-right duration-500">
            <h3 className="text-xl font-black text-slate-800 mb-6 text-center">¿Qué unidad prefieres?</h3>
            <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleFinish('mg/dL')} className="p-6 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-white"><BloodDropIcon className="w-6 h-6 text-blue-600" /></div>
                        <span className="font-black text-slate-700">mg/dL</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estándar (América)</span>
                </button>
                <button onClick={() => handleFinish('mmol/L')} className="p-6 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-white"><GlucometerIcon className="w-6 h-6 text-blue-600" /></div>
                        <span className="font-black text-slate-700">mmol/L</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estándar (Europa/Oceanía)</span>
                </button>
            </div>
        </div>
    );
};