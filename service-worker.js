const CACHE_NAME = 'gr-toolkit-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './data/calculator-data.js',
    './js/calculator-core.js',
    './js/app.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => 
            Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request).catch(() => {
                // Offline fallback could go here
            });
        })
    );
});