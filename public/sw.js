/**
 * Advanced Service Worker for ArcheForge Landing Page
 * Provides intelligent caching, offline support, and performance optimization
 */

const CACHE_NAME = 'archeforge-v2';
const STATIC_CACHE = 'archeforge-static-v2';
const VIDEO_CACHE = 'archeforge-video-v2';
const IMAGE_CACHE = 'archeforge-images-v2';
const ANALYTICS_CACHE = 'archeforge-analytics-v2';

// Cache configuration
const CACHE_CONFIG = {
  static: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 100,
    patterns: [
      /\.(js|css|woff|woff2|ttf|otf)$/,
      /\/manifest\.json$/,
      /\/favicon-.*\.png$/
    ]
  },
  video: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 10,
    patterns: [
      /\.mp4$/,
      /\.webm$/,
      /\.ogg$/,
      /res\.cloudinary\.com.*video/
    ]
  },
  image: {
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    maxEntries: 50,
    patterns: [
      /\.jpg$/,
      /\.jpeg$/,
      /\.png$/,
      /\.gif$/,
      /\.webp$/,
      /res\.cloudinary\.com.*image/
    ]
  },
  analytics: {
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 100,
    patterns: [
      /\/api\/analytics/
    ]
  }
};

// Critical assets that should always be cached
const CRITICAL_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  'https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4',
  'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png'
];

// Network strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Critical assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache critical assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== VIDEO_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== ANALYTICS_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - main request handling
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Determine cache strategy based on request type
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch(error => {
        console.error('Service Worker: Request handling failed:', error);
        return new Response('Service Error', { 
          status: 500, 
          statusText: 'Service Worker Error' 
        });
      })
  );
});

// Message event - handle communication from main app
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage({ type: 'CACHE_INFO', data: info });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheType).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PRELOAD_VIDEO':
      preloadVideo(data.url).then(success => {
        event.ports[0].postMessage({ 
          type: 'VIDEO_PRELOADED', 
          data: { url: data.url, success } 
        });
      });
      break;
      
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// Determine cache strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Analytics requests - network first with short cache
  if (CACHE_CONFIG.analytics.patterns.some(pattern => pattern.test(url.pathname))) {
    return STRATEGIES.NETWORK_FIRST;
  }
  
  // Video requests - cache first for performance
  if (CACHE_CONFIG.video.patterns.some(pattern => pattern.test(url.href))) {
    return STRATEGIES.CACHE_FIRST;
  }
  
  // Image requests - stale while revalidate
  if (CACHE_CONFIG.image.patterns.some(pattern => pattern.test(url.href))) {
    return STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Static assets - cache first
  if (CACHE_CONFIG.static.patterns.some(pattern => pattern.test(url.href))) {
    return STRATEGIES.CACHE_FIRST;
  }
  
  // HTML documents - network first
  if (request.destination === 'document') {
    return STRATEGIES.NETWORK_FIRST;
  }
  
  // Default to network first
  return STRATEGIES.NETWORK_FIRST;
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
  const cacheName = getCacheName(request.url);
  
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
      
    case STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
      
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
      
    case STRATEGIES.NETWORK_ONLY:
      return networkOnly(request);
      
    case STRATEGIES.CACHE_ONLY:
      return cacheOnly(request, cacheName);
      
    default:
      return networkFirst(request, cacheName);
  }
}

// Get appropriate cache name for URL
function getCacheName(url) {
  const urlObj = new URL(url);
  
  if (CACHE_CONFIG.video.patterns.some(pattern => pattern.test(urlObj.href))) {
    return VIDEO_CACHE;
  }
  
  if (CACHE_CONFIG.image.patterns.some(pattern => pattern.test(urlObj.href))) {
    return IMAGE_CACHE;
  }
  
  if (CACHE_CONFIG.analytics.patterns.some(pattern => pattern.test(urlObj.pathname))) {
    return ANALYTICS_CACHE;
  }
  
  return STATIC_CACHE;
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
    console.log('Service Worker: Cache hit:', request.url);
    return cachedResponse;
  }
  
  console.log('Service Worker: Cache miss, fetching from network:', request.url);
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      await cleanupCache(cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network request failed:', error);
    
    // Return stale cache if available
    if (cachedResponse) {
      console.log('Service Worker: Returning stale cache due to network error');
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('Service Worker: Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      await cleanupCache(cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Network request failed, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Returning cached response due to network error');
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network
  const networkPromise = fetch(request)
    .then(async networkResponse => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        await cache.put(request, responseToCache);
        await cleanupCache(cacheName);
      }
      return networkResponse;
    })
    .catch(error => {
      console.warn('Service Worker: Network revalidation failed:', error);
      return null;
    });
  
  // Return cached version immediately if available
  if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
    console.log('Service Worker: Returning stale cache:', request.url);
    return cachedResponse;
  }
  
  console.log('Service Worker: No cache available, waiting for network:', request.url);
  return networkPromise;
}

// Network Only Strategy
async function networkOnly(request) {
  console.log('Service Worker: Network only:', request.url);
  return fetch(request);
}

// Cache Only Strategy
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
    console.log('Service Worker: Cache only:', request.url);
    return cachedResponse;
  }
  
  throw new Error('No cached response available');
}

// Check if cached response is expired
function isExpired(response, cacheName) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const cacheTime = new Date(dateHeader).getTime();
  const config = getCacheConfig(cacheName);
  const now = Date.now();
  
  return (now - cacheTime) > config.maxAge;
}

// Get cache configuration
function getCacheConfig(cacheName) {
  switch (cacheName) {
    case VIDEO_CACHE:
      return CACHE_CONFIG.video;
    case IMAGE_CACHE:
      return CACHE_CONFIG.image;
    case ANALYTICS_CACHE:
      return CACHE_CONFIG.analytics;
    default:
      return CACHE_CONFIG.static;
  }
}

// Clean up cache based on LRU and max entries
async function cleanupCache(cacheName) {
  const cache = await caches.open(cacheName);
  const config = getCacheConfig(cacheName);
  const requests = await cache.keys();
  
  if (requests.length <= config.maxEntries) {
    return;
  }
  
  // Sort by last accessed time (if available) or cache time
  const requestsWithTime = await Promise.all(
    requests.map(async request => {
      const response = await cache.match(request);
      const dateHeader = response?.headers.get('date');
      const time = dateHeader ? new Date(dateHeader).getTime() : 0;
      return { request, time };
    })
  );
  
  requestsWithTime.sort((a, b) => a.time - b.time);
  
  // Remove oldest entries
  const toRemove = requestsWithTime.slice(0, requestsWithTime.length - config.maxEntries);
  await Promise.all(
    toRemove.map(({ request }) => cache.delete(request))
  );
  
  console.log(`Service Worker: Cleaned up ${toRemove.length} old entries from ${cacheName}`);
}

// Get cache information
async function getCacheInfo() {
  const cacheNames = [STATIC_CACHE, VIDEO_CACHE, IMAGE_CACHE, ANALYTICS_CACHE];
  const info = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const config = getCacheConfig(cacheName);
    
    info[cacheName] = {
      name: cacheName,
      entries: keys.length,
      maxEntries: config.maxEntries,
      maxAge: config.maxAge,
      urls: keys.map(key => key.url)
    };
  }
  
  return info;
}

// Clear specific cache
async function clearCache(cacheType) {
  const cacheName = getCacheNameForType(cacheType);
  await caches.delete(cacheName);
  console.log(`Service Worker: Cleared cache: ${cacheName}`);
}

// Get cache name for type
function getCacheNameForType(type) {
  switch (type) {
    case 'static':
      return STATIC_CACHE;
    case 'video':
      return VIDEO_CACHE;
    case 'image':
      return IMAGE_CACHE;
    case 'analytics':
      return ANALYTICS_CACHE;
    default:
      return CACHE_NAME;
  }
}

// Preload video for better performance
async function preloadVideo(url) {
  try {
    const cache = await caches.open(VIDEO_CACHE);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(url, response);
      console.log('Service Worker: Video preloaded:', url);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Service Worker: Video preload failed:', error);
    return false;
  }
}

// Background sync for analytics
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync analytics when online
async function syncAnalytics() {
  try {
    const cache = await caches.open(ANALYTICS_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const analyticsData = await response.json();
      
      // Send to analytics server
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      
      // Remove from cache after successful sync
      await cache.delete(request);
    }
    
    console.log('Service Worker: Analytics sync completed');
  } catch (error) {
    console.error('Service Worker: Analytics sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/favicon-192x192.png',
    badge: '/favicon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('ArcheForge', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});