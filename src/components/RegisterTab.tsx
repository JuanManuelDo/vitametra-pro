import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Activity, 
  Target, 
  User, 
  ArrowRight,
  Lock,
  Waves // Cambiado por Wave para representar el "Flow"
} from 'lucide-react';
import Spinner from './ui/Spinner';
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

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);
        
        try {
            const newUser = await apiService.register(formData.email, formData.password);
            
            const userProfile: Partial<UserData> = {
                firstName: formData.firstName,
                clinicalConfig: {
                    diabetesType: formData.diabetesType,
                    insulinToCarbRatio: Number(formData.ratio),
                    insulinSensitivityFactor: Number(formData.isf),
                    targetGlucose: Number(formData.targetGlucose),
                    glucoseRanges: { targetMin: 70, targetMax: 160, veryHigh: 250, veryLow: 54 },
                    mealSchedule: []
                } as any,
                userRegion: formData.country,
                subscription_tier: 'BASE',
                createdAt: new Date().toISOString()
            };

            await apiService.updateHistoryEntry(newUser.user.uid, userProfile as any);
            if (onLoginSuccess) onLoginSuccess(userProfile as any);
            navigate('/');
        } catch (error: any) {
            setErrorMsg("Error en la sincronización del flujo. Intenta de nuevo.");
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
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6">
                                <Waves className="text-blue-600" size={32} />
                            </div>
                            <h1 className="text-4xl font-[1000] tracking-tighter italic uppercase">Inicia tu <span className="text-blue-600">VitaFlow</span></h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Personalización de Ecosistema</p>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-white space-y-5">
                            <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" placeholder="Tu Nombre" />
                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" placeholder="Email" />
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all" placeholder="Contraseña" />
                            <button onClick={nextStep} className="w-full bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3">
                                Siguiente paso <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-white">
                                <Activity size={32} />
                            </div>
                            <h2 className="text-3xl font-[1000] tracking-tighter italic uppercase text-slate-800">Calibración <span className="text-blue-600">Clínica</span></h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 text-center">Optimización del motor VitaFlow</p>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-white space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <select value={formData.diabetesType} onChange={e => setFormData({...formData, diabetesType: e.target.value as any})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none">
                                    <option value="Type 1">Tipo 1</option>
                                    <option value="Type 2">Tipo 2</option>
                                    <option value="LADA">LADA</option>
                                </select>
                                <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none">
                                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest text-center">Ratio Insulina/Carbos (1U : {formData.ratio}g)</label>
                                <input type="range" min="1" max="50" value={formData.ratio} onChange={e => setFormData({...formData, ratio: parseInt(e.target.value)})} className="w-full accent-blue-600" />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={prevStep} className="p-6 bg-slate-100 rounded-[2rem] text-slate-400 font-black"><ChevronLeft size={20}/></button>
                                <button onClick={nextStep} className="flex-1 bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest">Configurar Meta</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 text-white">
                                <Target size={32} />
                            </div>
                            <h2 className="text-3xl font-[1000] tracking-tighter italic uppercase text-slate-800">Zona de <span className="text-emerald-500">Flow</span></h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Objetivo glucémico inteligente</p>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-white space-y-6">
                            <div className="p-6 bg-slate-50 rounded-[2rem] text-center border border-dashed border-slate-200">
                                <input type="number" value={formData.targetGlucose} onChange={e => setFormData({...formData, targetGlucose: parseInt(e.target.value)})} className="w-full bg-transparent text-center text-5xl font-[1000] text-blue-600 outline-none" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">mg/dL Objetivo</span>
                            </div>
                            <button onClick={handleFinalRegister} disabled={isSubmitting} className="w-full bg-blue-600 text-white p-6 rounded-[2rem] font-[1000] uppercase text-[12px] tracking-widest shadow-xl shadow-blue-200">
                                {isSubmitting ? <Spinner /> : "Activar mi VitaFlow"}
                            </button>
                            <button onClick={prevStep} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">Volver</button>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-300">
                        <Lock size={12} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Protocolo de Seguridad VitaFlow Activo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterTab;