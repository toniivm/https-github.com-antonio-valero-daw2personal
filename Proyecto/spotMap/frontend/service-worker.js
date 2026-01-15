// service-worker.js - PWA SpotMap con estrategias avanzadas
const VERSION = 'v1.2';
const CACHE_STATIC = `spotmap-static-${VERSION}`;
const CACHE_DYNAMIC = `spotmap-dynamic-${VERSION}`;
const CACHE_IMAGES = `spotmap-images-${VERSION}`;

const CORE_ASSETS = [
  './index.html',
  './css/styles.css',
  './manifest.json',
  './js/main.js',
  './js/config.js',
  './js/api.js',
  './js/map.js',
  './js/spots.js',
  './js/ui.js',
  './js/auth.js',
  './js/notifications.js'
];

const MAX_ITEMS = 50;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

// Install: precache assets críticos
self.addEventListener('install', e => {
  console.log('[SW] Installing...');
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: limpiar caches antiguos
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('spotmap-') && !k.includes(VERSION))
        .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch: estrategias según tipo de recurso
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Solo GET
  if (request.method !== 'GET') return;

  // API: Network First (datos frescos)
  if (url.pathname.includes('/backend/') || url.pathname.includes('/api/')) {
    e.respondWith(networkFirst(request, CACHE_DYNAMIC));
    return;
  }

  // Imágenes: Cache First con Stale While Revalidate
  if (request.destination === 'image') {
    e.respondWith(cacheFirstWithRefresh(request, CACHE_IMAGES));
    return;
  }

  // Assets estáticos: Cache First
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg)$/)) {
    e.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // HTML: Network First con fallback
  if (request.destination === 'document') {
    e.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Resto: Network First
  e.respondWith(networkFirst(request, CACHE_DYNAMIC));
});

// Network First: intenta red, fallback a cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      trimCache(cacheName, MAX_ITEMS);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Cache First: cache primero, luego red
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate: devuelve cache y actualiza en background
async function cacheFirstWithRefresh(request, cacheName) {
  const cached = await caches.match(request);
  fetch(request).then(response => {
    if (response && response.ok) {
      caches.open(cacheName).then(cache => {
        cache.put(request, response.clone());
      });
    }
  }).catch(() => {});
  return cached || fetch(request);
}

// Network First con fallback a index.html
async function networkFirstWithFallback(request) {
  try {
    return await fetch(request);
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const indexCache = await caches.match('./index.html');
    return indexCache || new Response('Offline', { status: 503 });
  }
}

// Limitar tamaño de cache
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

// Mensajes desde la app
self.addEventListener('message', e => {
  if (e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (e.data.action === 'clearCache') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
