const CACHE_NAME = 'architrack-v6-WEB-DIR';
const SUPABASE_URL = 'https://jphemhgubueqxkcahjqg.supabase.co';
// Detectar si estamos en local o en GitHub Pages para ajustar el alcance
const BASE_PATH = self.location.pathname.includes('/Architrack/') ? '/Architrack' : '';

// Recursos críticos
const STATIC_URLS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forzar activación inmediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Controlar clientes inmediatamente
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Network Only para Supabase (Datos siempre frescos)
  if (requestUrl.href.includes(SUPABASE_URL)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Stale-While-Revalidate para recursos externos (Fuentes, Tailwind)
  if (
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

  // 3. Network First para la App (Intentar red, si falla, usar caché)
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});