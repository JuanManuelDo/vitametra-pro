
import React, { useEffect, useState } from 'react';
import { UndoIcon } from './Icons';

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  actionText?: string;
  onAction?: () => void;
  duration?: number;
  snackbarKey: number;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type = 'info', actionText, onAction, duration = 5000, snackbarKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (snackbarKey > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [snackbarKey, duration]);

  if (!isVisible) {
    return null;
  }

  const handleActionClick = () => {
    if (onAction) {
        onAction();
    }
    setIsVisible(false);
  }

  const getBgColor = () => {
    switch(type) {
        case 'success': return 'bg-emerald-600';
        case 'error': return 'bg-red-600';
        default: return 'bg-slate-800';
    }
  };

  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between min-w-[320px] z-[200] animate-slide-up border border-white/10 ${getBgColor()}`}>
      <span className="text-sm font-bold">{message}</span>
      {actionText && onAction && (
        <button
          onClick={handleActionClick}
          className="ml-4 flex items-center font-black text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          <UndoIcon className="w-4 h-4 mr-1.5" />
          {actionText}
        </button>
      )}
      <style>{`
        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Snackbar;
