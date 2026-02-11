import React from 'react';
import { Check, Zap, Star, Shield, Crown, Sparkles, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlansViewProps {
  onSelectPlan: (planId: string, amount: number) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Starter',
      price: '6.990',
      rawPrice: 6990,
      period: 'MES',
      icon: <Zap size={28} />,
      color: 'blue',
      features: ['30 Análisis IA al mes', 'Reportes básicos', 'IA Predictiva estándar', 'Sin anuncios'],
      popular: false
    },
    {
      id: 'quarterly',
      name: 'PRO',
      price: '18.990',
      rawPrice: 18990,
      period: 'TRIMESTRE',
      icon: <Star size={28} />,
      color: 'blue',
      features: ['Análisis IA Ilimitados', 'Insights Metabólicos PRO', 'Sincronización Médica', 'Prioridad en Servidores'],
      popular: true
    },
    {
      id: 'annual',
      name: 'GLOBAL',
      price: '69.990',
      rawPrice: 69990,
      period: 'AÑO',
      icon: <Globe size={28} />,
      color: 'emerald',
      features: ['Todo lo de PRO', 'Soporte Prioritario 24/7', 'Funciones Beta Exclusivas', 'Reporte Anual de Salud'],
      popular: false
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-20 bg-[#FBFBFE]">
      {/* HEADER TIPO APPLE HEALTH */}
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8"
        >
          <Sparkles size={14} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-700 italic">Membresías Elite 2026</span>
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
          Elige tu <span className="text-blue-600">Plan</span> <br/>
          <span className="text-blue-600">Bio-Metra</span>
        </h2>
        <p className="mt-6 text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px]">
          Precisión de grado clínico para tu libertad
        </p>
      </div>

      {/* GRID DE PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id} 
            whileHover={{ y: -10 }}
            className={`relative flex flex-col bg-white rounded-[3.5rem] p-10 border transition-all duration-500 ${
              plan.popular 
              ? 'border-blue-600 shadow-2xl shadow-blue-100 ring-4 ring-blue-50' 
              : 'border-slate-100 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-2 rounded-full flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl">
                <Crown size={14} /> Recomendado
              </div>
            )}
            
            <div className={`mb-8 w-16 h-16 rounded-2xl flex items-center justify-center ${
                plan.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {plan.icon}
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vitametra {plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-[1000] tracking-tighter text-slate-900 italic">${plan.price}</span>
                <span className="text-xs font-bold text-slate-400 uppercase italic">/ {plan.period}</span>
              </div>
              <p className="text-[9px] font-black text-slate-300 mt-2 tracking-[0.2em] uppercase">Pesos Chilenos (CLP)</p>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-500 leading-tight">
                  <div className={`mt-0.5 p-0.5 rounded-full ${plan.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onSelectPlan(plan.id, plan.rawPrice)}
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 ${
                plan.color === 'emerald' 
                ? 'bg-slate-900 text-white hover:bg-emerald-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              Seleccionar <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 flex flex-col items-center gap-6 opacity-40">
        <div className="flex items-center gap-8 text-slate-400">
           <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
             <Shield size={20} className="text-blue-500" />
             <span className="font-black text-[9px] uppercase tracking-widest">Pago Seguro Mercado Pago</span>
           </div>
           <span className="font-black text-[9px] uppercase tracking-widest">Grado Médico AES-256</span>
        </div>
      </div>
    </div>
  );
};

export default PlansView;