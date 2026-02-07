import React from 'react';
import { Home, History, User, CreditCard, Zap } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: <Home size={22} />, label: 'Hoy' },
    { id: 'history', icon: <History size={22} />, label: 'Bio-Stats' },
    { id: 'plans', icon: <CreditCard size={22} />, label: 'Premium' },
    { id: 'profile', icon: <User size={22} />, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-slate-200 pb-10 pt-4">
      <div className="max-w-md mx-auto px-6 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-90 ${
                isActive ? 'text-[#007AFF]' : 'text-slate-400'
              }`}
            >
              <div className={`transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </div>

              <span className={`text-[9px] font-[1000] uppercase tracking-[0.15em] ${
                isActive ? 'opacity-100' : 'opacity-50'
              }`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 bg-[#007AFF] rounded-full animate-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;