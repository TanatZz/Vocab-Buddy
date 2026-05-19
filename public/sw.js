const CACHE_NAME = 'vocab-buddy-v1';
const DYNAMIC_CACHE = 'vocab-buddy-dynamic-v1';

// ไฟล์ที่ต้องการเก็บไว้ใน Cache ทันทีที่ลง PWA
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Vite จะ generate ไฟล์อื่นๆ ซึ่งอาจจะดึงยากในโหมด Dev
  // ใน production จะใช้ workbox สร้าง sw ให้จะดีกว่า แต่เราใช้แบบพื้นฐานไปก่อน
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

  // สำหรับการร้องขอ API Firebase/Firestore
  // เราจะพึ่งพา LocalStorage fallback ที่เราเขียนไว้แล้วมากกว่า
  // ตรงนี้เราจะจัดการเฉพาะ Static Assets
  
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      // คืนค่าจาก Cache ถ้ามี (Cache-First)
      if (cacheRes) {
        return cacheRes;
      }
      
      // ถ้าไม่มีใน Cache ให้ดึงจาก Network (Network Fallback)
      return fetch(event.request).then((fetchRes) => {
        // สามารถเก็บ Dynamic Cache ตรงนี้ได้ถ้าต้องการ
        /* 
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request.url, fetchRes.clone());
          return fetchRes;
        });
        */
        return fetchRes;
      }).catch(() => {
        // ถ้ายิง Network ไม่ได้ (Offline)
        // กรณีขอไฟล์ HTML ให้คืนค่า index.html
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});
