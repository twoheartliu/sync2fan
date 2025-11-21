// Service Worker for MixFan PWA
const CACHE_VERSION = "v2"; // 增加版本号强制更新
const CACHE_NAME = `mixfan-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mixfan-runtime-${CACHE_VERSION}`;

// 需要预缓存的静态资源
const PRECACHE_URLS = ["./", "./index.html", "./manifest.json"];

// 安装事件 - 预缓存关键资源
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install - Version:", CACHE_VERSION);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Precaching app shell");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        // 强制激活新的 Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate - Version:", CACHE_VERSION);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // 删除所有旧版本的缓存（包括 MixFan 旧缓存）
              return (
                (cacheName.startsWith("mixfan-") ||
                  cacheName.startsWith("MixFan-")) &&
                cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE
              );
            })
            .map((cacheName) => {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // 立即接管所有页面
        return self.clients.claim();
      })
  );
});

// Fetch 事件 - 网络优先，失败时使用缓存
self.addEventListener("fetch", (event) => {
  // 跳过非 GET 请求
  if (event.request.method !== "GET") return;

  // 跳过 chrome-extension:// 和其他非 http(s) 请求
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 网络优先策略
      return fetch(event.request)
        .then((response) => {
          // 检查是否是有效响应
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // 克隆响应（因为响应流只能使用一次）
          const responseToCache = response.clone();

          // 缓存新的响应
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 网络请求失败，返回缓存
          if (cachedResponse) {
            console.log(
              "[Service Worker] Serving from cache:",
              event.request.url
            );
            return cachedResponse;
          }

          // 如果请求的是 HTML 页面且没有缓存，返回离线页面
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/");
          }
        });
    })
  );
});

// 后台同步（可选）
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync", event.tag);
  if (event.tag === "sync-posts") {
    event.waitUntil(syncPosts());
  }
});

// 推送通知（可选）
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received");
  const title = "拌饭 MixFan";
  const options = {
    body: event.data ? event.data.text() : "您有新的通知",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 辅助函数：同步帖子（示例）
async function syncPosts() {
  // 这里可以实现离线发布的帖子同步逻辑
  console.log("[Service Worker] Syncing posts...");
}

// 添加消息监听，用于调试
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("[Service Worker] Script loaded - Version:", CACHE_VERSION);
