import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, History, Save, MessageSquare, Loader2 } from 'lucide-react';
// RUTA CORREGIDA: Apuntando a la nueva arquitectura de infraestructura
import { apiService } from '../services/infrastructure/apiService';
import type { UserData } from '../types';

interface AILongTermMemoryProps {
  currentUser: UserData;
}

const AILongTermMemory: React.FC<AILongTermMemoryProps> = ({ currentUser }) => {
  const [memory, setMemory] = useState<string>(currentUser.aiMemory || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sincronizar localmente si los datos del usuario cambian desde afuera
  useEffect(() => {
    if (currentUser.aiMemory) {
      setMemory(currentUser.aiMemory);
    }
  }, [currentUser.aiMemory]);

  const handleSaveMemory = async () => {
    setIsSaving(true);
    try {
      await apiService.updateUser({
        id: currentUser.id,
        aiMemory: memory
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar la memoria IA:", error);
      alert("No se pudo sincronizar la memoria con el núcleo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tighter text-slate-900 uppercase leading-none">Memoria Bio-Digital</h3>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">LTM (Long Term Memory)</p>
          </div>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <History size={18} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Contenedor de Memoria */}
      <div className="relative">
        {isEditing ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <textarea
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="Ej: 'Suelo tener picos después de la pasta', 'Hago ejercicio a las 19:00', 'Mi cuerpo reacciona lento a la insulina rápida'..."
              className="w-full h-40 bg-slate-50 border-2 border-indigo-50 rounded-[2rem] p-6 text-sm font-medium text-slate-700 outline-none focus:border-indigo-200 focus:bg-white transition-all resize-none"
            />
            <button
              onClick={handleSaveMemory}
              disabled={isSaving}
              className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Consolidar Aprendizaje</>}
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="group cursor-pointer bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[2.5rem] p-7 relative overflow-hidden transition-all hover:shadow-md"
          >
            {/* Adorno visual */}
            <div className="absolute -top-4 -right-4 text-slate-50 group-hover:text-indigo-50 transition-colors">
              <Sparkles size={80} />
            </div>

            {memory ? (
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                  "{memory}"
                </p>
                <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  <MessageSquare size={12} /> Datos cargados en el Agente AI
                </div>
              </div>
            ) : (
              <div className="relative z-10 py-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sin memoria activa. Haz clic para entrenar a tu IA.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Tag */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
          Optimización metabólica en tiempo real activa
        </p>
      </div>
    </div>
  );
};

export default AILongTermMemory;