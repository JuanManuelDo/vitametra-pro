import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';
// RUTA CORREGIDA: Apuntando a la nueva carpeta de IA
import { MetraCore } from '../services/ai/metraCore'; 
import type { UserData } from '../types';

interface CarbInputFormProps {
  foodInput: string;
  setFoodInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const CarbInputForm: React.FC<CarbInputFormProps> = ({ 
  foodInput, 
  setFoodInput, 
  onSubmit, 
  isLoading 
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && foodInput.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative group">
        {/* Decoración de resplandor IA */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        
        <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="flex items-center px-8 py-6">
            <div className="mr-4 text-blue-600">
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Sparkles size={24} />
              )}
            </div>
            
            <textarea
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe tu comida (ej: '2 tacos de pastor y una coca zero')..."
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-slate-800 placeholder:text-slate-300 resize-none h-12 py-2"
              disabled={isLoading}
            />

            <button
              onClick={onSubmit}
              disabled={isLoading || !foodInput.trim()}
              className={`ml-4 p-4 rounded-2xl transition-all ${
                foodInput.trim() && !isLoading 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95' 
                : 'bg-slate-100 text-slate-300'
              }`}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </div>

          <div className="bg-slate-50 px-8 py-3 flex items-center justify-between border-t border-slate-50">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Metra Inferencia Bio-Nutricional
            </span>
            <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-bold text-slate-400">Motor v4.7 Activo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {['Desayuno ligero', 'Almuerzo completo', 'Cena Keto'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setFoodInput(suggestion)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
          >
            + {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default CarbInputForm;