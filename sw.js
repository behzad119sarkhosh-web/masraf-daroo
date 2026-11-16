// Offline support: cache the app shell, serve it when there is no network.
// Bump VERSION whenever any of these files change so users get the update.
const VERSION = "v3";
const CACHE = "masraf-daroo-" + VERSION;
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "splash.jpg",
  "icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "fonts/Vazirmatn-Regular.woff2",
  "fonts/Vazirmatn-Bold.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("masraf-daroo-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    // Pages: network first so content stays fresh, cached copy when offline.
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); } return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  // Static files: cache first, ignoring ?query so tracking links still hit the cache.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
