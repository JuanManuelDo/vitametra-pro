import React, { useEffect, useState, useRef } from 'react';
import type { UserData } from '../types';
import Spinner from './Spinner';
import { apiService } from '../services/apiService';
import { ShieldCheck, CreditCard } from 'lucide-react';

interface PaymentGatewayProps {
    currentUser: UserData;
    planId?: string;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ currentUser, planId = 'monthly' }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const brickController = useRef<any>(null);

    useEffect(() => {
        if (!(window as any).MercadoPago) {
            setError("Error: SDK de Mercado Pago no cargado.");
            setLoading(false);
            return;
        }

        const mp = new (window as any).MercadoPago('APP_USR-ea2926b9-bc64-408d-92e9-08181a212d7c', { 
            locale: 'es-CL' 
        });
        const bricksBuilder = mp.bricks();

        const renderBrick = async () => {
            if (brickController.current) {
                await brickController.current.unmount();
            }

            const settings = {
                initialization: { 
                    amount: planId === 'monthly' ? 6990 : 18990,
                    payer: {
                        email: 'TESTUSER882522509@testuser.com', 
                    },
                },
                customization: {
                    paymentMethods: {
                        creditCard: "all",
                        debitCard: "all",
                        maxInstallments: 1
                    },
                    visual: {
                        style: { theme: 'bootstrap' }
                    }
                },
                callbacks: {
                    onReady: () => setLoading(false),
                    onSubmit: ({ formData }: any) => {
                        return new Promise((resolve, reject) => {
                            apiService.processMPTransaction(formData, planId, currentUser.id)
                                .then((res) => {
                                    if (res.status === 'approved') {
                                        window.location.href = '/profile?payment=success';
                                    }
                                    resolve(res);
                                })
                                .catch((err) => {
                                    setError("Tarjeta rechazada. Usa 5416 7526...");
                                    reject(err);
                                });
                        });
                    },
                    onError: (err: any) => {
                        console.error("Brick Error:", err);
                        setError("Error en la pasarela.");
                        setLoading(false);
                    },
                },
            };

            try {
                brickController.current = await bricksBuilder.create("payment", "mp-brick-container", settings);
            } catch (e) {
                console.error("Render Error:", e);
            }
        };

        renderBrick();
        return () => { brickController.current?.unmount(); };
    }, [planId, currentUser.id]);

    return (
        <div className="max-w-md mx-auto p-4 py-10 animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-[#007BFF] p-10 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <CreditCard size={32} />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase">Checkout PRO</h2>
                    <p className="text-blue-100 text-[10px] font-bold mt-2 uppercase tracking-widest">Pago Seguro Mercado Pago</p>
                </div>

                <div className="p-6 relative min-h-[400px]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Spinner />
                            <p className="text-[10px] font-black text-slate-400 mt-4 uppercase">Cargando pasarela...</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase text-center mb-6 border border-red-100">
                            {error}
                        </div>
                    )}
                    <div id="mp-brick-container" />
                </div>

                <div className="p-6 bg-slate-50 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" /> 
                        Tus datos están protegidos y encriptados
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;