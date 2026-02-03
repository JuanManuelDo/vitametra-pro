import React from 'react';
import Logo from './Logo';

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentUser: any;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLoginClick, onLogoutClick, currentUser }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-50">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
        
        {/* LOGO CON ÁTOMO */}
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          <Logo />
        </div>

        {/* ACCIONES */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <button 
              onClick={onLoginClick}
              className="bg-[#007AFF] text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:scale-105 transition-all active:scale-95"
            >
              Iniciar Sesión
            </button>
          ) : (
            <div className="flex items-center gap-4">
               <div className="hidden md:block text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Usuario Pro</p>
                  <p className="text-sm font-black text-slate-900 leading-none italic">{currentUser?.email?.split('@')[0]}</p>
               </div>
               <button 
                 onClick={onLogoutClick}
                 className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
               >
                 <span className="sr-only">Salir</span>
                 <svg size={20} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
               </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;