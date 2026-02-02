import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // El proyecto vive en la raíz
  build: {
    outDir: 'dist',
  }
});
