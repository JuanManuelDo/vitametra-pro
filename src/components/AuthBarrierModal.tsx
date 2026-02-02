import React from 'react';
import { X, Sparkles, Lock } from 'lucide-react';

interface AuthBarrierModalProps {
  onClose: () => void;
  onRegisterClick: () => void;
  onLoginClick: () => void;
}

const AuthBarrierModal: React.FC<AuthBarrierModalProps> = ({ onClose, onRegisterClick, onLoginClick }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md relative text-center border border-slate-100 animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
            <Lock className="w-10 h-10 text-[#007BFF]" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Acceso Seguro</h2>
        <p className="text-slate-400 mb-10 font-medium text-sm leading-relaxed px-4">
            Registra tus análisis metabólicos y obtén seguimiento clínico personalizado.
        </p>
        
        <div className="space-y-4">
            <button
                onClick={onRegisterClick}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#007BFF] text-white font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
                <Sparkles size={18} /> Empezar Ahora Gratis
            </button>
            <button
                onClick={onLoginClick}
                className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest border border-slate-100 hover:bg-white hover:border-blue-100 transition-all active:scale-95"
            >
                Ya tengo una cuenta
            </button>
        </div>
        
        <p className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Protocolo de Seguridad VitaMetra
        </p>
      </div>
    </div>
  );
};

export default AuthBarrierModal;