/**
 * Service Worker for SpotMap PWA
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'spotmap-v1';
const urlsToCache = [
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/index.html',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/about.html',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/faq.html',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/contact.html',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/css/styles.css',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/main.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/api.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/auth.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/map.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/spots.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/ui.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/notifications.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/social.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/comments.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/i18n.js',
    '/https-github.com-antonio-valero-daw2personal/Proyecto/spotMap/frontend/js/theme.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css',
    'https://unpkg.com/leaflet/dist/leaflet.css'
];

// Install event
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[SW] Cache failed:', err))
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
