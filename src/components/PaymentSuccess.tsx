
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    CheckCircleIcon, ArrowRightIcon, 
    RobotIcon, ClipboardDocumentListIcon, InstagramIcon
} from './ui/Icons'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Explosión inicial
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#007BFF', '#28A745', '#FFD700']
    });

    // Lluvia lateral continua por 3 segundos
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#007BFF'] });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#28A745'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 animate-fade-in overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-50 overflow-hidden relative p-10 md:p-20 text-center"
      >
        
        {/* Orbes de fondo Zen */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center mb-10 shadow-xl border border-emerald-100 animate-glow"
          >
            <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tighter leading-[0.9]">
            ¡Bienvenido a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">VitaMetra Pro!</span>
          </h1>

          <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed max-w-md mx-auto">
            Tu suscripción está activa. Hemos desbloqueado el poder de la <strong>IA Clínica</strong> para tu bienestar metabólico.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
              <motion.div 
                whileHover={{ y: -5 }}
                className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 text-left"
              >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500"><RobotIcon className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">IA Ilimitada</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Activado</p>
                  </div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 text-left"
              >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500"><ClipboardDocumentListIcon className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Reportes Médicos</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Desbloqueado</p>
                  </div>
              </motion.div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black rounded-3xl shadow-2xl transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
          >
            Empezar mi Transformación
            <ArrowRightIcon className="w-5 h-5 text-emerald-400" />
          </button>

          <button 
            onClick={() => window.open('https://instagram.com', '_blank')}
            className="mt-10 flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors group"
          >
              <InstagramIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Compartir Logro</span>
          </button>
        </div>
      </motion.div>
      
      <p className="mt-12 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] opacity-50">
        VitaMetra Clinical AI • v4.7.0 Stable Build
      </p>
    </div>
  );
};

export default PaymentSuccess;
