import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // GitHub Pages serves the site from /<repo-name>/, not the domain root, so
    // asset URLs need that prefix. The deploy workflow sets VITE_BASE_PATH;
    // locally it stays '/' so `npm run dev` is served from the root.
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
    },
  };
});
