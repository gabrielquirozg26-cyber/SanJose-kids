// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    host: true,
    allowedHosts: true,
  },
  
  build: {
    target: 'es2015',
    sourcemap: false,
    rollupOptions: {
      output: {
        // ✅ CORREGIDO: manualChunks debe ser una función
        manualChunks: (id) => {
          // Separa React y otras librerías grandes
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('framer-motion') || id.includes('canvas-confetti')) {
              return 'vendor-ui';
            }
            // Todo lo demás va a 'vendor'
            return 'vendor';
          }
        },
      },
    },
  },
  
  preview: {
    host: true,
    port: 4173,
  },
});