import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Check, Zap, Star, Globe, Crown, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

// RUTA CORREGIDA: Apuntando a la nueva carpeta de pagos
import PaymentComponent from './payments/PaymentComponent'
import type { UserData } from '../types'

const PLANS = [
    { 
        id: 'monthly', 
        title: 'Starter', 
        priceCLP: "7.990", 
        rawPrice: 7990,
        features: ['30 Análisis de comidas con IA', 'Sincronización de glucosa', 'Soporte clínico estándar'], 
        icon: <Zap size={24} />,
        color: 'blue' 
    },
    { 
        id: 'quarterly', 
        title: 'Pro', 
        priceCLP: "19.990", 
        rawPrice: 19990,
        features: ['IA Ilimitada 24/7', 'Reportes PDF para tu médico', 'Proyección de HbA1c', 'Ahorra 15%'], 
        isPopular: true, 
        badge: 'Más Popular',
        icon: <Star size={24} />,
        color: 'blue' 
    },
    { 
        id: 'annual', 
        title: 'Global', 
        priceCLP: "69.900", 
        rawPrice: 69900,
        features: ['Acceso Total Ilimitado', 'Dashboard Pro avanzado', 'Soporte prioritario 1:1', 'Ahorra 25%'], 
        icon: <Globe size={24} />,
        badge: 'Mejor Valor',
        color: 'emerald' 
    }
];

interface PlansTabProps {
    currentUser: UserData | null;
    onUpdateUser?: (user: any) => void;
}

const PlansTab: React.FC<PlansTabProps> = ({ currentUser, onUpdateUser }) => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    return (
        <div className="min-h-screen bg-[#FBFBFE] pb-20">
            <header className="pt-20 pb-12 px-6 text-center">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-6"
                >
                    <Sparkles size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Protocolos de Precisión 2026</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-[0.85] mb-6">
                    Elige tu <br/><span className="text-blue-600">Plan.</span>
                </h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">IA para el control de tu salud</p>
            </header>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <motion.div 
                        key={plan.id} 
                        whileHover={{ y: -10 }}
                        className={`relative p-10 rounded-[3.5rem] bg-white border transition-all duration-500 flex flex-col ${
                            plan.isPopular ? 'border-blue-600 shadow-2xl shadow-blue-100 ring-4 ring-blue-50' : 'border-slate-100 shadow-sm'
                        }`}
                    >
                        {(plan.isPopular || plan.badge) && (
                            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-white px-8 py-2 rounded-full flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl ${plan.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                                {plan.isPopular ? <Crown size={14} /> : <Sparkles size={14} />}
                                {plan.badge || 'Recomendado'}
                            </div>
                        )}
                        
                        <div className={`mb-8 w-16 h-16 rounded-2xl flex items-center justify-center ${plan.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {plan.icon}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vitametra {plan.title}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-[1000] tracking-tighter text-slate-900 italic">${plan.priceCLP}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase italic">/ {plan.id === 'annual' ? 'año' : plan.id === 'quarterly' ? 'tri' : 'mes'}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-12 flex-grow">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-500 leading-tight">
                                    <div className="mt-0.5 p-0.5 rounded-full bg-blue-50 text-blue-600">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => setSelectedPlan(plan)}
                            className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                plan.color === 'emerald' ? 'bg-slate-900 text-white shadow-xl' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                            }`}
                        >
                            Ver planes <ArrowRight size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {selectedPlan && (
                <PaymentComponent 
                    planId={selectedPlan.id}
                    amount={selectedPlan.rawPrice}
                    currentUser={currentUser}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => {
                        if (onUpdateUser && currentUser) onUpdateUser({ ...currentUser, subscription_tier: 'PRO' });
                        navigate('/payment-success');
                    }}
                />
            )}
        </div>
    );
};

export default PlansTab;