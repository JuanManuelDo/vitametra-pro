
import React, { useState, useEffect } from 'react'
import type { UserData } from '../types'
import { CheckCircleIcon, SparklesIcon, StarIcon } from './ui/Icons'
import Spinner from './ui/Spinner'
import { crearPreferenciaMP } from '../services/firebaseService'

// Extender ventana para el SDK de MP inyectado
declare var MercadoPago: any;

interface SubscriptionViewProps {
  currentUser: UserData | null;
  onUpdateUser: (updatedUser: UserData) => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ currentUser }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Inicializar MP
  const mp = new MercadoPago('APP_USR-TU-PUBLIC-KEY-AQUI', {
    locale: 'es-CL' // O tu localización
  });

  const handleBuy = async (title: string, price: number) => {
    if (!currentUser) return alert("Por favor inicia sesión.");
    
    setIsGenerating(true);
    setPreferenceId(null);
    
    try {
      const result = await crearPreferenciaMP({ title, price });
      if (result.data.id) {
        setPreferenceId(result.data.id);
        renderWalletBrick(result.data.id);
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con Mercado Pago.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderWalletBrick = (id: string) => {
    const bricksBuilder = mp.bricks();
    const renderWallet = async () => {
      if (window.document.getElementById('wallet_container')) {
        window.document.getElementById('wallet_container')!.innerHTML = ''; // Limpiar previo
      }
      await bricksBuilder.create('wallet', 'wallet_container', {
        initialization: {
          preferenceId: id,
          redirectMode: 'modal' // Abre el checkout en un modal elegante
        },
      });
    };
    renderWallet();
  };

  const formatCLP = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-brand-primary mb-3">VitaMetra PRO</h2>
        <p className="text-lg text-slate-600">Desbloquea el poder total de la IA para tu control glucémico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Plan Trimestral */}
        <div className="bg-white rounded-3xl p-8 border-2 border-brand-primary shadow-xl flex flex-col">
          <h3 className="text-xl font-bold text-brand-primary mb-2">Trimestral</h3>
          <div className="text-4xl font-black text-slate-800 mb-6">{formatCLP(18990)}</div>
          
          <ul className="space-y-3 text-sm text-slate-600 mb-8 flex-grow">
            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-brand-secondary"/> IA Ilimitada</li>
            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-brand-secondary"/> Reportes PDF Clínicos</li>
          </ul>

          <button 
            onClick={() => handleBuy("Plan Trimestral Vitametras", 18990)}
            disabled={isGenerating}
            className="w-full py-4 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-dark transition-all shadow-lg flex justify-center items-center gap-2"
          >
            {isGenerating ? <Spinner /> : 'Pagar con Mercado Pago'}
          </button>
        </div>

        {/* Plan Anual */}
        <div className="bg-white rounded-3xl p-8 border-2 border-brand-secondary shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand-secondary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Mejor Oferta</div>
          <h3 className="text-xl font-bold text-brand-secondary mb-2">Anual</h3>
          <div className="text-4xl font-black text-slate-800 mb-6">{formatCLP(69990)}</div>
          
          <button 
            onClick={() => handleBuy("Plan Anual Vitametras", 69990)}
            disabled={isGenerating}
            className="w-full py-4 bg-brand-secondary text-white font-black rounded-2xl hover:bg-green-600 transition-all shadow-lg flex justify-center items-center gap-2"
          >
             {isGenerating ? <Spinner /> : 'Pagar con Mercado Pago'}
          </button>
        </div>
      </div>

      {/* Contenedor del Botón de Mercado Pago (Aparece tras hacer clic) */}
      <div className={`mt-8 transition-all duration-500 ${preferenceId ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Finaliza tu compra de forma segura:</p>
        <div id="wallet_container"></div>
      </div>
    </div>
  );
};

export default SubscriptionView;
