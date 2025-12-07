const CACHE_NAME = "trig-calc-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

// Fetch (cache-first)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      return resp || fetch(e.request);
    })
  );
});
