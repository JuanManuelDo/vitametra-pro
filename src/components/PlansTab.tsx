import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, ShieldCheck, Check, Zap, Star, Globe, Crown, ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getWelcomeEmailTemplate } from '../utils/emailTemplates'
import { db } from '../services/firebaseService'
import { collection, addDoc } from 'firebase/firestore'

declare global {
    interface Window {
        MercadoPago: any;
    }
}

// ESTRATEGIA DE PRECIOS OPTIMIZADA (CLP)
const PLANS = [
    { 
        id: 'monthly', 
        title: 'Starter', 
        priceCLP: "6.990", 
        rawPrice: 6990,
        features: ['30 Análisis IA / mes', 'Reportes básicos', 'IA Predictiva estándar'], 
        icon: <Zap size={24} />,
        color: 'blue' 
    },
    { 
        id: 'quarterly', 
        title: 'PRO', 
        priceCLP: "16.990", // Bajado de 18.990 para incentivar el ahorro trimestral
        rawPrice: 16990,
        features: ['IA Ilimitada 24/7', 'Reportes PDF Clínicos', 'HbA1c Proyectada', 'Prioridad de Procesamiento'], 
        isPopular: true, 
        badge: 'Mejor Valor',
        icon: <Star size={24} />,
        color: 'blue' 
    },
    { 
        id: 'annual', 
        title: 'GLOBAL', 
        priceCLP: "59.900", // Bajado de 69.900 (2 meses gratis aprox.)
        rawPrice: 59900,
        features: ['Acceso Total Pro', 'Vínculo Médico Directo', 'Dashboard Senior Pro', 'Soporte 1:1'], 
        icon: <Globe size={24} />,
        badge: 'Ahorra 30%',
        color: 'emerald' 
    }
];

const PlansTab: React.FC<{ currentUser: any, onUpdateUser?: (user: any) => void }> = ({ currentUser, onUpdateUser }) => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const brickController = useRef<any>(null);

    useEffect(() => {
        if (!selectedPlan || !window.MercadoPago) return;

        const initBrick = async () => {
            const container = document.getElementById('paymentBrick_container');
            if (container) container.innerHTML = ''; 

            const mp = new window.MercadoPago('APP_USR-5085620590656834-010519-75f9c2645782ba627abd3c72de22fe8a-3113708019', { 
                locale: 'es-CL' 
            });
            const bricksBuilder = mp.bricks();

            try {
                brickController.current = await bricksBuilder.create('payment', 'paymentBrick_container', {
                    initialization: {
                        amount: selectedPlan.rawPrice,
                        payer: { email: currentUser?.email || '' },
                    },
                    customization: {
                        paymentMethods: {
                            creditCard: 'all',
                            debitCard: 'all',
                            googlePay: 'off',
                            applePay: 'off',
                        },
                        visual: {
                            style: { 
                                theme: 'flat',
                                customVariables: {
                                    borderRadiusLarge: '32px',
                                    colorPrimary: '#2563eb',
                                }
                            },
                        }
                    },
                    callbacks: {
                        onSubmit: async ({ formData }: any) => {
                            setIsProcessing(true);
                            try {
                                const functions = getFunctions();
                                const processPayment = httpsCallable(functions, 'processPayment');

                                const response: any = await processPayment({
                                    token: formData.token,
                                    issuer_id: formData.issuer_id,
                                    payment_method_id: formData.payment_method_id,
                                    installments: formData.installments,
                                    planId: selectedPlan.id
                                });

                                const result = response.data;

                                if (result.status === 'approved') {
                                    try {
                                        const emailContent = getWelcomeEmailTemplate(
                                            currentUser.firstName || 'Usuario', 
                                            selectedPlan.title, 
                                            result.id || 'N/A'
                                        );
                                        await addDoc(collection(db, "mail"), {
                                            to: currentUser.email,
                                            message: { subject: "⚡️ ¡Acceso Concedido: VitaMetra PRO!", html: emailContent }
                                        });
                                    } catch (e) {}

                                    await Swal.fire({
                                        title: '¡SINCRO EXITOSA!',
                                        text: 'Tu Bio-Core ha sido actualizado a PRO.',
                                        icon: 'success',
                                        confirmButtonColor: '#2563eb',
                                        customClass: { popup: 'rounded-[3rem]' }
                                    });
                                    
                                    if (onUpdateUser) onUpdateUser({ ...currentUser, subscription_tier: 'PRO' });
                                    navigate('/analyzer');
                                } else {
                                    Swal.fire('Atención', `Estado: ${result.status}`, 'info');
                                }
                            } catch (error) {
                                Swal.fire('Error', 'Problema con la transacción.', 'error');
                            } finally {
                                setIsProcessing(false);
                            }
                        },
                        onError: (error: any) => console.error(error),
                    },
                });
            } catch (e) { console.error(e); }
        };
        initBrick();

        return () => {
            if (brickController.current) {
                brickController.current.unmount();
                brickController.current = null;
            }
        };
    }, [selectedPlan, currentUser, navigate, onUpdateUser]);

    return (
        <div className="min-h-screen bg-[#FBFBFE] pb-20">
            {/* HEADER */}
            <header className="pt-20 pb-12 px-6 text-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-6">
                    <Sparkles size={14} className="text-blue-600" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Membresías Elite 2026</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-[0.85] mb-6">
                    Libertad <br/><span className="text-blue-600">Metabólica.</span>
                </h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">IA de grado clínico para tu control</p>
            </header>

            {/* GRID DE PLANES */}
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <motion.div 
                        key={plan.id} 
                        whileHover={{ y: -10 }}
                        className={`relative p-10 rounded-[3.5rem] bg-white border transition-all duration-500 ${
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
                                    <div className={`mt-0.5 p-0.5 rounded-full bg-blue-50 text-blue-600`}>
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => setSelectedPlan(plan)}
                            className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                plan.color === 'emerald' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                            }`}
                        >
                            Seleccionar <ArrowRight size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* MODAL DE PAGO (BRICKS) */}
            <AnimatePresence>
                {selectedPlan && (
                    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" 
                            onClick={() => setSelectedPlan(null)} 
                        />
                        <motion.div 
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="relative w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl overflow-hidden"
                        >
                            {isProcessing && (
                                <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Cifrando Pago Seguro...</p>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 italic">Vitametra Secure Checkout</p>
                                    <h2 className="text-2xl font-[1000] text-slate-900 uppercase tracking-tighter italic">Finalizar Pago</h2>
                                </div>
                                <button onClick={() => setSelectedPlan(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                                        {selectedPlan.icon}
                                    </div>
                                    <span className="font-black text-slate-700 uppercase text-xs italic">{selectedPlan.title}</span>
                                </div>
                                <span className="font-black text-slate-900 text-lg italic">${selectedPlan.priceCLP}</span>
                            </div>
                            
                            <div id="paymentBrick_container" className="min-h-[350px]"></div>
                            
                            <div className="mt-8 flex flex-col items-center gap-4 border-t border-slate-50 pt-8">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <ShieldCheck size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Encriptación Grado Médico AES-256</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlansTab;