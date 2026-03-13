import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import type { UserData } from '../../types';

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentUser: UserData | null;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLoginClick, onLogoutClick, currentUser }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="w-full max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LADO IZQUIERDO: LOGO */}
        <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-all active:scale-95">
          <Logo />
        </Link>

        {/* LADO DERECHO: ACCIONES */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-[1000] text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 whitespace-nowrap shadow-xl shadow-slate-100"
            >
              Iniciar Sesión
            </button>
          ) : (
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex items-center mr-4">
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                      <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                         Sincronizado: Hoy {new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
               </div>
               <div className="hidden sm:flex flex-col items-end">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Bio-Perfil</p>
                  <p className="text-sm font-black text-slate-900 leading-none italic uppercase">
                    {currentUser?.firstName || currentUser?.email?.split('@')[0]}
                  </p>
               </div>
               <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
               <button 
                 onClick={onLogoutClick}
                 className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
               >
                 <LogOut size={18} strokeWidth={2.5} />
               </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;