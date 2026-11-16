// Offline support: cache the app shell, serve it when there is no network.
// Bump VERSION whenever any of these files change so users get the update.
const VERSION = "v1";
const CACHE = "masraf-daroo-" + VERSION;
const FILES = [
  "./",
  "index.html",
  "splash.jpg",
  "icon.png",
  "icon-192.png",
  "apple-touch-icon.png",
  "manifest.webmanifest",
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
    // Pages: try the network first so content stays fresh, fall back to cache offline.
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  // Static files: cache first.
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
