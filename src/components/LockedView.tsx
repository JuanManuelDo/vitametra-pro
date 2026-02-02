import React from 'react';
import { LockClosedIcon } from './Icons';

interface LockedViewProps {
  title: string;
  message: string;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const LockedView: React.FC<LockedViewProps> = ({ title, message, onLoginClick, onRegisterClick }) => {
  return (
    <div className="max-w-xl mx-auto text-center bg-brand-surface p-10 rounded-xl shadow-lg border border-gray-200 mt-10">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <LockClosedIcon className="h-6 w-6 text-brand-primary" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-brand-primary mb-4">
        {title}
      </h1>
      <p className="text-slate-600 mb-8">
        {message}
      </p>
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={onLoginClick}
          className="px-5 py-2.5 font-semibold text-sm rounded-md text-brand-primary hover:bg-blue-100 transition-colors duration-200"
        >
          Iniciar Sesión
        </button>
        <button
          onClick={onRegisterClick}
          className="px-5 py-2.5 font-semibold text-sm rounded-md bg-brand-primary text-white hover:bg-brand-dark transition-colors duration-200 shadow-sm"
        >
          Crear Cuenta
        </button>
      </div>
    </div>
  );
};

export default LockedView;