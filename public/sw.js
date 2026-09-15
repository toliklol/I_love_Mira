// ============================================
// Service Worker: кеширование картинок
// ============================================
// Меняйте CACHE_VERSION при необходимости сбросить кеш картинок у пользователей.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `mira-media-cache-${CACHE_VERSION}`;

// Какие файлы считаем "картинками" и кешируем
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

self.addEventListener('install', () => {
    // Сразу активируем новую версию воркера, не дожидаясь закрытия всех вкладок
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Удаляем старые версии кеша картинок
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key.startsWith('mira-media-cache-') && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Кешируем только GET-запросы картинок
    if (request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch (err) {
        return;
    }

    if (!IMAGE_EXTENSIONS.test(url.pathname)) return;

    // Стратегия "stale-while-revalidate":
    // сразу отдаём картинку из кеша (если она там есть) — это быстро,
    // и параллельно обновляем кеш свежей версией с сервера в фоне.
    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(request);

            const networkFetch = fetch(request)
                .then((response) => {
                    if (response && response.ok) {
                        cache.put(request, response.clone());
                    }
                    return response;
                })
                .catch(() => null);

            if (cached) {
                // Обновляем кеш в фоне, не дожидаясь ответа сети
                networkFetch;
                return cached;
            }

            const networkResponse = await networkFetch;
            return networkResponse || Response.error();
        })
    );
});