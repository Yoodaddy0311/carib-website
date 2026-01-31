/**
 * Carib Service Worker
 * PWA 오프라인 지원 및 캐싱 전략 구현
 *
 * @version 1.0.0
 */

const CACHE_NAME = 'carib-cache-v1';
const OFFLINE_URL = '/offline.html';

// 프리캐시할 정적 자산 목록
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 캐시할 외부 리소스 패턴
const CACHE_PATTERNS = [
  /^https:\/\/cdn\.jsdelivr\.net/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
];

// 캐시하지 않을 요청 패턴
const NO_CACHE_PATTERNS = [
  /^https:\/\/.*\.firebaseio\.com/,
  /^https:\/\/.*\.googleapis\.com\/.*auth/,
  /^https:\/\/www\.google-analytics\.com/,
  /^https:\/\/www\.googletagmanager\.com/,
  /\/api\//,
];

/**
 * Install Event - 서비스 워커 설치
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[ServiceWorker] Caching app shell');

      // 프리캐시 자산 캐싱
      await cache.addAll(PRECACHE_ASSETS);
    })()
  );

  // 즉시 활성화
  self.skipWaiting();
});

/**
 * Activate Event - 이전 캐시 정리
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');

  event.waitUntil(
    (async () => {
      // 이전 버전 캐시 삭제
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Removing old cache:', name);
            return caches.delete(name);
          })
      );

      // 모든 클라이언트에 대해 즉시 제어권 획득
      await self.clients.claim();
    })()
  );
});

/**
 * Fetch Event - 네트워크 요청 가로채기
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // POST 요청 등은 캐싱하지 않음
  if (request.method !== 'GET') {
    return;
  }

  // 캐시하지 않을 요청 패턴 확인
  if (NO_CACHE_PATTERNS.some((pattern) => pattern.test(request.url))) {
    return;
  }

  // 네비게이션 요청 처리 (HTML 페이지)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 네트워크 우선 전략
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // 오프라인 시 캐시된 페이지 또는 오프라인 페이지 제공
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);

          if (cachedResponse) {
            return cachedResponse;
          }

          // 오프라인 폴백 페이지 제공
          return cache.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // 정적 자산 요청 처리
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 캐시 우선 전략 (정적 자산)
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        // 백그라운드에서 캐시 업데이트 (Stale-While-Revalidate)
        event.waitUntil(
          (async () => {
            try {
              const networkResponse = await fetch(request);
              if (networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
              }
            } catch (error) {
              // 네트워크 실패 무시
            }
          })()
        );
        return cachedResponse;
      }

      // 캐시에 없으면 네트워크 요청
      try {
        const networkResponse = await fetch(request);

        // 성공적인 응답만 캐싱
        if (networkResponse.ok) {
          // 외부 CDN 리소스도 캐싱
          const shouldCache =
            url.origin === self.location.origin ||
            CACHE_PATTERNS.some((pattern) => pattern.test(request.url));

          if (shouldCache) {
            await cache.put(request, networkResponse.clone());
          }
        }

        return networkResponse;
      } catch (error) {
        console.log('[ServiceWorker] Fetch failed:', error);
        // 이미지 등의 폴백 처리
        if (request.destination === 'image') {
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
              <rect fill="#f3f4f6" width="100" height="100"/>
              <text fill="#9ca3af" font-family="sans-serif" font-size="12" x="50" y="50" text-anchor="middle" dominant-baseline="middle">Offline</text>
            </svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        throw error;
      }
    })()
  );
});

/**
 * Message Event - 클라이언트와 통신
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

/**
 * Background Sync - 오프라인 데이터 동기화
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

/**
 * 데이터 동기화 함수
 */
async function syncData() {
  // 오프라인에서 저장된 데이터 동기화 로직
  console.log('[ServiceWorker] Syncing data...');
}

/**
 * Push Notification - 푸시 알림 처리
 */
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || 'Carib에서 새로운 알림이 있습니다.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: 'explore',
          title: '확인하기',
        },
        {
          action: 'close',
          title: '닫기',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title || 'Carib', options));
  }
});

/**
 * Notification Click - 알림 클릭 처리
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
