import React from 'react'
import { Check, Zap, Star, Shield, Crown, Sparkles, Globe, ArrowRight } from 'lucide-react'

interface PlansViewProps {
  onSelectPlan: (planId: string) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Vitametra Starter',
      price: '6.990',
      period: 'MES',
      icon: <Zap size={28} className="text-blue-500" />,
      style: 'border-blue-100 shadow-blue-100/50',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
      features: ['30 Análisis IA al mes', 'Reportes básicos', 'IA Predictiva estándar', 'Sin anuncios'],
      popular: false
    },
    {
      id: 'quarterly',
      name: 'Vitametra PRO',
      price: '18.990',
      period: 'TRIMESTRE',
      icon: <Star size={28} className="text-blue-600" />,
      style: 'border-blue-600 shadow-xl shadow-blue-100',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
      features: ['Análisis IA Ilimitados', 'Insights Metabólicos PRO', 'Sincronización Médica', 'Prioridad en Servidores'],
      popular: true
    },
    {
      id: 'annual',
      name: 'Vitametra GLOBAL',
      price: '69.990',
      period: 'AÑO',
      icon: <Globe size={28} className="text-green-500" />,
      style: 'border-green-200 shadow-green-100/50',
      buttonStyle: 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white',
      features: ['Todo lo de PRO', 'Soporte Prioritario 24/7', 'Funciones Beta Exclusivas', 'Reporte Anual de Salud'],
      popular: false
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-20 animate-in fade-in duration-700">
      
      {/* HEADER TIPO APPLE HEALTH */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
          <Sparkles size={14} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 italic">Membresías Elite 2026</span>
        </div>
        <h2 className="text-6xl md:text-7xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
          Elige tu <span className="text-blue-600">Plan</span> <br/>
          <span className="text-blue-600">Bio-Metra</span>
        </h2>
        <p className="mt-6 text-slate-400 font-bold tracking-widest uppercase text-xs">
          Invierte en tu salud con precisión de grado clínico
        </p>
      </div>

      {/* GRID DE 3 PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative flex flex-col bg-white rounded-[3.5rem] p-10 border-2 transition-all duration-500 hover:scale-[1.03] ${plan.style}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-2 rounded-full flex items-center gap-2 font-black text-[11px] uppercase tracking-widest shadow-xl">
                <Crown size={16} /> Más Popular
              </div>
            )}
            
            <div className="mb-8 flex justify-center">
              <div className="p-4 bg-slate-50 rounded-2xl">
                {plan.icon}
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">
                Vitametra <span className={plan.id === 'annual' ? 'text-green-600' : 'text-blue-600'}>{plan.name.split(' ')[1]}</span>
              </h3>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="text-5xl font-[1000] tracking-tighter text-slate-900">${plan.price}</span>
                </div>
                <p className="text-slate-400 font-bold italic mt-1 uppercase text-xs">/ {plan.period}</p>
                <p className="text-[9px] font-black text-slate-300 mt-2 tracking-[0.2em]">PESOS CHILENOS (CLP)</p>
              </div>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 leading-tight">
                  <div className={`mt-0.5 p-0.5 rounded-full ${plan.id === 'annual' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onSelectPlan(plan.id)}
              className={`w-full py-5 rounded-[2rem] font-[900] uppercase tracking-[0.15em] text-xs transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${plan.buttonStyle}`}
            >
              Empezar Ahora <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
      
      {/* TRUST FOOTER */}
      <div className="flex flex-col items-center text-center gap-6 py-10 border-t border-slate-100">
        <div className="flex items-center gap-4 text-slate-400">
           <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
             <Shield size={20} className="text-blue-500" />
             <span className="font-black text-[10px] uppercase tracking-[0.2em]">Pago Seguro Mercado Pago</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="font-black text-[10px] uppercase tracking-[0.2em]">Encriptación Grado Médico</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlansView;