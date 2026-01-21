import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Support top-level await if needed
  },
  define: {
    // Polyfill for some libraries that might expect process.env
    'process.env': {} 
  }
});