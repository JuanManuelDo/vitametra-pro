import React from 'react';
import { LogOut, Bell, Zap, Menu } from 'lucide-react';
import Logo from './Logo'; // Importamos el componente de Logo que creamos
import type { UserData } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  currentUser: UserData | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, currentUser, onLoginClick, onLogoutClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100/50">
      <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LADO IZQUIERDO: LOGO PRECISIÓN (Imágenes 1 y 2) */}
        <div 
          className="cursor-pointer active:scale-95 transition-transform" 
          onClick={() => window.location.href = '/'}
        >
          <Logo />
        </div>

        {/* LADO DERECHO: ACCIONES EN FILA ÚNICA */}
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-metra-blue transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Acceso
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* STATUS INDICATOR (Solo visible en Pro) */}
              <div className="hidden xs:flex flex-col items-end mr-2">
                <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  <Zap size={10} className="text-blue-600 fill-current" />
                  <span className="text-[9px] font-[900] text-blue-700 uppercase tracking-tighter">
                    {currentUser?.credits ?? 0} Créditos
                  </span>
                </div>
              </div>

              {/* BOTÓN NOTIFICACIONES (Estilo Apple Health) */}
              <button className="w-11 h-11 rounded-2xl bg-white border border-slate-50 shadow-sm flex items-center justify-center text-slate-400 relative hover:bg-slate-50 active:scale-90 transition-all">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
              </button>

              {/* BOTÓN CERRAR SESIÓN */}
              <button 
                onClick={onLogoutClick}
                className="w-11 h-11 rounded-2xl bg-white border border-slate-50 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;