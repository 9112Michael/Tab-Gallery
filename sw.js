// Service worker design inspired by https://github.com/google-developer-training/pwa-training-labs

console.log('Hello from sw.js');

const urlsToCache = [
  '/',
  'images',
  'index.html',
  'style.css',
  '404.html',
  'offline.html'
];

const CACHE_NAME = 'my-site-cache-v3';

// Listen for install event, set callback
self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
    );
  });

  self.addEventListener('activate', event => {
    console.log('Activating new service worker...');
  
    const cacheAllowlist = [CACHE_NAME];
  
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheAllowlist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

  self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            console.log('Found ', event.request.url, ' in cache');
            return response;
          }
          console.log('Network request for ', event.request.url);
          return fetch(event.request)

          // Add fetched files to cache
          .then(response => {
            if (response.status === 404) {
              return caches.match('404.html');
            }
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
        }).catch(error => {
          console.log('Error, ', error);
          // Respond with custom offline page
          return caches.match('offline.html');
        })
      );
    });