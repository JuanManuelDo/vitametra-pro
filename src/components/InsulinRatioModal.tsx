
import React, { useState, useEffect, useRef } from 'react';
import type { UserData, InsulinRatioSegment } from '../types';
import { minutesToTime, timeToMinutes } from '../utils/insulin';
import { XMarkIcon, PlusIcon, TrashIcon, CheckCircleIcon, ClockIcon, PencilIcon, SaveIcon } from './Icons';

interface InsulinRatioModalProps {
    currentUser: UserData;
    onClose: () => void;
    onSave: (schedule: InsulinRatioSegment[]) => void;
}

// Helper para convertir minutos a string de hora input
const minToTimeInput = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const InsulinRatioModal: React.FC<InsulinRatioModalProps> = ({ currentUser, onClose, onSave }) => {
    // Estado local para edición fluida
    const [schedule, setSchedule] = useState<InsulinRatioSegment[]>([]);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    
    // Estado para controlar qué celda se está editando: { rowIndex, field }
    const [editingCell, setEditingCell] = useState<{ index: number, field: 'startTime' | 'endTime' | 'ratio' } | null>(null);
    const [tempValue, setTempValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Inicialización: Asegurar orden y 00:00
    useEffect(() => {
        let loaded = currentUser.insulinRatioSchedule || [];
        // Sort
        loaded = [...loaded].sort((a, b) => a.startTime - b.startTime);
        // Ensure Base
        if (loaded.length === 0 || loaded[0].startTime !== 0) {
            /* Fix: insulinToCarbRatio is nested inside clinicalConfig */
            loaded = [{ startTime: 0, ratio: currentUser.clinicalConfig?.insulinToCarbRatio || 10 }, ...loaded];
        }
        setSchedule(loaded);
    }, [currentUser]);

    // Focus automático al editar
    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingCell]);

    // --- ACCIONES DE EDICIÓN ---

    const startEditing = (index: number, field: 'startTime' | 'endTime' | 'ratio', initialValue: string | number) => {
        // Bloqueos lógicos
        if (field === 'startTime' && index === 0) return; // No editar inicio de 00:00
        if (field === 'endTime' && index === schedule.length - 1) return; // No editar fin de último (siempre 23:59)

        setEditingCell({ index, field });
        setTempValue(initialValue.toString());
    };

    const commitEdit = () => {
        if (!editingCell) return;

        const { index, field } = editingCell;
        const newSchedule = [...schedule];
        
        if (field === 'ratio') {
            const val = parseFloat(tempValue);
            if (!isNaN(val) && val > 0) {
                newSchedule[index].ratio = val;
            }
        } else if (field === 'startTime') {
            // Editar el inicio de este segmento
            // Validaciones: Debe ser mayor que el inicio del anterior y menor que el inicio del siguiente
            const newMin = timeToMinutes(tempValue);
            const prevStart = newSchedule[index - 1].startTime; // Existe porque index > 0
            const nextStart = newSchedule[index + 1]?.startTime || 1440;

            if (newMin > prevStart && newMin < nextStart) {
                newSchedule[index].startTime = newMin;
            } else {
                // Feedback visual de error podría ir aquí (shake animation)
                // Por ahora, revertimos silenciosamente si es inválido para mantener consistencia
            }
        } else if (field === 'endTime') {
            // Editar el "Fin" de este segmento EQUIVALE a editar el "Inicio" del SIGUIENTE segmento
            const nextIndex = index + 1;
            if (newSchedule[nextIndex]) {
                const newMin = timeToMinutes(tempValue) + 1; // El inicio del siguiente es fin + 1 min
                const currentStart = newSchedule[index].startTime;
                const nextNextStart = newSchedule[nextIndex + 1]?.startTime || 1440;

                // El nuevo inicio del siguiente debe ser mayor al inicio actual y menor al inicio del subsiguiente
                if (newMin > currentStart && newMin < nextNextStart) {
                    newSchedule[nextIndex].startTime = newMin;
                }
            }
        }

        // Ordenar siempre por seguridad, aunque la lógica intenta mantener orden
        newSchedule.sort((a, b) => a.startTime - b.startTime);
        setSchedule(newSchedule);
        setEditingCell(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') setEditingCell(null);
    };

    // --- ACCIONES DE ESTRUCTURA ---

    const handleAddSegment = () => {
        // Encontrar el último segmento
        const lastSegment = schedule[schedule.length - 1];
        
        // Calcular nuevo punto de inicio: 
        // Si el último empieza antes de las 22:00, añadimos un corte 2 horas después o a medio camino de 24:00
        let newStart = lastSegment.startTime + 120; // +2 horas default
        if (newStart >= 1380) { // Si se pasa de las 23:00
             newStart = lastSegment.startTime + 60; // +1 hora
             if (newStart >= 1439) newStart = 1430; // 23:50 tope
        }
        
        // Evitar duplicados exactos
        if (newStart <= lastSegment.startTime) return;

        const newSegment = {
            startTime: newStart,
            ratio: lastSegment.ratio // Heredar ratio anterior para continuidad
        };

        const updated = [...schedule, newSegment].sort((a, b) => a.startTime - b.startTime);
        setSchedule(updated);
    };

    const handleDelete = (index: number) => {
        if (index === 0) return; // No borrar base
        const updated = schedule.filter((_, i) => i !== index);
        setSchedule(updated);
    };

    const handleSaveGlobal = () => {
        onSave(schedule);
        onClose();
    };

    // --- RENDER ---

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-brand-surface dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl relative border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                    <div>
                        <h3 className="text-xl font-bold text-brand-primary dark:text-blue-400">Gestionar Ratio I:C por Horario</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Configura cómo cambia tu sensibilidad a la insulina durante el día.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Table */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 w-1/4">Inicio</th>
                                    <th className="px-6 py-3 w-1/4">Fin</th>
                                    <th className="px-6 py-3 text-center">Ratio (1 : X)</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {schedule.map((seg, idx) => {
                                    // Calcular Fin Visual
                                    const nextSeg = schedule[idx + 1];
                                    const endMinutes = nextSeg ? nextSeg.startTime - 1 : 1439; // 23:59
                                    
                                    const startTimeStr = minToTimeInput(seg.startTime);
                                    const endTimeStr = minToTimeInput(endMinutes);

                                    const isEditingStart = editingCell?.index === idx && editingCell.field === 'startTime';
                                    const isEditingEnd = editingCell?.index === idx && editingCell.field === 'endTime';
                                    const isEditingRatio = editingCell?.index === idx && editingCell.field === 'ratio';

                                    // Determinar si celdas son editables
                                    const canEditStart = idx !== 0;
                                    const canEditEnd = idx !== schedule.length - 1;

                                    return (
                                        <tr 
                                            key={idx} 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                            onMouseEnter={() => setHoveredRow(idx)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            {/* COLUMNA INICIO */}
                                            <td className="px-6 py-3 relative">
                                                {isEditingStart ? (
                                                    <input 
                                                        ref={inputRef}
                                                        type="time"
                                                        value={tempValue}
                                                        onChange={e => setTempValue(e.target.value)}
                                                        onBlur={commitEdit}
                                                        onKeyDown={handleKeyDown}
                                                        className="w-full p-1 bg-white border-2 border-brand-primary rounded focus:outline-none font-mono text-center"
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => canEditStart && startEditing(idx, 'startTime', startTimeStr)}
                                                        className={`flex items-center gap-2 py-1 px-2 rounded-md transition-all ${
                                                            canEditStart 
                                                            ? 'cursor-pointer hover:bg-white hover:shadow-sm hover:text-brand-primary border border-transparent hover:border-slate-200' 
                                                            : 'opacity-60 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <ClockIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="font-mono font-medium">{startTimeStr}</span>
                                                        {canEditStart && hoveredRow === idx && <PencilIcon className="w-3 h-3 text-slate-300 ml-auto" />}
                                                    </div>
                                                )}
                                            </td>

                                            {/* COLUMNA FIN */}
                                            <td className="px-6 py-3 relative">
                                                {isEditingEnd ? (
                                                    <input 
                                                        ref={inputRef}
                                                        type="time"
                                                        value={tempValue}
                                                        onChange={e => setTempValue(e.target.value)}
                                                        onBlur={commitEdit}
                                                        onKeyDown={handleKeyDown}
                                                        className="w-full p-1 bg-white border-2 border-brand-primary rounded focus:outline-none font-mono text-center"
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => canEditEnd && startEditing(idx, 'endTime', endTimeStr)}
                                                        className={`flex items-center gap-2 py-1 px-2 rounded-md transition-all ${
                                                            canEditEnd 
                                                            ? 'cursor-pointer hover:bg-white hover:shadow-sm hover:text-brand-primary border border-transparent hover:border-slate-200' 
                                                            : 'opacity-60 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{endTimeStr}</span>
                                                        {canEditEnd && hoveredRow === idx && <PencilIcon className="w-3 h-3 text-slate-300 ml-auto" />}
                                                    </div>
                                                )}
                                            </td>

                                            {/* COLUMNA RATIO */}
                                            <td className="px-6 py-3 text-center">
                                                {isEditingRatio ? (
                                                    <input 
                                                        ref={inputRef}
                                                        type="number"
                                                        value={tempValue}
                                                        onChange={e => setTempValue(e.target.value)}
                                                        onBlur={commitEdit}
                                                        onKeyDown={handleKeyDown}
                                                        className="w-20 mx-auto p-1 bg-white border-2 border-brand-primary rounded focus:outline-none font-bold text-center"
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => startEditing(idx, 'ratio', seg.ratio)}
                                                        className="inline-flex items-center justify-center gap-2 py-1 px-3 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-100 transition-all group/ratio"
                                                    >
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">1 : {seg.ratio}</span>
                                                        {hoveredRow === idx && <PencilIcon className="w-3 h-3 text-slate-300 group-hover/ratio:text-brand-primary" />}
                                                    </div>
                                                )}
                                            </td>

                                            {/* COLUMNA ACCIONES */}
                                            <td className="px-6 py-3 text-right">
                                                {idx !== 0 ? (
                                                    <button 
                                                        onClick={() => handleDelete(idx)}
                                                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Eliminar este segmento (se expandirá el anterior)"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] uppercase font-bold text-slate-300 select-none">Base</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* Botón Flotante en Tabla para Añadir */}
                        <div 
                            onClick={handleAddSegment}
                            className="bg-slate-50 dark:bg-slate-900/50 p-3 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-200 dark:border-slate-700 group"
                        >
                            <div className="flex items-center gap-2 text-brand-primary font-bold text-sm group-hover:scale-105 transition-transform">
                                <PlusIcon className="w-5 h-5" />
                                <span>Añadir Segmento (Dividir Horario)</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500 text-center">
                        <p>💡 Haz clic en cualquier hora o ratio para editarlo directamente.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveGlobal}
                        className="px-6 py-2.5 rounded-lg bg-brand-secondary hover:bg-green-600 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsulinRatioModal;
