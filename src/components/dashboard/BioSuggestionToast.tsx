import React, { useEffect } from 'react';
import { Sparkles, X, Zap } from 'lucide-react';

interface BioSuggestionToastProps {
  message: string;
  action?: string;
  isVisible: boolean;
  onClose: () => void;
}

export const BioSuggestionToast: React.FC<BioSuggestionToastProps> = ({ message, action, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000); // 10 segundos para lectura cómoda
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-md animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full" />

        <div className="flex gap-4 items-start relative z-10">
          <div className="shrink-0 p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl text-white shadow-lg shadow-purple-500/20">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em]">Bio-Core Suggestion</span>
              <div className="h-1.5 w-1.5 bg-[#34C759] rounded-full animate-pulse" />
            </div>
            
            <p className="text-white text-sm font-bold leading-relaxed italic">
              "{message}"
            </p>

            {action && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3">
                <div className="p-1 bg-[#34C759]/20 rounded text-[#34C759] mt-0.5">
                  <Zap size={12} fill="currentColor" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-normal">
                  Acción Sugerida: <span className="text-[#34C759]">{action}</span>
                </p>
              </div>
            )}
          </div>

          <button onClick={onClose} className="shrink-0 p-1 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};