import React from 'react';
import { 
  LayoutGrid, 
  History, 
  User, 
  Utensils,    
  Stethoscope   
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  
  const tabs = [
    { id: 'dashboard', label: 'Hoy', icon: <LayoutGrid size={22} />, path: 'dashboard' },
    { 
      id: 'analyzer', 
      label: 'Analizar', 
      icon: <Utensils size={22} />, 
      path: 'analyzer',
      badge: true 
    },
    { id: 'history', label: 'Tendencias', icon: <History size={22} />, path: 'history' },
    { 
      id: 'settings', 
      label: 'Reportes',      
      icon: <Stethoscope size={22} />, 
      path: 'settings' 
    },
    { 
      id: 'profile', 
      label: 'Perfil',       
      icon: <User size={22} />, 
      path: 'profile' 
    },
  ];

  // Normalizamos para que coincida con la lógica de App.tsx
  const currentTabId = activeTab === 'clinical-settings' ? 'settings' : (activeTab || 'dashboard');

  return (
    <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 z-[900] pointer-events-none">
      <nav className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-2 py-3 flex items-center justify-between pointer-events-auto relative overflow-hidden">
        
        {tabs.map((tab) => {
          const isActive = currentTabId === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.path)}
              className="relative flex flex-col items-center justify-center py-2 px-3 transition-all duration-500 group flex-1"
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -top-3 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_10px_#4F46E5]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className={`relative transition-all duration-300 transform ${isActive ? 'scale-110 text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {tab.icon}
                
                {/* Badge sutil para la función de IA */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                )}
              </div>

              <span className={`text-[8px] font-[900] uppercase tracking-[0.05em] mt-1.5 transition-colors duration-300 italic ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-indigo-50/50 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Navigation;