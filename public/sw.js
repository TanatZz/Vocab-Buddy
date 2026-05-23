const CACHE_NAME = 'vocab-buddy-v3';
const DYNAMIC_CACHE = 'vocab-buddy-dynamic-v3';

// ไฟล์ที่ต้องการเก็บไว้ใน Cache ทันทีที่ลง PWA
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ติดตั้ง Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // บังคับใช้ sw ทันทีไม่ต้องรอ
});

// เคลียร์ Cache เก่า
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Intercept Network Requests
self.addEventListener('fetch', (event) => {
  // ข้าม request ที่ไม่ใช่ HTTP/HTTPS หรือเป็น Chrome extensions
  if (!(event.request.url.indexOf('http') === 0)) return;

  const isHtml = event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html');

  if (isHtml) {
    // Network-First Strategy สำหรับหน้า HTML (เพื่อให้ได้รับตัวชี้ไฟล์ JS/CSS แฮชล่าสุดจาก Vite เสมอ)
    event.respondWith(
      fetch(event.request)
        .then((fetchRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('/');
        })
    );
    return;
  }

  // Cache-First Strategy สำหรับ Static Assets อื่นๆ (JS, CSS, รูปภาพ)
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      // คืนค่าจาก Cache ถ้ามี (เพราะ Vite จะเปลี่ยนชื่อไฟล์แฮชเมื่อบิวด์ใหม่ จึงไม่อ่านทับกัน)
      if (cacheRes) {
        return cacheRes;
      }
      
      // ถ้าไม่มีใน Cache ให้ดึงจาก Network
      return fetch(event.request).then((fetchRes) => {
        return fetchRes;
      });
    })
  );
});
