import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Target, 
  ArrowRight,
  Lock,
  Waves
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { apiService } from '../services/apiService';
import type { UserData, DiabetesType } from '../types';
import { useNavigate } from 'react-router-dom';
import { COUNTRY_CODES } from '../constants';

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
        email: '',
        password: '',
        diabetesType: 'Type 1' as DiabetesType,
        country: 'Chile',
        ratio: 10,
        isf: 50,
        targetGlucose: 110
    });

    const nextStep = () => {
        if (step === 1 && (!formData.firstName || !formData.email || !formData.password)) {
            setErrorMsg("Completa los datos de acceso.");
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
            const userCredential = await apiService.register(
                formData.email, 
                formData.password, 
                formData.firstName
            );
            
            const uid = userCredential.user.uid;

            const completeProfile: UserData = {
                id: uid,
                firstName: formData.firstName,
                lastName: "",
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
                    aiNotes: "Protocolo VitaFlow activado. Esperando primeros datos."
                }
            };

            await apiService.updateUser(completeProfile);
            if (onLoginSuccess) onLoginSuccess(completeProfile);
            setTimeout(() => navigate('/dashboard'), 500);

        } catch (error: any) {
            setErrorMsg(error.message || "Error al activar el perfil.");
            setStep(1);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] px-6 py-12 font-sans antialiased text-slate-900">
            <div className="max-w-md mx-auto mb-10 flex gap-2 justify-center">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 w-16 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
                ))}
            </div>

            <div className="max-w-xl mx-auto">
                {errorMsg && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center animate-bounce">
                        {errorMsg}
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6">
                                <Waves className="text-blue-600" size={32} />
                            </div>
                            <h1 className="text-4xl font-[1000] tracking-tighter italic uppercase">Vita<span className="text-blue-600">Flow</span></h1>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl space-y-5">
                            <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none" placeholder="Tu Nombre" />
                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none" placeholder="Email" />
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none" placeholder="Contraseña" />
                            <button onClick={nextStep} className="w-full bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3">
                                Siguiente <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-white">
                                <Activity size={32} />
                            </div>
                            <h2 className="text-3xl font-[1000] tracking-tighter italic uppercase">Calibración</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl space-y-6">
                            <select value={formData.diabetesType} onChange={e => setFormData({...formData, diabetesType: e.target.value as any})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs">
                                <option value="Type 1">Tipo 1</option>
                                <option value="Type 2">Tipo 2</option>
                                <option value="LADA">LADA</option>
                            </select>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 text-center tracking-widest">Ratio Insulina (1U : {formData.ratio}g Carbos)</label>
                                <input type="range" min="1" max="40" value={formData.ratio} onChange={e => setFormData({...formData, ratio: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={prevStep} className="p-6 bg-slate-100 rounded-[2rem] text-slate-400 font-black"><ChevronLeft size={20}/></button>
                                <button onClick={nextStep} className="flex-1 bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest">Configurar Meta</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-white">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-[1000] tracking-tighter italic uppercase">Meta</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl space-y-6">
                            <div className="p-6 bg-slate-50 rounded-[2rem] text-center">
                                <input type="number" value={formData.targetGlucose} onChange={e => setFormData({...formData, targetGlucose: parseInt(e.target.value)})} className="w-full bg-transparent text-center text-5xl font-[1000] text-blue-600 outline-none" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">mg/dL Objetivo</span>
                            </div>
                            <button onClick={handleFinalRegister} disabled={isSubmitting} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-[1000] uppercase text-[12px] tracking-widest shadow-xl shadow-blue-200">
                                {isSubmitting ? <Spinner /> : "Activar mi VitaFlow"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterTab;