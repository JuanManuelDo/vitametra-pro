import React, { useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Swal from 'sweetalert2';

// Sustituye con tu Public Key de Mercado Pago
initMercadoPago('APP_USR-5085620590656834-010519-75f9c2645782ba627abd3c72de22fe8a-3113708019');

interface PaymentGatewayProps {
  currentUser: any;
  planId: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  onClose: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ currentUser, planId, amount, onClose }) => {
  const functions = getFunctions();
  const processPayment = httpsCallable(functions, 'processPayment');

  const onSubmit = async ({ formData }: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await processPayment({
          token: formData.token,
          issuer_id: formData.issuer_id,
          payment_method_id: formData.payment_method_id,
          installments: formData.installments,
          planId: planId
        });

        if (response.data.status === 'approved') {
          await Swal.fire({
            icon: 'success',
            title: '¡Pago aprobado!',
            text: 'Tu acceso PRO ha sido activado.',
            confirmButtonColor: '#10b981'
          });
          window.location.reload(); // Para refrescar el estado del usuario
          resolve(true);
        } else {
          Swal.fire('Pago rechazado', 'Verifica los datos de tu tarjeta.', 'error');
          reject();
        }
      } catch (error) {
        console.error('Error en el checkout:', error);
        Swal.fire('Error', 'No pudimos procesar el pago en este momento.', 'error');
        reject();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          ✕
        </button>
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">Checkout Seguro</h3>
            <p className="text-sm text-gray-500">Plan {planId.toUpperCase()} - ${amount.toLocaleString()}</p>
          </div>
          <Payment
            initialization={{ amount }}
            customization={{
              visual: { theme: 'flat' },
              paymentMethods: { maxInstallments: 1 }
            }}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
