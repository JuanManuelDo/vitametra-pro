import React from 'react';
import { Check, Zap, Star, Shield, Crown, Sparkles } from 'lucide-react';

interface PlansViewProps {
  onSelectPlan: (planId: string) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Vitametra Starter',
      price: '6.990',
      period: 'Mes',
      description: 'Prueba la precisión de la IA.',
      features: ['30 Análisis IA al mes', 'Reportes básicos', 'IA Predictiva estándar'],
      icon: <Zap size={24} className="text-blue-500" />,
      style: 'bg-white border-slate-100',
      buttonStyle: 'bg-slate-900 text-white',
      popular: false
    },
    {
      id: 'quarterly',
      name: 'Vitametra PRO',
      price: '18.990',
      period: 'Trimestre',
      description: 'El estándar de oro para tu salud.',
      features: [
        'Análisis IA Ilimitados', 
        'Insights Metabólicos PRO', 
        'Sincronización Médica', 
        'Sin anuncios'
      ],
      icon: <Crown size={24} className="text-amber-500" />,
      style: 'bg-[#0F172A] border-blue-500/30 text-white',
      buttonStyle: 'bg-metra-blue text-white shadow-blue-500/20',
      popular: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* HEADER ESTILO IMAGEN 7 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
          <Sparkles size={14} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Membresías Vitametra 2026</span>
        </div>
        <h2 className="text-5xl font-[950] text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
          Desbloquea tu <br/>
          <span className="text-metra-blue">Máximo Potencial</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pb-20">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative rounded-[3rem] p-8 border-2 transition-all duration-500 hover:scale-[1.02] ${plan.style} shadow-2xl shadow-slate-200/50`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-8 bg-metra-blue text-white px-5 py-2 rounded-full text-[10px] font-[900] uppercase tracking-widest shadow-lg animate-pulse">
                Más Elegido
              </div>
            )}
            
            <div className="mb-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-white/10' : 'bg-slate-50'}`}>
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{plan.name}</h3>
              <p className={`text-sm font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-[1000] tracking-tighter">${plan.price}</span>
                <span className={`text-sm font-black uppercase opacity-50`}>/ {plan.period}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Pesos Chilenos (CLP)</p>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                  <div className={`p-1 rounded-full ${plan.popular ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onSelectPlan(plan.id)}
              className={`w-full py-6 rounded-[2rem] font-[900] uppercase tracking-[0.15em] text-xs transition-all active:scale-95 shadow-xl ${plan.buttonStyle}`}
            >
              {plan.id === 'quarterly' ? 'ACCESO TOTAL PRO' : 'EMPEZAR AHORA'}
            </button>
          </div>
        ))}
      </div>
      
      {/* FOOTER DE CONFIANZA (Imagen 8) */}
      <div className="metra-card !bg-slate-50 border-none flex flex-col items-center text-center gap-4">
        <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest max-w-[250px]">
          Únete a +5,000 usuarios optimizando su salud con Vitametra
        </p>
        <div className="flex items-center gap-4 pt-2 grayscale opacity-50">
           <Shield size={20} />
           <span className="font-black text-[9px] uppercase tracking-widest">Pago Encriptado SSL</span>
        </div>
      </div>
    </div>
  );
};

export default PlansView;