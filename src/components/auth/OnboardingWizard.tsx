import React, { useState } from 'react'
import type { UserData } from '../types'
import StepNavigation from './ui/StepNavigation'
import ActivityLevelSelector from './auth/ActivityLevelSelector'
import { 
  ArrowRight, 
  ChevronLeft, 
  ShieldCheck, 
  Droplets, 
  Activity, 
  Zap 
} from 'lucide-react'

interface OnboardingWizardProps {
    userFirstName: string;
    onComplete: (data: Partial<UserData>) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userFirstName, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        activityLevel: '
        glucoseUnitPreference: 'mg/dL' as 'mg/dL' | 'mmol/L'
    });

    const totalSteps = 3;
    const stepLabels = ["Bienvenida", "Nivel Metabólico", "Unidades de Control"];

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(s => s + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleFinish = () => {
        const unit = formData.glucoseUnitPreference;
        const ranges = unit === 'mg/dL' 
            ? { targetMin: 70, targetMax: 140, veryHigh: 180 }
            : { targetMin: 3.9, targetMax: 7.8, veryHigh: 10.0 };

        onComplete({
            glucoseUnitPreference: unit,
            glucoseRanges: ranges,
            activityLevel: formData.activityLevel,
            onboardingCompleted: true,
            daily_ia_usage: 0
        });
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col font-sans">
            {/* COMPONENTE DE NAVEGACIÓN PRO */}
            <StepNavigation 
                currentStep={step} 
                totalSteps={totalSteps} 
                label={stepLabels[step - 1]} 
            />

            <main className="flex-1 px-6 py-4 flex flex-col items-center justify-center overflow-y-auto">
                
                {/* PASO 1: BIENVENIDA */}
                {step === 1 && (
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-sm">
                        <div className="relative mx-auto w-28 h-28 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center border border-slate-100">
                            <div className="absolute inset-0 bg-metra-blue/5 rounded-[2.5rem] animate-pulse" />
                            <ShieldCheck size={48} className="text-metra-blue relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-[1000] tracking-tighter text-metra-dark italic uppercase leading-none mb-4">
                                Hola, <br/> <span className="text-metra-blue">{userFirstName}</span>
                            </h2>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed">
                                Vamos a sincronizar tu perfil con el <span className="text-metra-dark">Bio-Core Engine</span> para personalizar tus predicciones.
                            </p>
                        </div>
                    </div>
                )}

                {/* PASO 2: NIVEL DE ACTIVIDAD (CRONOMETER STYLE) */}
                {step === 2 && (
                    <div className="w-full animate-in slide-in-from-right duration-500">
                        <ActivityLevelSelector 
                            selectedId={formData.activityLevel}
                            onSelect={(id) => setFormData({...formData, activityLevel: id})}
                        />
                    </div>
                )}

                {/* PASO 3: PREFERENCIA DE UNIDADES */}
                {step === 3 && (
                    <div className="w-full max-w-md space-y-4 animate-in slide-in-from-right duration-500">
                        <div className="text-center mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Configuración Clínica</p>
                            <h3 className="text-xl font-black text-metra-dark uppercase tracking-tight italic">¿Qué unidades usas?</h3>
                        </div>

                        <button 
                            onClick={() => setFormData({...formData, glucoseUnitPreference: 'mg/dL'})}
                            className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                                formData.glucoseUnitPreference === 'mg/dL' 
                                ? 'bg-metra-blue border-metra-blue text-white shadow-lg shadow-metra-blue/20' 
                                : 'bg-white border-slate-100 text-metra-dark'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${formData.glucoseUnitPreference === 'mg/dL' ? 'bg-white/20' : 'bg-slate-50 text-metra-blue'}`}>
                                    <Droplets size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase tracking-widest">mg/dL</p>
                                    <p className={`text-[9px] font-bold ${formData.glucoseUnitPreference === 'mg/dL' ? 'text-white/60' : 'text-slate-400'}`}>ESTÁNDAR AMÉRICA</p>
                                </div>
                            </div>
                        </button>

                        <button 
                            onClick={() => setFormData({...formData, glucoseUnitPreference: 'mmol/L'})}
                            className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                                formData.glucoseUnitPreference === 'mmol/L' 
                                ? 'bg-metra-blue border-metra-blue text-white shadow-lg shadow-metra-blue/20' 
                                : 'bg-white border-slate-100 text-metra-dark'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${formData.glucoseUnitPreference === 'mmol/L' ? 'bg-white/20' : 'bg-slate-50 text-metra-blue'}`}>
                                    <Zap size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase tracking-widest">mmol/L</p>
                                    <p className={`text-[9px] font-bold ${formData.glucoseUnitPreference === 'mmol/L' ? 'text-white/60' : 'text-slate-400'}`}>ESTÁNDAR EUROPA</p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}
            </main>

            {/* FOOTER DE NAVEGACIÓN (APPLE STYLE) */}
            <footer className="p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex gap-4">
                {step > 1 && (
                    <button 
                        onClick={handleBack} 
                        className="p-6 rounded-3xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all active:scale-90"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    disabled={step === 2 && !formData.activityLevel}
                    className="flex-1 bg-metra-dark text-white p-6 rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                >
                    {step === totalSteps ? 'Finalizar Calibración' : 'Continuar'} 
                    <ArrowRight size={18} />
                </button>
            </footer>
        </div>
    );
};

export default OnboardingWizard;