
import React, { useEffect, useState } from 'react';
import { UndoIcon } from './Icons'; // Asegúrate de tener este import o cámbialo por un icono de Lucide

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  actionText?: string;
  onAction?: () => void;
  duration?: number;
  snackbarKey: number;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type = 'info', actionText, onAction, duration = 4000, snackbarKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (snackbarKey > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [snackbarKey, duration]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-metra-green shadow-metra-green/20',
    error: 'bg-red-500 shadow-red-500/20',
    info: 'bg-metra-dark shadow-metra-dark/20'
  };

  return (
    <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm p-1 rounded-[2rem] animate-in slide-in-from-top-10 duration-500`}>
      <div className={`flex items-center justify-between px-6 py-4 rounded-[1.8rem] text-white shadow-2xl ${colors[type]} backdrop-blur-md border border-white/10`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{message}</span>
        </div>
        {actionText && (
          <button onClick={() => { onAction?.(); setIsVisible(false); }} className="bg-white/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/30 transition-colors">
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Snackbar;