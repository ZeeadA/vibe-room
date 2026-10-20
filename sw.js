/* Vibe Room offline shell. Only caches the app files; your records live in IndexedDB and are never touched here.
   Online: always fetches the newest page (so updates show up on the next open). Offline or very slow: serves the saved copy. */
var CACHE = 'vibe-room-shell-v1.11.12';
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
/* v1.11.12 offline audio endpoint: serves IndexedDB records as byte-range media.
   Requests are intentionally not cached; they remain on-device and work offline.
   Avoid loading the whole audio into JS memory: use Blob.slice(). */
self.addEventListener('message',function(e){
 if(e.data&&e.data.type==='VR_AUDIO_CAPS'&&e.ports&&e.ports[0]){
  e.ports[0].postMessage({type:'VR_AUDIO_CAPS',range:true});
 }
});
function vrOpenDB(){return new Promise(function(resolve,reject){
 var req=indexedDB.open('vibe-room',1);
 req.onsuccess=function(){resolve(req.result)};
 req.onerror=function(){reject(req.error||new Error('db-open-failed'))};
 // Never create or alter the user's records from the Service Worker.
 req.onupgradeneeded=function(){req.transaction.abort()};
})}
function vrGetRecord(id){return vrOpenDB().then(function(db){return new Promise(function(resolve,reject){
 try{var tx=db.transaction('r','readonly'),req=tx.objectStore('r').get(id);
  req.onsuccess=function(){resolve(req.result||null)};
  req.onerror=function(){reject(req.error||new Error('record-get-failed'))};
  tx.oncomplete=function(){db.close()};tx.onabort=function(){db.close()};tx.onerror=function(){db.close()};
 }catch(err){db.close();reject(err)}
})})}
function vrAudioResponse(request,url){
 var prefix='/__vr_audio__/',idx=url.pathname.indexOf(prefix);
 var id;try{id=decodeURIComponent(url.pathname.slice(idx+prefix.length))}catch(e){return Promise.resolve(new Response('Invalid ID',{status:400}))}
 if(!id||id.indexOf('/')!==-1)return Promise.resolve(new Response('Invalid ID',{status:400}));
 return vrGetRecord(id).then(function(rec){
  var blob=rec&&rec.audio;if(!(blob instanceof Blob))return new Response('Not found',{status:404});
  var total=blob.size,raw=request.headers.get('Range');
  var mime=(blob.type||'').toLowerCase();
  if(!mime||mime==='application/octet-stream')mime='audio/mpeg';
  var headers={'Content-Type':mime,'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  var start=0,end=total?total-1:0,partial=false;
  if(raw){
   var m=/^bytes=(\d*)-(\d*)$/.exec(raw.trim());
   if(!m||(m[1]===''&&m[2]===''))return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+total,'Accept-Ranges':'bytes'}});
   if(m[1]===''){
    var suffix=Number(m[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+total,'Accept-Ranges':'bytes'}});
    start=Math.max(0,total-suffix);
   }else{
    start=Number(m[1]);
    if(m[2]!=='')end=Number(m[2]);
   }
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=total||end<start||total===0)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+total,'Accept-Ranges':'bytes'}});
   end=Math.min(end,total-1);partial=true;
  }
  var length=partial?(end-start+1):total;
  headers['Content-Length']=String(length);
  if(partial)headers['Content-Range']='bytes '+start+'-'+end+'/'+total;
  return new Response(request.method==='HEAD'?null:(partial?blob.slice(start,end+1,mime):blob),{status:partial?206:200,headers:headers});
 }).catch(function(){return new Response('Offline audio unavailable',{status:503})});
}
self.addEventListener('fetch', function (e) {
  var requested=new URL(e.request.url);
  if(requested.origin===self.location.origin&&requested.pathname.indexOf('/__vr_audio__/')!==-1){
    if(e.request.method==='GET'||e.request.method==='HEAD')e.respondWith(vrAudioResponse(e.request,requested));
    return;
  }
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin === location.origin) e.respondWith(netFirst(r.url));
  else if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') e.respondWith(swr(r));
});
