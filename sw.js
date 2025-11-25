const CACHE_NAME = 'architrack-v2';
const SUPABASE_URL = 'https://jphemhgubueqxkcahjqg.supabase.co';

// Recursos críticos para que la app arranque
const STATIC_URLS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalar el Service Worker y guardar el App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. ESTRATEGIA: NETWORK ONLY para Supabase
  // No queremos cachear la API de base de datos para evitar datos obsoletos sin lógica de sincronización
  if (requestUrl.href.includes(SUPABASE_URL)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. ESTRATEGIA: STALE-WHILE-REVALIDATE para librerías CDN (React, Lucide, etc.)
  // Devuelve el caché rápido, pero actualiza en segundo plano.
  if (
    requestUrl.hostname.includes('aistudiocdn.com') ||
    requestUrl.hostname.includes('esm.sh') ||
    requestUrl.hostname.includes('cdn.tailwindcss.com') ||
    requestUrl.hostname.includes('fonts.googleapis.com') ||
    requestUrl.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. ESTRATEGIA: NETWORK FIRST para todo lo demás (navegación principal)
  // Intenta ir a la red, si falla (offline), intenta el caché.
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});