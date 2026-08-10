const CACHE_NAME = 'arwi-pwa-v3';

// Core static assets to try pre-caching
const CORE_STATIC_ASSETS = [
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-pwa.png',
    './icon-maskable-192.png',
    './icon-maskable-512.png',
    '../cascade.css',
    '../brand.png',
    '../alpha-os.png',
    '../favicon.ico'
];

// Install Event: Activate immediately and pre-cache static assets safely
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                CORE_STATIC_ASSETS.map((url) =>
                    fetch(url)
                        .then((res) => {
                            if (res && res.ok) {
                                return cache.put(url, res);
                            }
                        })
                        .catch(() => {
                            // Silently ignore pre-cache miss
                        })
                )
            );
        })
    );
});

// Activate Event: Cleanup Old Caches & claim clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Safe strategy for LuCI Admin Panel
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // Bypass caching for LuCI dynamic endpoints, API, RPC, login/logout, and ubus
    const isDynamic = url.pathname.includes('/cgi-bin/') ||
                      url.pathname.includes('/ubus') ||
                      url.pathname.includes('/rpc') ||
                      url.pathname.includes('/admin/logout') ||
                      url.searchParams.has('status');

    if (isDynamic) {
        // Network-only for live LuCI data
        event.respondWith(
            fetch(request).catch(() => {
                if (request.mode === 'navigate') {
                    return caches.match(request);
                }
                return Promise.reject('offline');
            })
        );
        return;
    }

    // Static Assets: Stale-While-Revalidate
    const isStatic = url.pathname.includes('/luci-static/') ||
                     url.pathname.endsWith('.css') ||
                     url.pathname.endsWith('.js') ||
                     url.pathname.endsWith('.png') ||
                     url.pathname.endsWith('.ico') ||
                     url.pathname.endsWith('.svg') ||
                     url.pathname.endsWith('.woff') ||
                     url.pathname.endsWith('.woff2') ||
                     url.pathname.endsWith('.ttf') ||
                     url.pathname.endsWith('.json');

    if (isStatic) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Fetch fresh copy in background
                    fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                        }
                    }).catch(() => {});
                    return cachedResponse;
                }

                return fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return networkResponse;
                }).catch(() => {
                    return new Response('', { status: 408, statusText: 'Request timed out' });
                });
            })
        );
        return;
    }

    // Default: Network with cache fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

