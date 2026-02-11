import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, Brain, ChevronRight, Sparkles, Heart } from 'lucide-react';
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
      case 'auth/user-not-found': return "No encontramos este perfil.";
      case 'auth/wrong-password': return "La llave no coincide.";
      case 'auth/invalid-email': return "Email no válido.";
      case 'auth/weak-password': return "Usa al menos 6 caracteres.";
      case 'auth/email-already-in-use': return "Este email ya es parte del club.";
      default: return "Sincronización interrumpida.";
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
      onClose(); // Cerramos el modal tras el éxito
    } catch (error: any) {
      setErrorMessage(translateError(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-500">
      {/* Overlay con desenfoque de cristal (Apple Style) */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[480px] rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl overflow-hidden border border-white animate-in slide-in-from-bottom-10 duration-700">
        
        {/* Decoración de Marketing: El Aura Metabólica */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 transition-all z-20 bg-slate-50 rounded-full active:scale-90">
          <X size={20} />
        </button>

        <div className="p-10 sm:p-14 relative z-10">
          <header className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <Sparkles size={14} className="animate-pulse" /> IA Empoderada
            </div>
            <h2 className="text-5xl font-[1000] text-slate-900 tracking-tighter leading-[0.85] mb-2 uppercase italic">
              {isRegistering ? 'Únete a la' : 'Tu Mente'} <br />
              <span className="text-blue-600">Metabólica</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              {isRegistering ? 'Empieza hoy tu camino hacia la libertad.' : 'Tu equilibrio te estaba esperando.'}
            </p>
          </header>

          {errorMessage && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-in slide-in-from-left-4">
              <AlertCircle size={20} />
              <span className="text-xs font-bold uppercase tracking-widest leading-none">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="TU CORREO"
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 pl-16 pr-8 text-xs font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 ring-blue-600/5 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="TU CONTRASEÑA"
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-6 pl-16 pr-8 text-xs font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 ring-blue-600/5 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6 group overflow-hidden"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="relative z-10">{isRegistering ? 'Crear Perfil Libre' : 'Entrar con Propósito'}</span>
                  <div className="bg-blue-600 p-1.5 rounded-xl group-hover:translate-x-1.5 transition-transform duration-300">
                    <ChevronRight size={18} strokeWidth={3} />
                  </div>
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setErrorMessage(null); }}
            className="mt-10 w-full group"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] transition-colors group-hover:text-blue-600">
              {isRegistering ? "¿Ya eres un usuario libre?" : "¿Aún no tienes acceso?"} 
              <span className="text-blue-600 ml-2 border-b-2 border-blue-600/30 pb-0.5 group-hover:border-blue-600">Haz clic aquí</span>
            </p>
          </button>
          
          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Tecnología para la Felicidad</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;