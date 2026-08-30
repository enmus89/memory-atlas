/**
 * Memory Atlas service worker.
 *
 * Not part of the app bundle — Vite emits it to the site root at build time
 * (see the serviceWorker() plugin in vite.config.ts), which is what lets it
 * claim the whole scope. `__BUILD_ID__` is replaced with the build's id there.
 *
 * Two caches, on purpose:
 *   - the shell (the HTML document) is versioned per build and fetched
 *     network-first, so a deploy is picked up on the next online load;
 *   - built assets are content-hashed, so their URLs change whenever their
 *     bytes do. That cache is therefore unversioned and cache-first: a deploy
 *     re-downloads only the files that actually changed.
 *
 * Nothing else is intercepted. Supabase requests and signed photo URLs go
 * straight to the network — they are per-user and time-limited, and have no
 * business sitting in a shared cache.
 */

const BUILD_ID = '__BUILD_ID__';
const SHELL_CACHE = `memory-atlas-shell-${BUILD_ID}`;
const ASSET_CACHE = 'memory-atlas-assets';

const SCOPE = new URL(self.registration.scope);
const SHELL_URL = SCOPE.href;

// Everything the app needs before it can paint anything of its own.
const SHELL_FILES = [
  SHELL_URL,
  new URL('manifest.webmanifest', SCOPE).href,
  new URL('icons/icon-192.png', SCOPE).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // A single missing file would reject the whole addAll and leave the old
      // worker in place, so each file is allowed to fail on its own.
      .then((cache) => Promise.all(SHELL_FILES.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Hashed build output and static icons: immutable, so safe to serve from cache. */
function isBuildAsset(url) {
  const path = url.pathname.slice(SCOPE.pathname.length);
  return (
    path.startsWith('assets/') ||
    path.startsWith('icons/') ||
    path === 'manifest.webmanifest'
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  // Navigations: fresh HTML when online, the cached shell when not. The app is
  // a single page, so any in-scope navigation resolves to the same document.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(SHELL_URL, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(SHELL_URL)
            .then((cached) => cached || Response.error())
        )
    );
    return;
  }

  if (!isBuildAsset(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
