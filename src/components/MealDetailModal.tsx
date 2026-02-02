
import React from 'react';
import type { HistoryEntry, MealType } from '../types';
import { XMarkIcon, SunIcon, MoonIcon, BuildingOfficeIcon, CubeIcon, PersonCycleIcon, PencilIcon, BloodDropIcon } from './Icons';

interface MealDetailModalProps {
  entry: HistoryEntry;
  onClose: () => void;
  onEdit: () => void;
}

const mealTypeDetails: { [key in MealType]: { Icon: React.FC<{className?: string}>, label: string } } = {
    desayuno: { Icon: SunIcon, label: 'Desayuno' },
    almuerzo: { Icon: BuildingOfficeIcon, label: 'Almuerzo' },
    cena: { Icon: MoonIcon, label: 'Cena' },
    'snack-manana': { Icon: CubeIcon, label: 'Snack Mañana' },
    'snack-tarde': { Icon: CubeIcon, label: 'Snack Tarde' },
    'snack-noche': { Icon: CubeIcon, label: 'Snack Noche' },
    'snack-deportivo': { Icon: PersonCycleIcon, label: 'Snack Deportivo' },
};

const MealDetailModal: React.FC<MealDetailModalProps> = ({ entry, onClose, onEdit }) => {
  const details = mealTypeDetails[entry.mealType];
  const { Icon, label } = details;

  const insulinDisplay = entry.finalInsulinUnits 
    ? entry.finalInsulinUnits.toFixed(1) 
    : (entry.recommendedInsulinUnits ? entry.recommendedInsulinUnits.toFixed(1) : '-');

  const glucoseDisplay = entry.bloodGlucoseValue 
    ? `${entry.bloodGlucoseValue} ${entry.bloodGlucoseUnit || 'mg/dL'}`
    : '-';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative border border-[#E2E8F0] opacity-100" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Compacto */}
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-primary/10 rounded-full">
                    <Icon className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-[#1A202C]">{label}</h3>
                    <p className="text-sm text-[#4A5568] font-bold">
                        {new Date(entry.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.date).toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})}
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* --- HERO METRICS GRID --- */}
        <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                <p className="text-[10px] text-green-600 uppercase font-black tracking-wider mb-1">Carbos</p>
                <p className="text-2xl font-black text-[#1A202C]">{entry.totalCarbs.toFixed(0)}<span className="text-sm font-medium text-slate-500 ml-0.5">g</span></p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                <p className="text-[10px] text-blue-600 uppercase font-black tracking-wider mb-1">Dosis (UI)</p>
                <p className={`text-2xl font-black ${insulinDisplay === '-' ? 'text-slate-300' : 'text-[#1A202C]'}`}>
                    {insulinDisplay}
                </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0] text-center relative overflow-hidden">
                <BloodDropIcon className="w-12 h-12 text-slate-200 absolute -bottom-2 -right-2 opacity-50" />
                <p className="text-[10px] text-[#4A5568] uppercase font-black tracking-wider mb-1">Glucemia</p>
                <p className={`text-lg font-black flex items-center justify-center h-8 ${glucoseDisplay === '-' ? 'text-slate-300' : 'text-[#1A202C]'}`}>
                    {glucoseDisplay}
                </p>
            </div>
        </div>

        {/* User Context */}
        {entry.userInput && (
            <div className="mb-6">
                <p className="text-xs text-[#4A5568] uppercase font-black mb-1 tracking-widest ml-1">Tu Registro Original</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-[#E2E8F0] italic text-[#1A202C] text-sm font-medium">
                    "{entry.userInput}"
                </div>
            </div>
        )}
        
        {/* Food List */}
        <div className="mb-6">
            <h4 className="font-black text-[#1A202C] mb-3 text-sm flex items-center justify-between uppercase tracking-wider ml-1">
                <span>Desglose de Alimentos</span>
                <span className="text-xs font-bold text-slate-400">{entry.items.length} items</span>
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {entry.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E2E8F0] transition-colors">
                        <span className="text-[#1A202C] text-sm font-bold">{item.food}</span>
                        <span className="font-black text-brand-secondary text-sm bg-green-50 px-2 py-0.5 rounded-md">
                            {item.totalCarbs.toFixed(1)} g
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
            <button 
                onClick={onClose} 
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#4A5568] font-black transition-colors text-xs uppercase tracking-widest"
            >
                Cerrar
            </button>
            <button 
                onClick={onEdit} 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary hover:bg-brand-dark text-white font-black transition-all shadow-md text-xs uppercase tracking-widest"
            >
                <PencilIcon className="w-4 h-4" />
                Editar Registro
            </button>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;
