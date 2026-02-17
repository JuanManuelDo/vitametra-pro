import React, { useState } from 'react'
import { Activity, CheckCircle2, Info } from 'lucide-react'
// RUTA CORREGIDA
import { apiService } from '../services/infrastructure/apiService'
import type { HistoryEntry } from '../types'

interface Props {
  entry: HistoryEntry;
  onCalibrated: () => void;
}

export const GlucoseCalibrationCard: React.FC<Props> = ({ entry, onCalibrated }) => {
  const [glucose, setGlucose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!glucose || isNaN(Number(glucose))) return;
    
    setIsSubmitting(true);
    try {
      // Usamos updateUser o saveHistoryEntry según la lógica de tu API
      // Aquí actualizamos el registro existente para añadir la glucosa post-prandial
      await apiService.saveHistoryEntry(entry.userId, {
        ...entry,
        bloodGlucoseValue: Number(glucose),
        isCalibrated: true,
        userInput: `Calibración post-comida: ${entry.foodName || 'Ingesta'}`
      });
      onCalibrated();
    } catch (error) {
      console.error("Error al calibrar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-xl animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-white/20 p-3 rounded-2xl">
          <Activity size={24} className="text-white" />
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-black">IA</div>
        </div>
      </div>

      <h3 className="text-lg font-black leading-tight mb-1 italic uppercase tracking-tight">
        Entrenamiento de IA en curso
      </h3>
      <p className="text-blue-100 text-xs font-medium mb-6 opacity-90">
        ¿Cuál fue tu glucosa 2h después de comer <span className="font-black text-white underline decoration-white/30">{entry.userInput || 'esta comida'}</span>?
      </p>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="number"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder="Ej: 115"
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-5 text-white placeholder:text-white/40 font-black text-lg focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest opacity-50">mg/dL</span>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !glucose}
          className="bg-white text-blue-600 p-4 rounded-2xl font-black transition-all hover:bg-blue-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center min-w-[64px]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle2 size={24} />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 opacity-60">
        <Info size={12} />
        <p className="text-[9px] font-bold uppercase tracking-widest">Esto personaliza tu motor predictivo</p>
      </div>
    </div>
  );
};