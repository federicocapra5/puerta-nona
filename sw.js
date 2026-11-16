// Guarda la app dentro del celular para que abra aunque no haya señal
const CACHE = 'puerta-nona-v1';
const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Archivos de la app: abre al instante con lo guardado (aunque la señal sea mala)
// y en segundo plano baja la versión nueva para la próxima vez.
// Las llamadas a la hoja (POST) no pasan por acá.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(guardado => {
    const red = fetch(e.request)
      .then(r => { if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); } return r; })
      .catch(() => guardado || caches.match('./index.html'));
    return guardado || red;
  }));
});
