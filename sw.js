// Service Worker — 快取本地檔案，讓 App 在網路不穩時也能使用
const CACHE = "vyc-v7";

const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./data.js",
  "./store.js",
  "./sync.js",
  "./use-store.jsx",
  "./tweaks-panel.jsx",
  "./sync-badge.jsx",
  "./settings-variant-d.jsx",
  "./settings-variant-d-modals.jsx",
  "./manifest.json",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(LOCAL_ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // 同源的本地檔案：cache-first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          const network = fetch(e.request).then((res) => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // CDN (React, Babel, 字型)：network-first，失敗才用快取
  if (url.hostname.includes("unpkg.com") || url.hostname.includes("fonts.g")) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        fetch(e.request).then((res) => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cache.match(e.request))
      )
    );
  }
});
