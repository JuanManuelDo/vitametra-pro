import React, { useState } from 'react';
import { ChevronLeft, Activity, Target, ArrowRight, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTACIONES
import Spinner from '../ui/Spinner';
import StepNavigation from './StepNavigation';
import { apiService } from '../../services/infrastructure/apiService';
import type { UserData, DiabetesType } from '../../types';

interface RegisterTabProps {
    onLoginSuccess?: (user: UserData) => void;
}

const RegisterTab: React.FC<RegisterTabProps> = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        diabetesType: 'Type 1' as DiabetesType,
        country: 'Chile',
        ratio: 12,
        isf: 50,
        targetGlucose: 100
    });

    const nextStep = () => {
        if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.password)) {
            setErrorMsg("Completa todos los campos de identidad.");
            return;
        }
        if (step === 1 && formData.password.length < 6) {
            setErrorMsg("La contraseña debe ser más robusta (mín. 6 caracteres).");
            return;
        }
        setErrorMsg(null);
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);
        
        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            const userCredential = await apiService.register(formData.email, formData.password);
            const uid = userCredential.user.uid;

            const completeProfile: UserData = {
                id: uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: fullName, 
                email: formData.email.toLowerCase().trim(),
                role: 'USER',
                subscription_tier: 'BASE',
                ia_credits: 3,
                daily_ia_usage: 0,
                streak: 0,
                createdAt: new Date().toISOString(),
                insulinRatioSchedule: [
                    { startTime: "08:00", ratio: Number(formData.ratio) }
                ],
                clinicalConfig: {
                    diabetesType: formData.diabetesType,
                    insulinSensitivityFactor: Number(formData.isf),
                    targetGlucose: Number(formData.targetGlucose)
                },
                memory: {
                    patterns: { highGlucoseTriggers: [], effectiveCorrections: [], notableEvents: [] },
                    preferences: { dietaryRestrictions: [], favoriteSafeFoods: [] },
                    aiNotes: `Protocolo Bio-Vitametra activado para ${formData.firstName}.`
                }
            };

            await apiService.updateUser(completeProfile);
            if (onLoginSuccess) onLoginSuccess(completeProfile);
            navigate('/dashboard');

        } catch (error: any) {
            setErrorMsg(error.message || "Error al activar el perfil metabólico.");
            setStep(1);
        } finally {
            setIsSubmitting(false);
        }
    };

    const labels = ["Identidad", "Bio-Configuración", "Metas de Control"];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-900">
            {/* STEP NAVIGATION INTEGRADO */}
            <StepNavigation 
                currentStep={step} 
                totalSteps={3} 
                label={labels[step - 1]} 
            />

            <div className="max-w-xl mx-auto px-6">
                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center animate-in fade-in zoom-in">
                        <AlertCircle className="mr-2" size={14} /> {errorMsg}
                    </div>
                )}

                {/* PASO 1: IDENTIDAD */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 flex items-center justify-center mx-auto mb-6">
                                <User className="text-indigo-600" size={32} />
                            </div>
                            <h1 className="text-4xl font-[1000] tracking-tighter italic uppercase italic">Crea tu <span className="text-indigo-600">Perfil</span></h1>
                        </div>
                        
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    value={formData.firstName} 
                                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-indigo-100 transition-all" 
                                    placeholder="Nombre" 
                                />
                                <input 
                                    value={formData.lastName} 
                                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-indigo-100 transition-all" 
                                    placeholder="Apellido" 
                                />
                            </div>
                            <input 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-indigo-100 transition-all" 
                                placeholder="Email" 
                            />
                            <input 
                                type="password" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-indigo-100 transition-all" 
                                placeholder="Contraseña" 
                            />
                            <button onClick={nextStep} className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                                Siguiente <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 2: BIO-CONFIGURACIÓN */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-white">
                                <Activity size={32} />
                            </div>
                            <h2 className="text-3xl font-[1000] tracking-tighter italic uppercase text-slate-900">Bio-Configuración</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 space-y-8">
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 block mb-3 tracking-widest">Condición Clínica</label>
                                <select value={formData.diabetesType} onChange={e => setFormData({...formData, diabetesType: e.target.value as any})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-none cursor-pointer">
                                    <option value="Type 1">Diabetes Tipo 1</option>
                                    <option value="Type 2">Diabetes Tipo 2</option>
                                    <option value="LADA">LADA / Otros</option>
                                </select>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[2rem]">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ratio Insulina (I:C)</label>
                                    <span className="text-indigo-600 font-black text-sm">1U : {formData.ratio}g</span>
                                </div>
                                <input type="range" min="1" max="40" value={formData.ratio} onChange={e => setFormData({...formData, ratio: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={prevStep} className="p-6 bg-slate-100 rounded-[2rem] text-slate-400 font-black hover:bg-slate-200 transition-colors">
                                    <ChevronLeft size={20}/>
                                </button>
                                <button onClick={nextStep} className="flex-1 bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-transform">
                                    Definir Metas
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3: METAS DE CONTROL */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-white">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-[1000] tracking-tighter italic uppercase text-slate-900">Meta Control</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 space-y-8">
                            <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] text-center border border-indigo-100">
                                <input 
                                    type="number" 
                                    inputMode="numeric"
                                    value={formData.targetGlucose} 
                                    onChange={e => setFormData({...formData, targetGlucose: parseInt(e.target.value)})} 
                                    className="w-full bg-transparent text-center text-7xl font-[1000] text-indigo-600 outline-none italic tracking-tighter" 
                                />
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">mg/dL Objetivo</p>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-center text-[10px] text-slate-400 font-bold italic leading-relaxed px-4">
                                    Al activar VitaFlow, autorizas el procesamiento de biometría mediante algoritmos de salud preventiva.
                                </p>
                                <button 
                                    onClick={handleFinalRegister} 
                                    disabled={isSubmitting} 
                                    className="w-full bg-indigo-600 text-white p-7 rounded-[2.5rem] font-[1000] uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center justify-center active:scale-95"
                                >
                                    {isSubmitting ? <Spinner /> : "Activar Mi Ecosistema"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterTab;