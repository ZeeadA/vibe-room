/* Vibe Room offline shell. Only caches the app files; your records live in IndexedDB and are never touched here. */
var CACHE = 'vibe-room-shell-v1.11.4';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Answer from cache right away, refresh it in the background (updates show on the next launch) */
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  var ok = u.origin === location.origin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!ok) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(r, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(r).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
