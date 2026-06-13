/* FIFA 2026 schedule — service worker
 * App-shell offline support. The live-score API (worldcup26.ir) is NEVER cached
 * so scores are always fresh when online.
 */
const VERSION = "v1";
const CACHE = "fifa26-" + VERSION;

// Core files served from cache when offline.
const SHELL = [
  "./",
  "./index.html",
  "./groups.html",
  "./stats.html",
  "./manifest.webmanifest",
  "./pwa.js",
  "./favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll fails atomically; add individually so one 404 can't break install.
      .then((cache) => Promise.all(SHELL.map((url) =>
        cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Live scores / API: always go to the network, never cache.
  if (url.hostname.endsWith("worldcup26.ir")) return;

  // Page navigations: network-first, fall back to cache (then index.html offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin (flag CDNs, fonts, etc.): try network, fall back to cache.
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
