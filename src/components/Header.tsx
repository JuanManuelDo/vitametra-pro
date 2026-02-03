import React from 'react';
import { Zap } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentUser: any;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLoginClick, onLogoutClick, currentUser }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md">
      <div className="w-full max-w-[1600px] mx-auto px-8 md:px-16 h-20 flex items-center justify-between">
        
        {/* LOGO IZQUIERDA */}
        <div className="flex items-center gap-2">
          <div className="text-metra-blue">
            <Zap size={28} fill="currentColor" strokeWidth={0} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-metra-dark">
            VitaMetra
          </span>
        </div>

        {/* BOTÓN DERECHA */}
        <div>
          {!isLoggedIn ? (
            <button 
              onClick={onLoginClick}
              className="bg-metra-blue text-white px-6 py-2 rounded-full font-bold text-sm hover:brightness-110 transition-all"
            >
              Iniciar Sesión
            </button>
          ) : (
            <button 
              onClick={onLogoutClick}
              className="text-metra-dark/60 font-bold text-sm hover:text-metra-dark transition-colors"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;