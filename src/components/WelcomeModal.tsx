import React, { useState, useEffect } from 'react';
import { Waves, Zap, ShieldCheck, Heart } from 'lucide-react';

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('vitaflow_welcome_seen');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('vitaflow_welcome_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border border-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
            <Waves className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase mb-4">
            Bienvenido al <span className="text-blue-600">Flow</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Has activado tu ecosistema <span className="font-bold text-slate-800">VitaFlow</span>. 
            Nuestra IA ahora analiza tu metabolismo para que tú solo te preocupes de vivir.
          </p>
          <div className="grid grid-cols-1 gap-4 mb-10 text-left">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl">
              <Zap className="text-amber-500" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Predicción</p>
                <p className="text-sm font-bold text-slate-700">Cálculos de dosis en tiempo real.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl">
              <ShieldCheck className="text-blue-600" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Seguridad</p>
                <p className="text-sm font-bold text-slate-700">Privacidad de grado médico activa.</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-full bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-xl active:scale-95 transition-transform"
          >
            Entrar a mi Ecosistema
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
