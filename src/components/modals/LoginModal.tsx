import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
// RUTAS CORREGIDAS A LA NUEVA ESTRUCTURA
import { apiService } from '../../services/infrastructure/apiService';
import type { UserData } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserData) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const user = await apiService.login(email, password);
        onLoginSuccess(user);
        onClose();
      } else {
        const user = await apiService.register(email, password);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Cabecera con Estilo Vitametra */}
            <div className="bg-slate-900 p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-blue-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Acceso Seguro Vitametra
                </span>
              </div>
              
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter leading-none">
                {isLogin ? (
                  <>BIENVENIDO</>
                ) : (
                  <>CREAR <span className="text-blue-500 italic">CUENTA</span></>
                )}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                {isLogin ? 'BIO-IDENTIDAD REQUERIDA' : 'UNIRSE AL ECOSISTEMA MÉDICO IA'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-50 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>{isLogin ? 'Entrar Ahora' : 'Empezar Registro'}</>
                )}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres usuario? Inicia sesión'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;