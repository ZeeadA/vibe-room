/* Vibe Room offline shell. Only caches the app files; your records live in IndexedDB and are never touched here.
   Online: always fetches the newest page (so updates show up on the next open). Offline or very slow: serves the saved copy. */
var CACHE = 'vibe-room-shell-v1.11.11';
var NET_MS = 3500;
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (!r.ok) throw new Error(u); return c.put(u, r); });
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function netFirst(url) {
  return caches.open(CACHE).then(function (c) {
    return new Promise(function (resolve) {
      var done = false;
      var saved = function () { return c.match(url, { ignoreSearch: true }); };
      var t = setTimeout(function () { saved().then(function (h) { if (h && !done) { done = true; resolve(h); } }); }, NET_MS);
      fetch(url, { cache: 'no-cache' }).then(function (res) {
        clearTimeout(t);
        if (res && res.ok) c.put(url, res.clone());
        if (!done) { done = true; resolve(res); }
      }).catch(function () {
        clearTimeout(t);
        saved().then(function (h) { if (!done) { done = true; resolve(h || Response.error()); } });
      });
    });
  });
}
/* fonts: answer from the saved copy at once, refresh it quietly */
function swr(r) {
  return caches.open(CACHE).then(function (c) {
    return c.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin === location.origin) e.respondWith(netFirst(r.url));
  else if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') e.respondWith(swr(r));
});
