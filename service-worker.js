const CACHE_NAME='a-la-mesa-v3.1';
const APP_SHELL=['./','./index.html','./styles.css','./app.js','./vendor/html5-qrcode.min.js','./manifest.webmanifest','./favicon-32.png','./apple-touch-icon.png','./icon-512.png'];

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  for(const url of APP_SHELL){try{await cache.add(url)}catch{}}
  await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name!==CACHE_NAME).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));

self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.hostname.includes('script.google.com')||url.hostname.includes('openfoodfacts.org'))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy))}return response})));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    const open=windows.find(w=>new URL(w.url).origin===self.location.origin);
    return open?open.focus():clients.openWindow('./');
  }));
});
