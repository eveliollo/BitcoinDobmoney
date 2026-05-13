const CACHE_NOMBRE = 'bitcoindobmoney-v1';
const ARCHIVOS_A_GUARDAR = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/453/453118.png'
];

// Instalar y guardar archivos para usarlos sin internet
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOMBRE)
      .then(cache => cache.addAll(ARCHIVOS_A_GUARDAR))
  );
});

// Cargar archivos guardados cuando no haya internet
self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    caches.match(evento.request)
      .then(respuestaGuardada => {
        if (respuestaGuardada) {
          return respuestaGuardada;
        }
        return fetch(evento.request)
          .then(respuestaServidor => {
            return caches.open(CACHE_NOMBRE)
              .then(cache => {
                cache.put(evento.request, respuestaServidor.clone());
                return respuestaServidor;
              });
          })
          .catch(() => {
            // Si no hay internet, mostrar mensaje
            return new Response(
              '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Sin Conexión</title></head><body style="background:#0a0e17;color:white;text-align:center;padding:40px;"><h1>Sin Conexión</h1><p>Conectate a internet para usar la aplicación</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
      })
  );
});

