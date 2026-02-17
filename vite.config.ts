import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Mantiene la raíz como base del proyecto
  build: {
    outDir: 'dist', // Directorio de salida para Firebase
    rollupOptions: {
      output: {
        // Estrategia de fragmentación (Manual Chunks)
        manualChunks(id) {
          // Separamos Firebase ya que es el paquete más pesado
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          // Separamos la IA de Google para que no cargue si no es necesaria
          if (id.includes('@google/generative-ai')) {
            return 'vendor-gemini';
          }
          // Agrupamos librerías de UI e iconos (Lucide)
          if (id.includes('lucide-react') || id.includes('framer-motion')) {
            return 'vendor-ui';
          }
          // El resto de dependencias externas
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Ajustamos el límite de advertencia a 800kb para mayor claridad
    chunkSizeWarningLimit: 800,
  }
});
