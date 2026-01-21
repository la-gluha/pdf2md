import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  // We remove the manual process.env define to avoid overwriting Vite's internal handling.
  // Instead, we rely on import.meta.env in the code.
});