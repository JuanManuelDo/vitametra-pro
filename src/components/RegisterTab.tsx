
import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, UserCircleIcon, XMarkIcon, ShieldCheckIcon, GlobeAltIcon, BloodDropIcon } from './Icons';
import Spinner from './Spinner';
import { apiService } from '../services/apiService';
import type { UserData, DiabetesType } from '../types';
import { useNavigate } from 'react-router-dom';
import { COUNTRY_CODES } from '../constants';

interface RegisterTabProps {
    onLoginSuccess?: (user: UserData) => void;
}

const RegisterTab: React.FC<RegisterTabProps> = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Shark State: All in one view
    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        password: '',
        diabetesType: 'Type 1' as DiabetesType,
        country: 'Chile'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleQuickRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.email || !formData.password) {
            setErrorMsg("Por favor completa todos los campos.");
            return;
        }
        
        setIsSubmitting(true);
        setErrorMsg(null);
        
        try {
            const newUser = await apiService.registerUser({
                firstName: formData.firstName,
                lastName: '',
                email: formData.email,
                password: formData.password,
                clinicalConfig: {
                    diabetesType: formData.diabetesType,
                    insulinToCarbRatio: 10,
                    insulinSensitivityFactor: 50,
                    targetGlucose: 120,
                    glucoseRanges: { targetMin: 70, targetMax: 180, veryHigh: 250, veryLow: 54 },
                    mealSchedule: []
                } as any,
                userRegion: formData.country,
                subscription_tier: 'BASE'
            });

            if (onLoginSuccess) onLoginSuccess(newUser);
            navigate('/');
        } catch (error: any) {
            setErrorMsg("Hubo un pequeño salto en la conexión. Intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in">
             <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="w-8 h-8 text-brand-primary" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Crea tu Perfil Clínico IA</h1>
                <p className="text-slate-500 font-medium mt-1">Únete a los miles que ya simplificaron su diabetes.</p>
             </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-black uppercase text-center animate-fade-in">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleQuickRegister} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu Nombre</label>
                        <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold" placeholder="Ej: Aitana" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold" placeholder="tu@email.com" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold" placeholder="Mínimo 8 caracteres" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo Diabetes</label>
                            <select name="diabetesType" value={formData.diabetesType} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none">
                                <option value="Type 1">Tipo 1</option>
                                <option value="Type 2">Tipo 2</option>
                                <option value="LADA">LADA</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">País</label>
                            <select name="country" value={formData.country} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none">
                                {COUNTRY_CODES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-black text-lg py-5 rounded-[1.5rem] shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-3"
                    >
                        {isSubmitting ? <Spinner /> : <><CheckCircleIcon className="w-6 h-6"/> Empezar Ahora Gratis</>}
                    </button>
                </form>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheckIcon className="w-5 h-5 opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Protección de datos clínicos certificada</p>
                </div>
            </div>
            
            <p className="text-center mt-8 text-slate-400 text-sm">
                ¿Ya tienes una cuenta? <button onClick={() => navigate('/')} className="text-brand-primary font-black hover:underline">Inicia Sesión</button>
            </p>
        </div>
    );
};

export default RegisterTab;
