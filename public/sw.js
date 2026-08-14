const CACHE = "long-ear-log-v2";
const ASSETS = ["/", "/manifest.webmanifest", "/rabbit-actions-hd.png", "/rabbit-food-hd.png", "/rabbit-meals-closeup.png", "/rabbit-upper-push.png", "/rabbit-stretch.png", "/rabbit-back.png", "/rabbit-walk.png", "/rabbit-squat-standalone.png", "/rabbit-full-body.png", "/rabbit-rest.png", "/rabbit-week-start.png", "/rabbit-week-progress.png", "/rabbit-week-complete.png", "/rabbit-stamp.png"];
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))));
});
