const CACHE_NAME = "medal-game-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* =========================
   インストール
========================= */
self.addEventListener("install", event => {
  console.log("メダルゲームセンター: 新しいバージョンをインストール");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});


/* =========================
   有効化・古いキャッシュ削除
========================= */
self.addEventListener("activate", event => {
  console.log("メダルゲームセンター: アップデート完了");

  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});


/* =========================
   ページ・ファイル取得
========================= */
self.addEventListener("fetch", event => {

  /*
   HTMLはネットを優先。
   新しいindex.htmlがあれば最新版を取得する。
  */
  if (
    event.request.mode === "navigate" ||
    event.request.destination === "document"
  ) {

    event.respondWith(
      fetch(event.request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });

          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => {
              return response || caches.match("./index.html");
            });
        })
    );

    return;
  }


  /*
   その他のファイル
   キャッシュ → ネットの順番
  */
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {

            if (
              response &&
              response.status === 200 &&
              response.type === "basic"
            ) {

              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, copy);
                });
            }

            return response;
          });

      })
  );
});


/* =========================
   強制アップデート命令
========================= */
self.addEventListener("message", event => {

  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

});
