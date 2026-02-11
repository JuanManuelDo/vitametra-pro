import React from 'react';
import { apiService } from '../services/apiService';

const PricingTab: React.FC = () => {
    const handleSubscribe = async (tier: 'FREE' | 'PRO') => {
        if (tier === 'PRO') {
            // Llama al método que simulamos en apiService
            await apiService.createStripeCheckoutSession('price_premium_monthly');
            alert('Redirigiendo a la pasarela de pago (Simulado)');
        } else {
            alert('Ya tienes el plan básico activado.');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Planes y Suscripciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Free */}
                <div className="border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold">Plan Gratuito</h3>
                    <p className="text-gray-600 mb-4">Ideal para seguimiento personal básico.</p>
                    <ul className="mb-6 space-y-2">
                        <li>✅ 3 Análisis diarios</li>
                        <li>✅ Registro histórico</li>
                        <li>❌ Soporte prioritario</li>
                    </ul>
                    <button 
                        disabled
                        className="w-full py-2 px-4 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
                    >
                        Plan Actual
                    </button>
                </div>

                {/* Plan PRO */}
                <div className="border-2 border-blue-500 rounded-lg p-6 shadow-md bg-blue-50">
                    <h3 className="text-xl font-semibold">Vitametra PRO</h3>
                    <p className="text-gray-600 mb-4">Sin límites para un control metabólico total.</p>
                    <ul className="mb-6 space-y-2">
                        <li>🚀 Análisis ilimitados</li>
                        <li>🚀 Reportes avanzados PDF</li>
                        <li>🚀 Sincronización con sensores</li>
                    </ul>
                    <button 
                        onClick={() => handleSubscribe('PRO')}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Mejorar a PRO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PricingTab;