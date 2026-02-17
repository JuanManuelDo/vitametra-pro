import React, { useState } from 'react';
import { Sparkles, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
// RUTA CORREGIDA
import { apiService } from '../services/infrastructure/apiService';
import type { UserData } from '../types';

interface PricingTabProps {
    currentUser: UserData;
}

const PricingTab: React.FC<PricingTabProps> = ({ currentUser }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (tier: 'BASE' | 'PRO') => {
        if (tier === 'PRO') {
            setIsSubmitting(true);
            try {
                // Llama al método de Stripe/MercadoPago en apiService
                const res = await apiService.createStripeCheckoutSession('price_premium_monthly');
                if (res.url && res.url !== '#') {
                    window.location.href = res.url;
                } else {
                    alert('Redirigiendo a pasarela de pago segura...');
                }
            } catch (error) {
                alert('Error al conectar con el servicio de pagos.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="p-4 space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter">Planes de Bio-Escala</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lleva tu control al nivel PRO</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Plan Free */}
                <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 relative">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-6 shadow-sm">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic">Plan Base</h3>
                    <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-tight italic">Control manual esencial</p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><CheckCircle2 size={16} className="text-emerald-500"/> 3 Análisis diarios</li>
                        <li className="flex items-center gap-3 text-xs font-bold text-slate-600"><CheckCircle2 size={16} className="text-emerald-500"/> Registro histórico</li>
                    </ul>
                    <button disabled className="w-full py-4 bg-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Plan Actual</button>
                </div>

                {/* Plan PRO */}
                <div className="bg-white border-2 border-blue-600 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Popular</span>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Vitametra PRO</h3>
                    <p className="text-xs font-bold text-blue-600 mb-6 uppercase tracking-tight italic">Análisis IA Ilimitado</p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-xs font-bold text-slate-700"><CheckCircle2 size={16} className="text-blue-500"/> Reportes Médicos PRO</li>
                        <li className="flex items-center gap-3 text-xs font-bold text-slate-700"><CheckCircle2 size={16} className="text-blue-500"/> Sincronización con sensores</li>
                        <li className="flex items-center gap-3 text-xs font-bold text-slate-700"><CheckCircle2 size={16} className="text-blue-500"/> Predicciones Metabólicas</li>
                    </ul>
                    <button 
                        onClick={() => handleSubscribe('PRO')}
                        disabled={isSubmitting || currentUser.subscription_tier === 'PRO'}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-95"
                    >
                        {isSubmitting ? 'Cargando...' : currentUser.subscription_tier === 'PRO' ? 'Plan Actual' : 'Mejorar a PRO'}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Pagos cifrados por SSL</span>
            </div>
        </div>
    );
};

export default PricingTab;