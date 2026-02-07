import React, { useState, useRef, useMemo } from 'react';
import { CloudArrowUpIcon, CheckCircleIcon, XMarkIcon, DocumentTextIcon, SparklesIcon, XCircleIcon, ClockIcon, InformationCircleIcon, ArrowRightIcon, ActivityIcon } from '../ui/Icons';
import Spinner from './Spinner';
import { parseGlucometerData } from '../../services/geminiService';
import type { HistoryEntry, ImportedGlucoseEntry, MealType, UserData } from '../../types';

interface SmartImportModalProps {
  onClose: () => void;
  onSave: (entries: ImportedGlucoseEntry[]) => Promise<void>;
  existingHistory: HistoryEntry[];
  currentUser: UserData | null;
}

type ImportStep = 'UPLOAD' | 'CONFIG' | 'PREVIEW' | 'SAVING' | 'SUCCESS';

interface ExtendedImportEntry extends ImportedGlucoseEntry {
    assignedMealType: MealType;
}

// Added SlotConfig interface to resolve TypeScript 'unknown' type errors during iteration
interface SlotConfig {
    start: string;
    end: string;
}

// Added explicit type to DEFAULT_SLOTS
const DEFAULT_SLOTS: Record<string, SlotConfig> = {
    desayuno: { start: "06:00", end: "10:00" },
    snackManana: { start: "10:01", end: "12:30" },
    almuerzo: { start: "12:31", end: "15:30" },
    snackTarde: { start: "15:31", end: "18:30" },
    cena: { start: "18:31", end: "21:30" },
    snackNoche: { start: "21:31", end: "23:59" }
};

const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const SmartImportModal: React.FC<SmartImportModalProps> = ({ onClose, onSave, existingHistory, currentUser }) => {
  const [step, setStep] = useState<ImportStep>('UPLOAD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawResults, setRawResults] = useState<ImportedGlucoseEntry[]>([]);
  // Explicitly type the slots state to allow property access and spreading
  const [slots, setSlots] = useState<Record<string, SlotConfig>>(DEFAULT_SLOTS);
  const isPro = currentUser?.subscription_tier === 'PRO';

  const inputRef = useRef<HTMLInputElement>(null);

  const classifyEntry = (entry: ImportedGlucoseEntry): MealType => {
      if (entry.originalLabel?.toLowerCase().includes('ejercicio')) return 'snack-deportivo';
      
      const date = new Date(entry.date);
      const minutes = date.getHours() * 60 + date.getMinutes();

      if (minutes >= timeToMinutes(slots.desayuno.start) && minutes <= timeToMinutes(slots.desayuno.end)) return 'desayuno';
      if (minutes >= timeToMinutes(slots.snackManana.start) && minutes <= timeToMinutes(slots.snackManana.end)) return 'snack-manana';
      if (minutes >= timeToMinutes(slots.almuerzo.start) && minutes <= timeToMinutes(slots.almuerzo.end)) return 'almuerzo';
      if (minutes >= timeToMinutes(slots.snackTarde.start) && minutes <= timeToMinutes(slots.snackTarde.end)) return 'snack-tarde';
      if (minutes >= timeToMinutes(slots.cena.start) && minutes <= timeToMinutes(slots.cena.end)) return 'cena';
      return 'snack-noche';
  };

  const processedData = useMemo(() => {
      const entries = rawResults.map(r => ({ ...r, assignedMealType: classifyEntry(r) }));
      const distribution = entries.reduce((acc: any, curr) => {
          acc[curr.assignedMealType] = (acc[curr.assignedMealType] || 0) + 1;
          return acc;
      }, {});
      const anomalies = entries.filter(e => e.value > 180);
      return { entries, distribution, anomalies };
  }, [rawResults, slots]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsProcessing(true);
      try {
          const content = await file.text();
          const results = await parseGlucometerData({ content, isBase64: false, mimeType: file.type });
          setRawResults(results);
          setStep('CONFIG');
      } catch (err) {
          alert("No pudimos procesar la estructura del archivo. Intenta con un CSV estándar.");
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[130] p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl relative border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER PROTOCOLARIO */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-xl">
                    <CloudArrowUpIcon className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ingesta Médica IA</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protocolo de Clasificación Masiva</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
            {step === 'UPLOAD' && (
                <div className="text-center py-10 space-y-6">
                    <div className="w-24 h-24 bg-blue-50 text-brand-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        {isProcessing ? <Spinner /> : <DocumentTextIcon className="w-12 h-12" />}
                    </div>
                    <div className="max-w-xs mx-auto">
                        <h4 className="text-xl font-black text-slate-800 mb-2">Carga tu Reporte Clínico</h4>
                        <p className="text-sm text-slate-500 font-medium">Procesamos CSV de LibreView, Dexcom o glucómetros Accu-Chek en segundos.</p>
                    </div>
                    <input ref={inputRef} type="file" className="hidden" onChange={handleFile} accept=".csv,.txt" />
                    <button 
                        onClick={() => inputRef.current?.click()} 
                        disabled={isProcessing}
                        className="px-10 py-4 bg-brand-primary text-white font-black rounded-2xl shadow-xl hover:bg-brand-dark transition-all transform active:scale-95"
                    >
                        Seleccionar Archivo
                    </button>
                </div>
            )}

            {step === 'CONFIG' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0" />
                        <p className="text-xs text-blue-800 font-medium">He configurado tus horarios estándar. ¿Deseas ajustar los slots antes de que organice tus <strong>{rawResults.length}</strong> mediciones?</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {/* FIX: Cast 'val' to 'SlotConfig' to resolve TypeScript 'unknown' errors when accessing 'start' and 'end' properties during iteration */}
                        {Object.entries(slots).map(([key, val]) => {
                            const slotVal = val as SlotConfig;
                            return (
                                <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">{key}</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="time" 
                                            value={slotVal.start} 
                                            onChange={(e) => setSlots({...slots, [key]: {...slotVal, start: e.target.value}})}
                                            className="bg-transparent text-xs font-bold outline-none" 
                                        />
                                        <span className="text-slate-300">-</span>
                                        <input 
                                            type="time" 
                                            value={slotVal.end} 
                                            onChange={(e) => setSlots({...slots, [key]: {...slotVal, end: e.target.value}})}
                                            className="bg-transparent text-xs font-bold outline-none" 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        onClick={() => setStep('PREVIEW')}
                        className="w-full py-4 bg-brand-primary text-white font-black rounded-2xl shadow-lg hover:bg-brand-dark flex items-center justify-center gap-2"
                    >
                        Procesar con IA <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {step === 'PREVIEW' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                        <SparklesIcon className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
                        <h4 className="text-sm font-black uppercase tracking-widest mb-4">Análisis de Ingesta</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Mediciones</p>
                                <p className="text-3xl font-black">{processedData.entries.length}</p>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Anomalías (>180)</p>
                                <p className="text-3xl font-black text-orange-400">{processedData.anomalies.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Distribución Detectada</h5>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(processedData.distribution).map(([meal, count]: any) => (
                                <div key={meal} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-700 capitalize">{meal.replace(/([A-Z])/g, ' $1')}</span>
                                    <span className="text-xs font-black text-brand-primary">{count} registros</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isPro && rawResults.length > 20 && (
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4 items-center">
                            <SparklesIcon className="w-8 h-8 text-brand-primary shrink-0" />
                            <p className="text-[10px] text-indigo-900 font-bold leading-tight">
                                🎁 Has importado datos valiosos. En <span className="text-indigo-600 font-black">VitaMetra PRO</span>, cruzaré estos datos con tus audios de comidas para diagnosticar qué alimentos causaron tus {processedData.anomalies.length} anomalías.
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={async () => {
                            setIsProcessing(true);
                            await onSave(processedData.entries);
                            setIsProcessing(false);
                            setStep('SUCCESS');
                        }}
                        disabled={isProcessing}
                        className="w-full py-4 bg-brand-secondary text-white font-black rounded-2xl shadow-lg hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Spinner /> : <><CheckCircleIcon className="w-5 h-5" /> Confirmar e Integrar Diario</>}
                    </button>
                </div>
            )}

            {step === 'SUCCESS' && (
                <div className="text-center py-10 space-y-6 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircleIcon className="w-12 h-12" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-800">¡Integración Exitosa!</h4>
                        <p className="text-sm text-slate-500 font-medium">Tus {rawResults.length} registros clínicos han sido clasificados y guardados.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all"
                    >
                        Ver mi Historial
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SmartImportModal;