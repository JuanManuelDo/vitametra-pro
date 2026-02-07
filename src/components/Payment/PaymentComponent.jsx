import React from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Swal from 'sweetalert2';

// REEMPLAZA CON TU PUBLIC KEY DE MERCADO PAGO
initMercadoPago('APP_USR-782a20b1-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

const PaymentComponent = ({ planId, amount }) => {
  const functions = getFunctions();
  const processPayment = httpsCallable(functions, 'processPayment');

  const initialization = {
    amount: amount, // El precio que viene del plan seleccionado
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Llamada a tu Cloud Function (la que acabamos de desplegar)
        const response = await processPayment({
          token: formData.token,
          issuer_id: formData.issuer_id,
          payment_method_id: formData.payment_method_id,
          installments: formData.installments,
          planId: planId // 'monthly', 'quarterly' o 'annual'
        });

        if (response.data.status === 'approved') {
          Swal.fire({
            title: '¡Pago Exitoso!',
            text: 'Tu cuenta ha sido actualizada a PRO. ¡Disfruta de Vitametra IA!',
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
          resolve();
        } else {
          Swal.fire('Pago Rechazado', 'Por favor verifica los datos de tu tarjeta e intenta de nuevo.', 'error');
          reject();
        }
      } catch (error) {
        console.error('Error en el pago:', error);
        Swal.fire('Error del Servidor', 'No pudimos procesar el pago. Inténtalo más tarde.', 'error');
        reject();
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Finalizar Suscripción</h3>
      <Payment
        initialization={initialization}
        customization={{
          visual: {
            style: {
              theme: 'flat', // Diseño moderno y limpio
            },
          },
          paymentMethods: {
            maxInstallments: 1,
          }
        }}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default PaymentComponent;
