const CACHE_NAME = "trace-shell-v1";
const ARCHIVOS = ["./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin.includes("graph.microsoft.com") || url.origin.includes("login.microsoftonline.com")) {
    return; // nunca cachear llamadas de red/autenticacion
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((resp) => {
            const copia = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
            return resp;
          })
          .catch(() => cached)
      );
    })
  );
});

