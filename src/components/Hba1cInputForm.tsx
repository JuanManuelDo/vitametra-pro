import React, { useState, useMemo, useEffect } from 'react'
import type { Hba1cEntry } from '../types'
import Spinner from './ui/Spinner'
import { XMarkIcon } from './ui/Icons'

interface Hba1cInputFormProps {
  // Corregido: Se añadió la coma faltante después de 'MMOL_MOL'
  onSave: (entryData: { value: number; unit: 'PERCENT' | 'MMOL_MOL'; date: string; id?: string }) => Promise<void>;
  entryToEdit?: Hba1cEntry | null;
  onCancel?: () => void;
  isCompact?: boolean;
}

const Hba1cInputForm: React.FC<Hba1cInputFormProps> = ({ onSave, entryToEdit, onCancel, isCompact = false }) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmData, setConfirmData] = useState<{ value: string; date: string } | null>(null);

  useEffect(() => {
    if (entryToEdit) {
      setValue(entryToEdit.value.toString());
      setDate(new Date(entryToEdit.date).toISOString().split('T')[0]);
    } else {
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [entryToEdit]);

  const eAG = useMemo(() => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return null;

    // Heurística: si es < 20 asumimos %, si no mmol/mol
    const isLikelyPercent = numValue < 20;
    
    let percentValue = numValue;
    if (!isLikelyPercent) {
      // Convertir mmol/mol a %
      percentValue = (0.0915 * numValue) + 2.15;
    }

    const calculatedEAG = (28.7 * percentValue) - 46.7;
    return calculatedEAG.toFixed(0);
  }, [value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError('Por favor, introduce un valor numérico válido y positivo.');
      return;
    }
    if (!date) {
      setError('Por favor, selecciona la fecha del examen.');
      return;
    }
    setConfirmData({ value, date });
  };

  const handleConfirmAndSave = async (unit: 'PERCENT' | 'MMOL_MOL') => {
    if (!confirmData) return;
    setIsSaving(true);
    setError('');
    try {
      await onSave({
        id: entryToEdit?.id,
        value: parseFloat(confirmData.value),
        unit,
        date: new Date(confirmData.date).toISOString(),
      });
      setConfirmData(null);
      if (!entryToEdit) {
        setValue('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      if (onCancel) onCancel();
    } catch (err) {
      setError('Error al guardar el registro.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formTitle = entryToEdit ? 'Editar Examen de HbA1c' : 'Registrar Nuevo Examen de HbA1c'

  return (
    <>
      <form onSubmit={handleSubmit} className={isCompact ? '' : 'bg-brand-surface dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700'}>
        <h3 className={`font-semibold text-slate-700 dark:text-slate-300 ${isCompact ? 'mb-2' : 'mb-4'}`}>{formTitle}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hba1cValue" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Valor</label>
              <input
                type="number"
                id="hba1cValue"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ej: 6.8 o 51"
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="hba1cDate" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                id="hba1cDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
          
          {eAG && !isCompact && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-brand-primary rounded-r-md">
              <p className="text-sm font-semibold text-brand-dark dark:text-blue-300">Glucosa Media Estimada (eAG):</p>
              <p className="text-xl font-bold text-brand-primary dark:text-blue-400">{eAG} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">mg/dL</span></p>
            </div>
          )}
          
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className={`flex gap-3 ${onCancel ? 'justify-end' : 'justify-start'}`}>
            {onCancel && (
                <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg">
                    Cancelar
                </button>
            )}
            <button
              type="submit"
              disabled={isSaving || !value || !date}
              className="w-full bg-brand-secondary hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSaving ? <Spinner /> : (entryToEdit ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </div>
      </form>
      
      {confirmData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm relative">
             <button onClick={() => setConfirmData(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-brand-primary mb-2">Confirmar Unidad</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
                Estás registrando el valor <strong className="text-slate-800 dark:text-white">{confirmData.value}</strong>.
                Por favor, confirma la unidad de medida correcta.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
                <button 
                    onClick={() => handleConfirmAndSave('PERCENT')} 
                    disabled={isSaving}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-semibold transition-colors disabled:bg-slate-300"
                >
                    {isSaving ? <Spinner/> : `Confirmar como ${confirmData.value}%`}
                </button>
                <button 
                    onClick={() => handleConfirmAndSave('MMOL_MOL')} 
                    disabled={isSaving}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-semibold transition-colors disabled:bg-slate-300"
                >
                    {isSaving ? <Spinner/> : `Confirmar como ${confirmData.value} mmol/mol`}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hba1cInputForm;