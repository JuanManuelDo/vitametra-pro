
import React, { useState, useEffect } from 'react';
import type { HistoryEntry, MealType, FoodItem, UserData } from '../types';
import { XMarkIcon, CheckCircleIcon, SparklesIcon, LockClosedIcon, ClockIcon } from './Icons';
import Spinner from './Spinner';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

interface AddHistoryEntryModalProps {
  initialDate: Date;
  initialMealType: MealType;
  history: HistoryEntry[]; 
  currentUser: UserData;
  onClose: () => void;
  onSave: (entry: Omit<HistoryEntry, 'id'>) => Promise<void>;
}

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
    { value: 'desayuno', label: 'Desayuno' },
    { value: 'snack-manana', label: 'Snack (Mañana)' },
    { value: 'almuerzo', label: 'Almuerzo' },
    { value: 'snack-tarde', label: 'Snack (Tarde)' },
    { value: 'cena', label: 'Cena' },
    { value: 'snack-noche', label: 'Snack (Noche)' },
    { value: 'snack-deportivo', label: 'Pre-Deporte' },
];

const AddHistoryEntryModal: React.FC<AddHistoryEntryModalProps> = ({ initialDate, initialMealType, history, currentUser, onClose, onSave }) => {
  const navigate = useNavigate();
  const isPro = currentUser.subscription_tier === 'PRO';
  
  const getLocalISOString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [date, setDate] = useState(getLocalISOString(initialDate));
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [bloodGlucose, setBloodGlucose] = useState<string>('');
  const [totalCarbs, setTotalCarbs] = useState<string>('');
  const [insulinDose, setInsulinDose] = useState<string>('');
  const [foodDetail, setFoodDetail] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMealType(initialMealType);
  }, [initialMealType]);

  const handlePositiveValue = (value: string, setter: (v: string) => void) => {
      const num = parseFloat(value);
      if (num < 0) {
          setter('0');
          setErrorMsg("Los valores clínicos no pueden ser negativos.");
      } else {
          setter(value);
          setErrorMsg(null);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bgNum = parseFloat(bloodGlucose);
    const carbsNum = parseFloat(totalCarbs);
    const insulinNum = parseFloat(insulinDose);

    if (bgNum < 0 || carbsNum < 0 || insulinNum < 0) {
        setErrorMsg("⚠️ No se permiten valores negativos. Por favor verifica tus datos.");
        return;
    }

    if (!totalCarbs && !bloodGlucose && !foodDetail) {
        alert("Por favor ingresa al menos un dato para el registro.");
        return;
    }
    
    if (!totalCarbs && foodDetail && !isPro) {
        alert("En el plan BASE, debes ingresar los carbohidratos manualmente para guardar el registro.");
        return;
    }

    setIsSaving(true);
    try {
        const finalCarbs = Math.max(0, carbsNum || 0);
        const generatedItems: FoodItem[] = foodDetail ? 
            [{ food: foodDetail, totalCarbs: finalCarbs, category: 'base', fiber: 0, protein: 0, fat: 0, calories: 0 }] : [];
        
        await onSave({
            userId: currentUser.id,
            date: new Date(date).toISOString(),
            mealType,
            userInput: foodDetail || 'Ingreso Rápido',
            totalCarbs: finalCarbs,
            items: generatedItems,
            glycemicIndex: 'medio',
            bloodGlucoseValue: bloodGlucose ? Math.max(0, bgNum) : undefined,
            bloodGlucoseUnit: currentUser.glucoseUnitPreference || 'mg/dL',
            finalInsulinUnits: insulinDose ? Math.max(0, insulinNum) : undefined,
            recommendedInsulinUnits: insulinDose ? Math.max(0, insulinNum) : undefined,
        });
    } catch (error) {
        alert("Error al guardar el registro clínico.");
    } finally {
        setIsSaving(false);
    }
  };

  const hasNegative = parseFloat(bloodGlucose) < 0 || parseFloat(totalCarbs) < 0 || parseFloat(insulinDose) < 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[130] p-4 animate-fade-in backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg relative border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
            <div>
                <h3 className="text-xl font-black text-[#1e3a8a] tracking-tight uppercase">Nuevo Registro Clínico</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ingreso Manual de Ingesta</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-100">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-6 bg-white">
            {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase text-center animate-fade-in">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha y Hora</label>
                    <input 
                        type="datetime-local" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 transition-all" 
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                    <select 
                        value={mealType} 
                        onChange={(e) => setMealType(e.target.value as MealType)} 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 transition-all"
                    >
                        {MEAL_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">¿Qué vas a comer?</label>
                <textarea 
                    value={foodDetail} 
                    onChange={(e) => setFoodDetail(e.target.value)} 
                    placeholder="Ej: 1 taza de arroz con pollo y ensalada..." 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[100px] focus:ring-4 focus:ring-blue-100 outline-none font-medium transition-all" 
                />
            </div>

            <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 text-center">Glucemia</label>
                        <input 
                            type="number" 
                            min="0"
                            step="1"
                            value={bloodGlucose} 
                            onChange={(e) => handlePositiveValue(e.target.value, setBloodGlucose)} 
                            placeholder="mg/dL" 
                            className={`w-full p-3 bg-white border ${parseFloat(bloodGlucose) < 0 ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'} rounded-xl text-center text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none transition-all`} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2 ml-1 text-center">Carbos (g)</label>
                        <input 
                            type="number" 
                            min="0"
                            step="0.5"
                            value={totalCarbs} 
                            onChange={(e) => handlePositiveValue(e.target.value, setTotalCarbs)} 
                            placeholder="Manual" 
                            className={`w-full p-3 bg-white border-2 ${parseFloat(totalCarbs) < 0 ? 'border-red-500' : 'border-brand-secondary/30'} rounded-xl text-center text-sm font-black focus:ring-4 focus:ring-green-100 outline-none transition-all`} 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-2 ml-1 text-center">Insulina</label>
                        <input 
                            type="number" 
                            min="0"
                            step="0.1"
                            value={insulinDose} 
                            onChange={(e) => handlePositiveValue(e.target.value, setInsulinDose)} 
                            placeholder="UI" 
                            className={`w-full p-3 bg-white border ${parseFloat(insulinDose) < 0 ? 'border-red-500' : 'border-slate-200'} rounded-xl text-center text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none transition-all`} 
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 bg-white">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-6 py-4 rounded-xl text-slate-400 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={isSaving || hasNegative} 
                    className="px-10 py-4 rounded-xl bg-[#1e3a8a] text-white font-black transition-all shadow-xl shadow-blue-900/20 hover:bg-black flex items-center gap-2 text-xs uppercase tracking-widest transform active:scale-95 disabled:bg-slate-300"
                >
                    {isSaving ? <Spinner /> : 'Guardar Registro'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddHistoryEntryModal;
