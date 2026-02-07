import React from 'react';
import { X, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LimitReachedModalProps {
  onClose: () => void;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/plans');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Contenido del Modal */}
      <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-12 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-600 shadow-inner">
            <Crown size={40} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-tight mb-2">
            Límite Diario Alcanzado
          </h3>
          <p className="text-slate-500 font-medium text-sm mb-8 px-4">
            Has completado tus 3 análisis gratuitos de hoy. Pásate a PRO para obtener análisis ilimitados y precisión quirúrgica.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <Zap className="text-blue-500" size={20} />
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Análisis IA Ilimitados</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <Star className="text-amber-500" size={20} />
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Insights Predictivos PRO</span>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Ver Planes Pro <ArrowRight size={16} />
          </button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors"
          >
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;