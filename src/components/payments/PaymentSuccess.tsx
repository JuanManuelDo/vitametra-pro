import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Instagram } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#fbbf24']
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[4rem] p-10 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500" />
        
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>

        <h1 className="text-4xl font-[1000] text-slate-900 mb-4 tracking-tighter italic uppercase">
          ¡Acceso <span className="text-blue-600">Pro</span> Activado!
        </h1>
        
        <p className="text-slate-500 font-medium mb-10">
          Tu suscripción ha sido procesada con éxito. Ya puedes disfrutar de todas las herramientas de IA.
        </p>

        <div className="space-y-3 mb-10">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 text-left">
            <Zap className="text-blue-600" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">IA Ilimitada Desbloqueada</span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 text-left">
            <ShieldCheck className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Reportes Clínicos Activos</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs hover:bg-black transition-all"
        >
          Ir al Panel <ArrowRight size={18} />
        </button>

        <button 
          onClick={() => window.open('https://instagram.com', '_blank')}
          className="mt-8 flex items-center justify-center gap-2 text-slate-300 hover:text-pink-500 transition-colors"
        >
          <Instagram size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Compartir en redes</span>
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
