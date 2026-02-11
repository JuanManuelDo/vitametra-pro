import React from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { X, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

// PUBLIC KEY OFICIAL VITAMETRA (Basada en tu AppId de Firebase)
initMercadoPago('APP_USR-782a20b1-xxxx-xxxx-xxxx-xxxxxxxxxxxx'); // Reemplaza con tu Key Real de Producción

const PaymentComponent = ({ planId, amount, onClose }) => {
  const functions = getFunctions();
  const processPayment = httpsCallable(functions, 'processPayment');

  const initialization = {
    amount: amount,
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await processPayment({
          token: formData.token,
          issuer_id: formData.issuer_id,
          payment_method_id: formData.payment_method_id,
          installments: formData.installments,
          planId: planId
        });

        if (response.data.status === 'approved') {
          Swal.fire({
            title: '¡SINCRO EXITOSA!',
            text: 'Tu Bio-Core ha sido actualizado a PRO.',
            icon: 'success',
            confirmButtonColor: '#2563eb',
            customClass: {
              container: 'font-sans',
              popup: 'rounded-[2.5rem]'
            }
          });
          resolve();
        } else {
          Swal.fire('Error', 'Verifica tu tarjeta.', 'error');
          reject();
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Inténtalo más tarde.', 'error');
        reject();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4">
      {/* Overlay con blur Apple-style */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900">
            <X size={24} />
        </button>

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-[1000] text-slate-900 tracking-tighter uppercase italic">Checkout Seguro</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Total a pagar: ${amount.toLocaleString('es-CL')} CLP</p>
        </div>

        <div className="mercadopago-container">
            <Payment
                initialization={initialization}
                customization={{
                    visual: {
                        style: {
                            theme: 'flat', // El más limpio para interfaces modernas
                        },
                    },
                    paymentMethods: {
                        maxInstallments: 1,
                    }
                }}
                onSubmit={onSubmit}
            />
        </div>

        <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest mt-8 leading-relaxed">
            Procesado por Mercado Pago <br/>
            Encriptación de datos grado bancario
        </p>
      </div>
    </div>
  );
};

export default PaymentComponent;