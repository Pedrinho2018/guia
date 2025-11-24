// Service Worker para GuiaLocal PWA
const CACHE_NAME = 'guia-local-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Ativar Service Worker
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
});

// Interceptar requisições (strategy: cache first, fallback to network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se encontrar no cache, retorna
      if (response) {
        return response;
      }

      // Se não, tenta fazer a requisição na rede
      return fetch(event.request).then((response) => {
        // Não faz cache de respostas não-bem-sucedidas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clona a resposta
        const responseToCache = response.clone();

        // Armazena em cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Se falhar, retorna uma página offline (opcional)
        return new Response('Offline — dados em cache disponíveis', {
          status: 200,
          statusText: 'OK',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});
