import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, Atom, ChevronRight, Sparkles } from 'lucide-react';
import { apiService } from '../../services/apiService';

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
      default: return "Error de conexión Bio-Core.";
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
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-metra-dark/60 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[480px] rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-700">
        
        {/* Glow Decorativo */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-metra-blue/10 rounded-full blur-[80px]" />

        <button onClick={onClose} className="absolute top-10 right-10 p-2 text-slate-300 hover:text-metra-dark transition-all z-20 bg-slate-50 rounded-full">
          <X size={20} />
        </button>

        <div className="p-10 sm:p-14 relative z-10">
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-metra-blue/10 text-metra-blue text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <Atom size={14} className="animate-spin-slow" /> Bio-Sync Activo
            </div>
            <h2 className="text-5xl font-[1000] text-metra-dark tracking-tighter uppercase italic leading-[0.8]">
              {isRegistering ? 'Crear' : 'Acceso'} <br />
              <span className="text-metra-blue">Bio-Core</span>
            </h2>
          </header>

          {errorMessage && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-bounce-short">
              <AlertCircle size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-metra-blue transition-colors" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL DE USUARIO"
                className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 ring-metra-blue/20 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-metra-blue transition-colors" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD SEGURA"
                className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 ring-metra-blue/20 transition-all placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-metra-dark text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-metra-dark/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6 overflow-hidden relative group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{isRegistering ? 'Registrar Perfil' : 'Entrar al Sistema'}</span>
                  <div className="bg-metra-blue p-1 rounded-lg group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={16} strokeWidth={4} />
                  </div>
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setErrorMessage(null); }}
            className="mt-10 w-full text-center"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {isRegistering ? "¿Ya eres Bio-User?" : "¿Nuevo en Vitametra?"} 
              <span className="text-metra-blue ml-2 underline decoration-2 underline-offset-4">Clic aquí</span>
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;