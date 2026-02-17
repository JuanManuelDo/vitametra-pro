import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Save, 
  Clock, 
  Plus, 
  Trash2, 
  ShieldAlert,
  Info,
  CheckCircle2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserData, InsulinRatioSegment } from '../../types';
// RUTA CORREGIDA: Apuntando a la nueva infraestructura
import { apiService } from '../../services/infrastructure/apiService';

interface MedicalSettingsProps {
  currentUser: UserData | null;
  onUpdate: (updatedUser: UserData) => void;
}

const MedicalSettings: React.FC<MedicalSettingsProps> = ({ currentUser, onUpdate }) => {
  const [ratios, setRatios] = useState<InsulinRatioSegment[]>([]);
  const [isf, setIsf] = useState<number>(50);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setRatios(currentUser.insulinRatioSchedule || [{ startTime: "08:00", ratio: 12 }]);
      setIsf(currentUser.clinicalConfig?.insulinSensitivityFactor || 50);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest italic">Sincronizando expediente clínico...</p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = {
        ...currentUser,
        insulinRatioSchedule: ratios,
        clinicalConfig: {
          ...(currentUser.clinicalConfig || {}),
          insulinSensitivityFactor: isf
        }
      };
      await apiService.updateUser(updatedData);
      onUpdate(updatedData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error en calibración:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSegment = () => {
    const lastRatio = ratios.length > 0 ? ratios[ratios.length - 1].ratio : 10;
    setRatios([...ratios, { startTime: "12:00", ratio: lastRatio }]);
  };

  const removeSegment = (index: number) => {
    if (ratios.length <= 1) return;
    setRatios(ratios.filter((_, i) => i !== index));
  };

  const isProfileEmpty = !currentUser.insulinRatioSchedule && !currentUser.clinicalConfig;

  if (isProfileEmpty && !showSuccess && ratios.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-12 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center"
      >
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
          <Stethoscope size={40} />
        </div>
        <h2 className="text-2xl font-[1000] text-slate-900 tracking-tighter uppercase italic mb-3">
          Configuración <span className="text-blue-600">Clínica Vacía</span>
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Para realizar cálculos de precisión, necesitamos tus ratios de insulina y factor de sensibilidad.
        </p>
        <button 
          onClick={addSegment}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 mx-auto hover:bg-blue-600 transition-all"
        >
          Comenzar Calibración <ChevronRight size={16} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl mb-10"
    >
      <header className="mb-10 border-b border-slate-50 pb-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Activity size={22} />
          </div>
          <h2 className="text-2xl font-[1000] text-slate-900 tracking-tighter uppercase italic">Calibración de Parámetros</h2>
        </div>
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tight leading-relaxed opacity-60">
          Algoritmos metabólicos de precisión para cálculo de bolos.
        </p>
      </header>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Clock size={14} className="text-blue-500" /> Ratios Insulina:Carbohidratos
          </h3>
          <button 
            onClick={addSegment}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center gap-1 border border-blue-100"
          >
            <Plus size={14} /> Añadir
          </button>
        </div>

        <div className="space-y-3">
          {ratios.map((segment, index) => (
            <motion.div 
              layout
              key={index} 
              className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-blue-100 hover:bg-white"
            >
              <div className="flex-1">
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">Inicio Bloque</label>
                <input 
                  type="time" 
                  value={segment.startTime}
                  onChange={(e) => {
                    const newRatios = [...ratios];
                    newRatios[index].startTime = e.target.value;
                    setRatios(newRatios);
                  }}
                  className="bg-transparent font-black text-slate-700 outline-none w-full text-lg"
                />
              </div>
              <div className="flex-1 border-l border-slate-200 pl-4">
                <label className="text-[8px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">Ratio (g/U)</label>
                <input 
                  type="number" 
                  value={segment.ratio}
                  onChange={(e) => {
                    const newRatios = [...ratios];
                    newRatios[index].ratio = parseFloat(e.target.value);
                    setRatios(newRatios);
                  }}
                  className="bg-transparent font-black text-slate-700 outline-none w-full text-lg"
                />
              </div>
              {ratios.length > 1 && (
                <button 
                  onClick={() => removeSegment(index)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-10 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute -top-10 -right-10 opacity-5 text-white rotate-12">
            <Activity size={200} />
        </div>
        <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Sensibilidad (ISF)</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed max-w-[280px]">
                Reducción de glucemia (mg/dL) por cada 1 unidad de insulina.
            </p>
            <div className="flex items-center gap-6">
                <input 
                    type="number" 
                    value={isf}
                    onChange={(e) => setIsf(parseFloat(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-4xl font-black text-white w-36 outline-none focus:ring-2 ring-blue-500 transition-all text-center"
                />
                <div className="space-y-1">
                    <span className="block text-xl font-black italic tracking-tighter">mg/dL</span>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">x 1 unidad</span>
                </div>
            </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-50 gap-4">
        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">
          <ShieldAlert size={14} className="text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-tight italic">Uso clínico bajo supervisión</span>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-100 italic"
        >
          {isSaving ? 'Sincronizando...' : (
            <><Save size={18} /> Actualizar Parámetros</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-emerald-50 rounded-2xl flex items-center justify-center gap-3 text-emerald-600 font-black text-[9px] uppercase tracking-widest"
          >
            <CheckCircle2 size={16} /> Calibración exitosa en nube médica.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MedicalSettings;