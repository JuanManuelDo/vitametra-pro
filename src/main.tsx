import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Mantenemos la carga de estilos al principio
import VitametrasApp from './App';

// Log de control para verificar despliegue en consola
console.log("🚀 VitaMetra Core: Iniciando sistemas biométricos...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('CRÍTICO: El contenedor #root no existe en el DOM.');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <VitametrasApp />
      </BrowserRouter>
    </React.StrictMode>
  );
}
