import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  // Define 'process.env' as an empty object (or with specific keys) 
  // so that `process.env.API_KEY` access doesn't crash the browser with "process is not defined".
  // This satisfies the bundler while we control logic via feature flags.
  define: {
    'process.env': {
       API_KEY: process.env.VITE_API_KEY || ''
    }
  }
});