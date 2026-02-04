import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, ShieldCheck, Atom, ChevronRight } from 'lucide-react';
import { apiService } from '../services/apiService';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const translateError = (code: string) => {
    switch (code) {
      case 'auth/user-not-found': return "Cuenta no identificada.";
      case 'auth/wrong-password': return "Credenciales incorrectas.";
      case 'auth/invalid-email': return "Formato de email inválido.";
      case 'auth/weak-password': return "Contraseña débil (mín. 6 caracteres).";
      case 'auth/email-already-in-use': return "El email ya está en uso.";
      default: return "Error de red. Intenta de nuevo.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isRegistering) {
        await apiService.register(email, password);
      } else {
        await apiService.login(email, password);
      }
      onLoginSuccess();
    } catch (error: any) {
      setErrorMessage(translateError(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      {/* Overlay con desenfoque de cristal */}
      <div className="absolute inset-0 bg-[#001D3D]/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[480px] rounded-t-[3rem] sm:rounded-[3.5rem] shadow-2xl overflow-hidden animate-metra-slide sm:animate-in sm:zoom-in-95 duration-500 border border-white/20">
        
        {/* Barra de arrastre estética para móvil */}
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 sm:hidden" />

        <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-all z-10 bg-slate-50 rounded-full">
          <X size={20} />
        </button>

        <div className="p-10 sm:p-14">
          {/* Header PRO con el ÁTOMO */}
          <div className="mb-12 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#007AFF] text-[10px] font-[900] uppercase tracking-[0.2em] mb-6 border border-blue-100/50">
              <Atom size={14} className="animate-[spin_4s_linear_infinite]" /> Sincronización Molecular
            </div>
            <h2 className="text-5xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
              {isRegistering ? 'Únete al' : 'Panel de'} <br />
              <span className="text-[#007AFF]">Control</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm font-bold tracking-tight">
              {isRegistering ? 'Inicia tu transformación metabólica hoy.' : 'Accede a la precisión de Vitametra Bio-Core.'}
            </p>
          </div>

          {/* Feedback de Error */}
          {errorMessage && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[1.5rem] flex items-center gap-4 text-red-600 animate-in shake duration-500">
              <AlertCircle size={20} />
              <span className="text-xs font-black uppercase tracking-widest">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL PROFESIONAL"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007AFF]/20 focus:bg-white rounded-[1.5rem] py-6 px-8 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
              <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[#007AFF] transition-colors" size={20} />
            </div>

            <div className="group relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CONTRASEÑA SEGURA"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007AFF]/20 focus:bg-white rounded-[1.5rem] py-6 px-8 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
              <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[#007AFF] transition-colors" size={20} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#001D3D] hover:bg-[#003566] text-white py-6 rounded-[1.5rem] font-[900] text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 border border-white/10 mt-6"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>
                    {isRegistering ? 'CREAR PERFIL BIO' : 'ENTRAR AL SISTEMA'}
                  </span>
                  <div className="bg-[#007AFF] p-1 rounded-lg">
                    <ChevronRight size={16} strokeWidth={4} />
                  </div>
                </>
              )}
            </button>
          </form>

          {/* Switcher de Estado */}
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage(null);
              }}
              className="group py-2 px-4"
            >
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-all">
                {isRegistering ? (
                  <>¿Ya tienes cuenta? <span className="text-[#007AFF] underline decoration-2 underline-offset-8">Login</span></>
                ) : (
                  <>¿Eres nuevo? <span className="text-[#007AFF] underline decoration-2 underline-offset-8">Regístrate</span></>
                )}
              </p>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
            <Atom size={14} className="text-slate-900" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Bio-Core Security Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;