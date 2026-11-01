const CACHE_NAME = "iraq-water-map-offline-v2";
const CORE_FILES = [
  "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./assets/leaflet.js", "./assets/leaflet.css",
  "./assets/images/layers.png", "./assets/images/layers-2x.png", "./assets/images/marker-icon.png",
  "./assets/images/marker-icon-2x.png", "./assets/images/marker-shadow.png",
  "./data/countries.geojson", "./data/layer-0.geojson", "./data/layer-1.geojson",
  "./data/layer-2.geojson", "./data/layer-3.geojson", "./data/layer-4.geojson"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(caches.match("./index.html").then(cached => cached || fetch(request)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
      return response;
    });
  }));
});
