import React from 'react';
import { Zap, User } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  currentUser: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, currentUser, onLoginClick, onLogoutClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
        {/* LOGO AL EXTREMO IZQUIERDO */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Zap className="text-white" size={24} fill="white" />
          </div>
          <span className="text-2xl font-[1000] tracking-tighter text-slate-900 uppercase italic">
            VITAMETRA
          </span>
        </div>

        {/* ACCESO AL EXTREMO DERECHO */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-600 hidden md:block">
                {currentUser?.name || 'Bio-User'}
              </span>
              <button onClick={onLogoutClick} className="text-[10px] font-bold text-red-500 uppercase ml-2 hover:underline">
                Salir
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Acceso
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;