import React, { useState } from 'react'
import type { Hba1cEntry } from '../types'
import Hba1cInputForm from './Hba1cInputForm';
import { PencilIcon, TrashIcon, PlusIcon } from './ui/Icons'

interface Hba1cHistoryManagerProps {
    history: Hba1cEntry[];
    onSave: (data: Omit<Hba1cEntry, 'id' | 'userId'>) => Promise<void>;
    onUpdate: (data: Hba1cEntry) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const Hba1cHistoryManager: React.FC<Hba1cHistoryManagerProps> = ({ history = [], onSave, onUpdate, onDelete }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Hba1cEntry | null>(null);

    const handleEdit = (entry: Hba1cEntry) => {
        setEditingEntry(entry);
        setIsFormOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingEntry(null);
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingEntry(null);
    };

    const handleSaveOrUpdate = async (data: { value: number; unit: 'PERCENT' | 'MMOL_MOL'; date: string; id?: string }) => {
        try {
            if (data.id && editingEntry) {
                const fullEntry: Hba1cEntry = { ...data, userId: editingEntry.userId, id: data.id } as Hba1cEntry;
                await onUpdate(fullEntry);
            } else {
                await onSave(data as any);
            }
            handleCancel();
        } catch (error) {
            console.error("Error al guardar HbA1c:", error);
        }
    };

    // SEGURO: Validar que history sea un array antes de renderizar
    const safeHistory = Array.isArray(history) ? history : [];

    return (
        <div className="mt-6 p-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Registros de HbA1c</h4>
                {!isFormOpen && (
                     <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                        <PlusIcon className="w-5 h-5"/>
                        Añadir Medición
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-4">
                    <Hba1cInputForm 
                        onSave={handleSaveOrUpdate}
                        entryToEdit={editingEntry}
                        onCancel={handleCancel}
                        isCompact={true}
                    />
                </div>
            )}
            
            <div className="space-y-2">
                {safeHistory.length > 0 ? safeHistory.map(entry => (
                    <div key={entry?.id || Math.random()} className="p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                                {entry?.value?.toFixed(1) || '0.0'} <span className="text-sm font-normal">{entry?.unit === 'PERCENT' ? '%' : 'mmol/mol'}</span>
                            </p>
                             <p className="text-xs text-slate-500 dark:text-slate-400">
                                {entry?.date ? new Date(entry.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin fecha'}
                             </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(entry)} className="p-2 text-slate-500 hover:text-brand-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors">
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => entry?.id && onDelete(entry.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    !isFormOpen && <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No hay registros. Añade tu primera medición.</p>
                )}
            </div>
        </div>
    )
};

export default Hba1cHistoryManager;