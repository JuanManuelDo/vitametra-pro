import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Sparkles, X, ShieldCheck, Check, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

// Importaciones para el sistema de correos
import { getWelcomeEmailTemplate } from '../utils/emailTemplates';
import { db } from '../services/firebaseService'; 
import { collection, addDoc } from 'firebase/firestore';

declare global {
    interface Window {
        MercadoPago: any;
    }
}

const PLANS = [
    { id: 'monthly', title: 'Plan Mensual', priceCLP: 6990, features: ['IA Metabólica (5/sem)', 'Historial Básico'], color: 'slate' },
    { id: 'quarterly', title: 'Plan Trimestral', priceCLP: 18990, features: ['IA Ilimitada', 'Reportes PDF IA', 'HbA1c Proyectada'], isPopular: true, color: 'blue' },
    { id: 'annual', title: 'Vitalicio Anual', priceCLP: 69900, features: ['Todo PRO', 'Vínculo Médico', 'Dashboard Senior'], color: 'slate' }
];

const PlansTab: React.FC<{ currentUser: any, onUpdateUser?: () => void }> = ({ currentUser, onUpdateUser }) => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const brickController = useRef<any>(null);

    useEffect(() => {
        if (!selectedPlan || !window.MercadoPago) return;

        const initBrick = async () => {
            const container = document.getElementById('paymentBrick_container');
            if (container) container.innerHTML = ''; 

            const mp = new window.MercadoPago('APP_USR-ea2926b9-bc64-408d-92e9-08181a212d7c', { 
                locale: 'es-CL' 
            });
            const bricksBuilder = mp.bricks();

            try {
                brickController.current = await bricksBuilder.create('payment', 'paymentBrick_container', {
                    initialization: {
                        amount: selectedPlan.priceCLP,
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
                                theme: 'default',
                                customVariables: {
                                    borderRadiusLarge: '24px',
                                    colorPrimary: '#007BFF',
                                }
                            },
                            hideStatusDetails: true,
                            hidePaymentButton: false
                        }
                    },
                    callbacks: {
                        onReady: () => console.log("VitaMetra Checkout Ready"),
                        onSubmit: async ({ formData }: any) => {
                            setIsProcessing(true);
                            try {
                                const result = await apiService.processMPTransaction(
                                    formData, 
                                    selectedPlan.id, 
                                    currentUser.id
                                );

                                if (result.status === 'approved') {
                                    // --- LÓGICA DE ENVÍO DE CORREO ---
                                    try {
                                        const emailContent = getWelcomeEmailTemplate(
                                            currentUser.firstName, 
                                            selectedPlan.title, 
                                            result.id || 'N/A'
                                        );

                                        await addDoc(collection(db, "mail"), {
                                            to: currentUser.email,
                                            message: {
                                                subject: "⚡️ ¡Acceso Concedido: VitaMetra PRO!",
                                                html: emailContent,
                                            }
                                        });
                                    } catch (mailErr) {
                                        console.error("Error al registrar orden de correo:", mailErr);
                                    }
                                    // --- FIN LÓGICA CORREO ---

                                    await Swal.fire({
                                        title: '¡SUSCRIPCIÓN ACTIVA!',
                                        text: 'Ahora eres miembro PRO de VitaMetra. Revisa tu correo.',
                                        icon: 'success',
                                        confirmButtonColor: '#007BFF',
                                        customClass: { popup: 'rounded-[2.5rem]' }
                                    });
                                    
                                    if (onUpdateUser) onUpdateUser();
                                    navigate('/analyzer');
                                } else {
                                    Swal.fire('Atención', `Estado del pago: ${result.status}`, 'info');
                                }
                            } catch (error: any) {
                                Swal.fire('Error', 'La tarjeta fue rechazada o los datos son inválidos.', 'error');
                            } finally {
                                setIsProcessing(false);
                            }
                        },
                        onError: (error: any) => {
                            console.error("Brick Error:", error);
                            setIsProcessing(false);
                        },
                    },
                });
            } catch (e) {
                console.error("Error Bricks:", e);
            }
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
        <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in">
            {!selectedPlan ? (
                <>
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Planes de Bio-Inteligencia</h1>
                        <div className="w-16 h-1 bg-[#007BFF] mx-auto rounded-full mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Mejora tu control metabólico hoy</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {PLANS.map((plan) => (
                            <div key={plan.id} className={`bg-white rounded-[3rem] p-10 border transition-all flex flex-col relative group ${
                                plan.isPopular ? 'border-[#007BFF] shadow-2xl scale-105 z-10' : 'border-slate-100 hover:border-blue-100'
                            }`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-10 bg-[#007BFF] text-white px-4 py-1.5 rounded-b-2xl text-[9px] font-black uppercase tracking-widest">
                                        Recomendado
                                    </div>
                                )}
                                
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{plan.title}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-slate-900">${plan.priceCLP.toLocaleString('es-CL')}</span>
                                    <span className="text-slate-300 font-bold text-xs">CLP</span>
                                </div>

                                <ul className="space-y-4 mb-10 flex-grow">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                            <div className={`p-1 rounded-full ${plan.isPopular ? 'bg-blue-50 text-[#007BFF]' : 'bg-slate-50 text-slate-400'}`}>
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => setSelectedPlan(plan)} 
                                    className={`w-full py-5 rounded-2xl font-black transition-all uppercase text-[10px] tracking-[0.2em] shadow-lg ${
                                        plan.isPopular 
                                        ? 'bg-[#007BFF] text-white shadow-blue-500/20 hover:bg-blue-600' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                >
                                    Seleccionar Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="max-w-md mx-auto animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl relative border border-slate-100 overflow-hidden">
                        {isProcessing && (
                            <div className="absolute inset-0 z-[60] bg-white/95 flex flex-col items-center justify-center backdrop-blur-md">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-[#007BFF] rounded-full animate-spin mb-4" />
                                <p className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em]">Cifrando Pago Seguro...</p>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pago Seguro</p>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Suscripción</h2>
                            </div>
                            <button 
                                onClick={() => setSelectedPlan(null)} 
                                className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-5 mb-8 flex justify-between items-center border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-[#007BFF]">
                                    <Sparkles size={20} />
                                </div>
                                <span className="font-black text-slate-700 uppercase text-xs">{selectedPlan.title}</span>
                            </div>
                            <span className="font-black text-slate-900">${selectedPlan.priceCLP.toLocaleString('es-CL')}</span>
                        </div>
                        
                        <div id="paymentBrick_container" className="min-h-[300px]"></div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-300">
                                <ShieldCheck size={16} />
                                <span className="text-[9px] font-black uppercase tracking-widest">SSL Secure Checkout</span>
                            </div>
                            <div className="flex items-center gap-4 opacity-40 grayscale">
                                <img src="https://logospng.org/wp-content/uploads/mercado-pago.png" className="h-4" alt="MP" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlansTab;