import React, { useState, useEffect } from 'react';
import { Waves, Zap, ShieldCheck } from 'lucide-react';
import type { UserData } from '../types';

interface WelcomeModalProps {
  currentUser: UserData | null;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('vitaflow_welcome_seen');
    // Solo abrir si no lo ha visto Y si el usuario ya cargó
    if (!hasSeenWelcome && currentUser) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleClose = () => {
    localStorage.setItem('vitaflow_welcome_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border border-white relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
            <Waves className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase mb-4">
            Hola, <span className="text-blue-600">{currentUser.firstName || 'Usuario'}</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Has activado tu ecosistema <span className="font-bold text-slate-800">VitaFlow</span>.
          </p>
          <button 
            onClick={handleClose}
            className="w-full bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-xl"
          >
            Entrar a mi Ecosistema
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
