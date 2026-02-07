import React from 'react';
import { Accessibility, Bike, Zap, Trophy, Flame } from 'lucide-react';

interface ActivityLevel {
  id: string;
  label: string;
  description: string;
  multiplier: string;
  icon: React.ReactNode;
}

const levels: ActivityLevel[] = [
  { id: 'sedentary', label: 'Sedentario', description: 'Poco o nada de ejercicio.', multiplier: '1.2x', icon: <Accessibility size={20} /> },
  { id: 'light', label: 'Ligero', description: 'Ejercicio 1-3 días/semana.', multiplier: '1.375x', icon: <Bike size={20} /> },
  { id: 'moderate', label: 'Moderado', description: 'Intenso 3-5 días/semana.', multiplier: '1.55x', icon: <Zap size={20} /> },
  { id: 'active', label: 'Muy Activo', description: 'Entrenamiento diario.', multiplier: '1.725x', icon: <Flame size={20} /> },
  { id: 'athlete', label: 'Atleta Pro', description: 'Esfuerzo físico extremo.', multiplier: '1.9x', icon: <Trophy size={20} /> }
];

interface Props { selectedId?: string; onSelect: (id: string) => void; }

const ActivityLevelSelector: React.FC<Props> = ({ selectedId, onSelect }) => (
  <div className="grid gap-3 w-full max-w-md mx-auto">
    {levels.map((level) => (
      <button
        key={level.id}
        onClick={() => onSelect(level.id)}
        className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all active:scale-[0.98] ${
          selectedId === level.id ? 'bg-metra-blue border-metra-blue text-white shadow-lg' : 'bg-slate-50 border-transparent text-metra-dark'
        }`}
      >
        <div className={`p-3 rounded-2xl ${selectedId === level.id ? 'bg-white/20' : 'bg-white text-metra-blue'}`}>{level.icon}</div>
        <div className="flex-1 text-left">
          <div className="flex justify-between items-center">
            <span className="font-black uppercase text-[10px] tracking-widest">{level.label}</span>
            <span className="text-[9px] font-black opacity-60">{level.multiplier}</span>
          </div>
          <p className="text-[10px] font-bold opacity-70">{level.description}</p>
        </div>
      </button>
    ))}
  </div>
);

export default ActivityLevelSelector;