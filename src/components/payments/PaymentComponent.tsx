import React, { useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

// 1. Cargamos la Public Key desde el .env
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

export interface PaymentComponentProps {
  planId: string;
  amount: number;
  currentUser: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ 
  planId, 
  amount, 
  currentUser, 
  onClose, 
  onSuccess 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. Lógica de URL Dinámica
  const isProd = import.meta.env.PROD; 
  const BASE_URL = isProd 
    ? import.meta.env.VITE_API_URL_PROD 
    : import.meta.env.VITE_API_URL_DEV;

  const API_URL = `${BASE_URL}/processPayment`;

  const onSubmit = async ({ formData }: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.token,
          issuer_id: formData.issuer_id,
          payment_method_id: formData.payment_method_id,
          installments: formData.installments,
          planId: planId,
          amount: amount,
          userId: currentUser?.uid || currentUser?.id,
          email: currentUser?.email
        }),
      });

      const result = await response.json();

      if (result.success && result.status === 'approved') {
        onSuccess();
      } else {
        Swal.fire({
          title: 'Pago no aprobado',
          text: result.error || 'Verifica los datos de tu tarjeta e intenta nuevamente.',
          icon: 'warning',
          confirmButtonColor: '#2563eb',
          customClass: { popup: 'rounded-[2.5rem]' }
        });
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      Swal.fire({
        title: 'Error de Conexión',
        text: 'No pudimos contactar con el servidor de pagos.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
        customClass: { popup: 'rounded-[2.5rem]' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden">
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Validando Pago...</p>
          </div>
        )}

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 z-10">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-[1000] text-slate-900 uppercase italic leading-none">Checkout Seguro</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
            Plan {planId} — ${amount.toLocaleString('es-CL')} CLP
          </p>
        </div>

        <div className="min-h-[350px]">
          <Payment
            initialization={{ amount }}
            customization={{
              visual: { 
                theme: 'flat'
              },
              paymentMethods: {
                bankTransfer: 'all',
                ticket: 'all',
                creditCard: 'all',
                debitCard: 'all',
                maxInstallments: 1
              }
            }}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent;