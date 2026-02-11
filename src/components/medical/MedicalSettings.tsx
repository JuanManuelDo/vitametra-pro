import React, { useState } from 'react';
import { 
  Activity, 
  Save, 
  Clock, 
  Plus, 
  Trash2, 
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserData, InsulinRatioSegment } from '../../types';
import { apiService } from '../../services/apiService';

interface MedicalSettingsProps {
  currentUser: UserData;
  onUpdate: (updatedUser: UserData) => void;
}

const MedicalSettings: React.FC<MedicalSettingsProps> = ({ currentUser, onUpdate }) => {
  // Estado local para los ratios y factores de sensibilidad
  const [ratios, setRatios] = useState<InsulinRatioSegment[]>(
    currentUser.insulinRatioSchedule || [{ startTime: "08:00", ratio: 12 }]
  );
  const [isf, setIsf] = useState(currentUser.clinicalConfig?.insulinSensitivityFactor || 50);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = {
        ...currentUser,
        insulinRatioSchedule: ratios,
        clinicalConfig: {
          ...currentUser.clinicalConfig,
          insulinSensitivityFactor: isf
        }
      };
      await apiService.updateUser(updatedData);
      onUpdate(updatedData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error en calibración de parámetros clínicos:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSegment = () => {
    setRatios([...ratios, { startTime: "12:00", ratio: 10 }]);
  };

  const removeSegment = (index: number) => {
    setRatios(ratios.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl mb-10">
      {/* HEADER CLÍNICO */}
      <header className="mb-10 border-b border-slate-50 pb-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Activity size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Parámetros de Calibración</h2>
        </div>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Gestión técnica de factores de sensibilidad y ratios de corrección para el cálculo de bolos de insulina según algoritmos metabólicos.
        </p>
      </header>

      {/* SECCIÓN 1: RATIOS I:C */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
            <Clock size={14} /> Horarios de Ratio Insulina:Carbohidratos (I:C)
          </h3>
          <button 
            onClick={addSegment}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Añadir Segmento
          </button>
        </div>

        <div className="space-y-3">
          {ratios.map((segment, index) => (
            <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-slate-200">
              <div className="flex-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Inicio bloque</label>
                <input 
                  type="time" 
                  value={segment.startTime}
                  onChange={(e) => {
                    const newRatios = [...ratios];
                    newRatios[index].startTime = e.target.value;
                    setRatios(newRatios);
                  }}
                  className="bg-transparent font-bold text-slate-700 outline-none w-full"
                />
              </div>
              <div className="flex-1 border-l border-slate-200 pl-4">
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Ratio (g/U)</label>
                <input 
                  type="number" 
                  value={segment.ratio}
                  onChange={(e) => {
                    const newRatios = [...ratios];
                    newRatios[index].ratio = parseFloat(e.target.value);
                    setRatios(newRatios);
                  }}
                  className="bg-transparent font-bold text-slate-700 outline-none w-full"
                />
              </div>
              <button 
                onClick={() => removeSegment(index)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: ISF */}
      <section className="mb-10 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
            <Info size={80} />
        </div>
        <div className="relative z-10">
            <h3 className="text-sm font-bold mb-1">Factor de Sensibilidad a la Insulina (ISF)</h3>
            <p className="text-xs text-slate-400 font-medium mb-6">
                Defina la reducción esperada de glucemia (mg/dL) por cada 1 unidad de insulina de acción rápida.
            </p>
            <div className="flex items-center gap-4">
                <input 
                    type="number" 
                    value={isf}
                    onChange={(e) => setIsf(parseFloat(e.target.value))}
                    className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-3xl font-black text-white w-32 outline-none focus:ring-2 ring-blue-500"
                />
                <div>
                    <span className="block text-lg font-bold">mg/dL</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">por 1 UI</span>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER Y GUARDADO */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-50 gap-4">
        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
          <ShieldAlert size={14} className="text-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-tight">Requiere supervisión facultativa médica</span>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-200"
        >
          {isSaving ? 'Sincronizando...' : (
            <><Save size={18} /> Aplicar Cambios Clínicos</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-green-600 font-bold text-xs"
          >
            <CheckCircle2 size={16} /> Parámetros actualizados en el expediente digital.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalSettings;