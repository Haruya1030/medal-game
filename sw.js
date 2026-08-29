const CACHE_NAME = "medal-game-v2";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* インストール */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME).then(cache => {

      return cache.addAll(FILES);

    })

  );

  self.skipWaiting();

});


/* 有効化 */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    })

  );

  self.clients.claim();

});


/* 通信 */

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request).then(response => {

      if(response){
        return response;
      }

      return fetch(event.request);

    })

  );

});
