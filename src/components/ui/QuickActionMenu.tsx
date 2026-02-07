import React, { useState } from 'react';
import { Plus, Utensils, Activity, Droplet, X } from 'lucide-react';

const QuickActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'food', icon: <Utensils size={20}/>, label: 'Comida', color: 'bg-orange-500' }, 
    { id: 'glucose', icon: <Droplet size={20}/>, label: 'Glucosa', color: 'bg-metra-blue' }, 
    { id: 'sport', icon: <Activity size={20}/>, label: 'Deporte', color: 'bg-metra-green' },
  ];

  return (
    <div className="fixed bottom-8 right-6 flex flex-col items-end z-50">
      {/* Opciones del menú flotante */}
      {isOpen && (
        <div className="flex flex-col gap-4 mb-4 items-end transition-all duration-300">
          {actions.map((action, index) => (
            <div 
              key={action.id} 
              className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {/* Etiqueta con estilo apple-card */}
              <span className="apple-card bg-white/70 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-metra-dark border border-white/20">
                {action.label}
              </span>
              
              {/* Botón de acción */}
              <button className={`${action.color} apple-btn p-3.5 text-white shadow-lg hover:scale-110 flex items-center justify-center`}>
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón Principal (Trigger) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-metra-dark rotate-45' : 'bg-metra-blue'
        } p-5 rounded-full text-white shadow-[var(--shadow-apple-heavy)] transition-all duration-300 hover:scale-105 active:scale-95`}
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QuickActionMenu;