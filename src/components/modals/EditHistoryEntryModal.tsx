
import React, { useState, useEffect } from 'react';
import type { HistoryEntry, FoodItem, UserData, MealType } from '../../types';
import { 
    XMarkIcon, SparklesIcon, TrashIcon, PlusIcon, CheckCircleIcon, LockClosedIcon, InformationCircleIcon,
    SunIcon, MoonIcon, BuildingOfficeIcon, CubeIcon, PersonCycleIcon 
} from '../ui/Icons';
import Spinner from './Spinner';
import { analyzeFoodText } from '../../services/geminiService';

interface EditHistoryEntryModalProps {
  entry: HistoryEntry;
  currentUser: UserData;
  onClose: () => void;
  onSave: (updatedEntry: HistoryEntry) => Promise<void>;
  onOpenChatbot: (context: string) => void;
}

const MEAL_CONTEXT_MAP: Record<MealType, { label: string, Icon: React.FC<{className?: string}>, colorClass: string }> = {
    'desayuno': { label: 'Desayuno', Icon: SunIcon, colorClass: 'text-orange-600 bg-orange-50 border-orange-200' },
    'almuerzo': { label: 'Almuerzo', Icon: BuildingOfficeIcon, colorClass: 'text-blue-600 bg-blue-50 border-blue-200' },
    'cena': { label: 'Cena', Icon: MoonIcon, colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    'snack-manana': { label: 'Snack Mañana', Icon: CubeIcon, colorClass: 'text-slate-600 bg-slate-50 border-slate-200' },
    'snack-tarde': { label: 'Snack Tarde', Icon: CubeIcon, colorClass: 'text-slate-600 bg-slate-50 border-slate-200' },
    'snack-noche': { label: 'Snack Noche', Icon: CubeIcon, colorClass: 'text-slate-600 bg-slate-50 border-slate-200' },
    'snack-deportivo': { label: 'Pre-Deporte', Icon: PersonCycleIcon, colorClass: 'text-green-600 bg-green-50 border-green-200' },
};

const EditHistoryEntryModal: React.FC<EditHistoryEntryModalProps> = ({ entry, currentUser, onClose, onSave, onOpenChatbot }) => {
  const [formData, setFormData] = useState<HistoryEntry>(entry);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualDoseEdit, setManualDoseEdit] = useState(false);

  const isPro = currentUser.subscription_tier === 'PRO';
  const userRatio = currentUser.clinicalConfig?.insulinToCarbRatio || 10;

  useEffect(() => { setFormData(entry); setManualDoseEdit(false); }, [entry]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue = value === '' ? '' : parseFloat(value);
    
    // Validación Shark: Impedir negativos y feedback instantáneo
    if (typeof numValue === 'number' && numValue < 0) {
        numValue = 0;
        setError("Los valores clínicos no pueden ser negativos.");
    } else {
        setError(null);
    }

    setFormData(prev => {
        const newData: any = { ...prev, [name]: numValue };
        if (name === 'totalCarbs' && !manualDoseEdit && typeof numValue === 'number') {
             newData.finalInsulinUnits = parseFloat((numValue / userRatio).toFixed(1));
        }
        return newData;
    });
    if (name === 'finalInsulinUnits') setManualDoseEdit(true);
  };

  const handleItemChange = (index: number, field: keyof FoodItem, value: string | number) => {
    const newItems = [...formData.items];
    let finalValue = value;
    if (field === 'totalCarbs' && typeof value === 'number') {
        finalValue = Math.max(0, value);
    }
    newItems[index] = { ...newItems[index], [field]: finalValue } as any;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleDeleteItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    const newItem: FoodItem = { food: '', totalCarbs: 0, category: 'base', fiber: 0, fat: 0, protein: 0, calories: 0 };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const currentTotalCarbs = Number(formData.totalCarbs) || 0;
  const hasFoodItems = formData.items.some(i => i.food.trim().length > 0);
  const hasZeroOrEmptyCarbs = !formData.totalCarbs || formData.totalCarbs === 0;
  const isInvalidState = hasFoodItems && hasZeroOrEmptyCarbs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalidState) return;

    // Validación Final
    if ((formData.bloodGlucoseValue || 0) < 0 || (formData.totalCarbs || 0) < 0 || (formData.finalInsulinUnits || 0) < 0) {
        setError("⚠️ Verifica que no existan valores negativos.");
        return;
    }

    setIsSaving(true);
    try {
      const cleanedData: HistoryEntry = {
          ...formData,
          totalCarbs: Math.max(0, Number(formData.totalCarbs) || 0),
          bloodGlucoseValue: formData.bloodGlucoseValue !== undefined && (formData.bloodGlucoseValue as any) !== '' ? Math.max(0, Number(formData.bloodGlucoseValue)) : undefined,
          finalInsulinUnits: formData.finalInsulinUnits !== undefined && (formData.finalInsulinUnits as any) !== '' ? Math.max(0, Number(formData.finalInsulinUnits)) : undefined,
      };
      await onSave(cleanedData);
    } catch (err) {
      setError('Error guardando cambios.');
      setIsSaving(false);
    }
  };

  const handleCalculateWithAI = async () => {
      if (!isPro) return; 
      const foodsToAnalyze = formData.items.map(i => i.food).filter(f => f.trim() !== '').join(', ');
      if (!foodsToAnalyze) { setError("Escribe los alimentos primero."); return; }
      setIsAnalyzing(true);
      setError(null);
      try {
          const result = await analyzeFoodText(foodsToAnalyze);
          setFormData(prev => {
              const newTotalCarbs = Math.max(0, result.totalCarbs);
              let newDose = prev.finalInsulinUnits;
              if (!manualDoseEdit) newDose = parseFloat((newTotalCarbs / userRatio).toFixed(1));
              return { ...prev, items: result.items, totalCarbs: newTotalCarbs, finalInsulinUnits: newDose, glycemicIndex: result.glycemicIndex };
          });
      } catch (err) { setError("IA no disponible."); } finally { setIsAnalyzing(false); }
  };

  const context = MEAL_CONTEXT_MAP[formData.mealType] || MEAL_CONTEXT_MAP['snack-manana'];
  const formattedTime = new Date(formData.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[130] p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] min-h-[450px] flex flex-col relative border border-[#E2E8F0] opacity-100" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-5 border-b border-slate-100 bg-slate-50 rounded-t-xl shrink-0">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-brand-primary">Editando Registro</h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${context.colorClass} text-[10px] font-extrabold uppercase`}>
                        <context.Icon className="w-3 h-3" /> {context.label}
                    </div>
                </div>
                <p className="text-slate-500 text-xs">Registro de las <strong>{formattedTime}</strong>.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-all">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-[#4A5568] uppercase mb-1">Glucemia (mg/dL)</label>
                        <input 
                            type="number" 
                            min="0"
                            step="1"
                            name="bloodGlucoseValue" 
                            value={formData.bloodGlucoseValue || ''} 
                            onChange={handleMetricChange} 
                            className={`w-full p-2 bg-white border ${(formData.bloodGlucoseValue || 0) < 0 ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg text-sm font-bold text-[#1A202C]`} 
                            placeholder="Ej: 110" 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-brand-secondary uppercase mb-1">Carbohidratos (g)</label>
                        <input 
                            type="number" 
                            min="0"
                            name="totalCarbs" 
                            step="0.5" 
                            value={formData.totalCarbs} 
                            onChange={handleMetricChange} 
                            className={`w-full p-2 bg-white border ${(formData.totalCarbs || 0) < 0 ? 'border-red-500' : 'border-brand-secondary/30'} rounded-lg text-sm font-black text-[#1A202C]`} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-brand-primary uppercase mb-1">Dosis (UI) {!manualDoseEdit && 'Auto'}</label>
                        <input 
                            type="number" 
                            min="0"
                            name="finalInsulinUnits" 
                            step="0.1" 
                            value={formData.finalInsulinUnits || formData.recommendedInsulinUnits || ''} 
                            onChange={handleMetricChange} 
                            className={`w-full p-2 border rounded-lg text-sm font-bold text-[#1A202C] ${manualDoseEdit ? 'bg-white border-[#E2E8F0]' : 'border-brand-primary/30 bg-blue-50/50'} ${(formData.finalInsulinUnits || 0) < 0 ? 'border-red-500' : ''}`} 
                        />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-[#1A202C] text-sm uppercase tracking-wider">Desglose de Alimentos</h4>
                    <button type="button" onClick={handleCalculateWithAI} disabled={!isPro || isAnalyzing || !hasFoodItems} className="text-[10px] bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-black px-3 py-1 rounded-full transition-all flex items-center gap-1 disabled:opacity-50">
                        {isAnalyzing ? <Spinner /> : <SparklesIcon className="w-3 h-3" />} Recalcular IA
                    </button>
                </div>

                <div className="space-y-3">
                    {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input type="text" value={item.food} onChange={(e) => handleItemChange(index, 'food', e.target.value)} className="flex-grow p-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#1A202C]" placeholder="Alimento..." />
                            <input type="number" min="0" step="0.5" value={item.totalCarbs} onChange={(e) => handleItemChange(index, 'totalCarbs', parseFloat(e.target.value) || 0)} className={`w-20 p-2 bg-white border ${item.totalCarbs < 0 ? 'border-red-500' : 'border-[#E2E8F0]'} rounded-lg text-sm text-right font-bold text-brand-secondary`} />
                            <button type="button" onClick={() => handleDeleteItem(index)} className="text-slate-400 hover:text-red-500 p-1"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={handleAddItem} className="mt-3 text-xs text-brand-secondary font-black hover:underline flex items-center gap-1 uppercase tracking-widest"><PlusIcon className="w-4 h-4" /> Añadir otro</button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center font-bold">{error}</div>}
            
            <div className="h-12"></div>
        </form>

        <div className="p-5 border-t border-slate-100 bg-white rounded-b-xl flex justify-end gap-3 shrink-0 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm">Cancelar</button>
            <button onClick={handleSubmit} disabled={isSaving || isInvalidState || !!error} className="px-6 py-2.5 rounded-lg bg-brand-secondary hover:bg-green-600 text-white font-black transition-all shadow-lg flex items-center gap-2 text-sm uppercase tracking-widest">
                {isSaving ? <Spinner /> : <><CheckCircleIcon className="w-5 h-5" /> Guardar Cambios</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditHistoryEntryModal;
