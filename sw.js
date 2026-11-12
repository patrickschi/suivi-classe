// Carnet de suivi : fonctionne sans internet. Ce fichier ne fait que garder une copie
// des fichiers de l'application (jamais de données d'élèves, qui restent dans l'iPad).
// Ouverture : la copie locale s'affiche tout de suite ; si internet est disponible,
// la dernière version est téléchargée en arrière-plan et sera utilisée à la prochaine ouverture.
const CACHE='carnet-suivi-v12';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const cached=await c.match(req,{ignoreSearch:true})||(req.mode==='navigate'?await c.match('index.html'):null);
    const fresh=fetch(req,{cache:'no-cache'}).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);
    if(cached){e.waitUntil(fresh);return cached}
    return (await fresh)||new Response('Hors ligne',{status:503});
  }));
});
