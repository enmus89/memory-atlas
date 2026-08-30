import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const SERVICE_WORKER_SOURCE = path.resolve(__dirname, 'src/service-worker.js');

/**
 * Emits the service worker to the site root rather than into assets/, because a
 * worker can only control the directory it is served from and below. It is kept
 * out of the module graph (plain JS, read from disk) so nothing bundles it, and
 * stamped with a build id so each deploy retires the previous shell cache.
 */
function serviceWorker(): Plugin {
  return {
    name: 'memory-atlas-service-worker',
    apply: 'build',
    buildStart() {
      this.addWatchFile(SERVICE_WORKER_SOURCE);
    },
    generateBundle() {
      const source = fs
        .readFileSync(SERVICE_WORKER_SOURCE, 'utf8')
        .replace('__BUILD_ID__', Date.now().toString(36));
      this.emitFile({type: 'asset', fileName: 'sw.js', source});
    },
  };
}

export default defineConfig(() => {
  return {
    // GitHub Pages serves the site from /<repo-name>/, not the domain root, so
    // asset URLs need that prefix. The deploy workflow sets VITE_BASE_PATH;
    // locally it stays '/' so `npm run dev` is served from the root.
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), serviceWorker()],
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
