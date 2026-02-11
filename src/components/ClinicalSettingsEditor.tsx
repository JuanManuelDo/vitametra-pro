import React, { useState } from 'react';
import { Activity, Save } from 'lucide-react';
import { apiService } from '../services/apiService';
import type { UserData, DiabetesType } from '../types';

interface ClinicalSettingsEditorProps {
  currentUser: UserData;
  onUpdate: (updatedData: Partial<UserData>) => void;
}

const ClinicalSettingsEditor: React.FC<ClinicalSettingsEditorProps> = ({ currentUser, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    diabetesType: currentUser.clinicalConfig?.diabetesType || 'Type 1',
    isf: currentUser.clinicalConfig?.insulinSensitivityFactor || 50,
    target: currentUser.clinicalConfig?.targetGlucose || 100,
    ratio: currentUser.insulinRatioSchedule?.[0]?.ratio || 15
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProfile: Partial<UserData> = {
        id: currentUser.id,
        clinicalConfig: {
          ...currentUser.clinicalConfig,
          diabetesType: config.diabetesType as DiabetesType,
          insulinSensitivityFactor: config.isf,
          targetGlucose: config.target
        },
        insulinRatioSchedule: [
          { startTime: "08:00", ratio: config.ratio }
        ]
      };

      await apiService.updateUser(updatedProfile as UserData);
      onUpdate(updatedProfile);
      alert("✅ Parámetros recalibrados con éxito");
    } catch (error) {
      console.error(error);
      alert("❌ Error al sincronizar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tighter text-slate-900 uppercase leading-none">Calibración</h3>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Motor Clínico</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* TIPO */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Condición</label>
          <select 
            value={config.diabetesType}
            onChange={(e) => setConfig({...config, diabetesType: e.target.value as DiabetesType})}
            className="w-full bg-white p-3 rounded-xl font-bold text-slate-700 outline-none border border-slate-200"
          >
            <option value="Type 1">Tipo 1</option>
            <option value="Type 2">Tipo 2</option>
            <option value="LADA">LADA</option>
          </select>
        </div>

        {/* RATIO */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ratio (1U:{config.ratio}g)</label>
            <span className="text-lg font-black text-blue-600">{config.ratio}</span>
          </div>
          <input 
            type="range" min="1" max="40" 
            value={config.ratio} 
            onChange={(e) => setConfig({...config, ratio: parseInt(e.target.value)})}
            className="w-full accent-blue-600"
          />
        </div>

        {/* ISF */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Sensibilidad ({config.isf})</label>
            <span className="text-lg font-black text-emerald-600">{config.isf}</span>
          </div>
          <input 
            type="range" min="10" max="200" step="5"
            value={config.isf} 
            onChange={(e) => setConfig({...config, isf: parseInt(e.target.value)})}
            className="w-full accent-emerald-500"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : <><Save size={16} /> Aplicar Cambios</>}
        </button>
      </div>
    </div>
  );
};

export default ClinicalSettingsEditor;