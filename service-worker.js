const CACHE_NAME = 'happy-6months-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './song.mp3',
  './mylove.mp4',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ติดตั้ง service worker + cache ไฟล์พื้นฐาน
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ลบ cache เก่าเวลาเราเปลี่ยนเวอร์ชัน
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ดัก fetch เพื่อให้เปิดได้แบบ offline
self.addEventListener('fetch', event => {
  const req = event.request;

  // เอาเฉพาะ GET + origin เดียวกัน
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cachedRes => {
      if (cachedRes) return cachedRes;

      return fetch(req)
        .then(networkRes => {
          // cache แบบขำ ๆ สำหรับไฟล์ใหม่ที่ขอ
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => cachedRes); // ถ้าเน็ตดับก็ลองใช้ตัวที่ cache ไว้อยู่แล้ว
    })
  );
});
