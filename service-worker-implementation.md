# Service Worker Implementation for Caching and Offline Support

## Overview
This document outlines a comprehensive service worker implementation for the ArcheForge landing page that provides intelligent caching, offline support, and performance optimization.

## Core Components

### 1. Advanced Service Worker (`public/sw.js`)

```javascript
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
  
  if (CACHE_CONFIG.video.patterns.some(pattern => pattern.test(url.href))) {
    return VIDEO_CACHE;
  }
  
  if (CACHE_CONFIG.image.patterns.some(pattern => pattern.test(url.href))) {
    return IMAGE_CACHE;
  }
  
  if (CACHE_CONFIG.analytics.patterns.some(pattern => pattern.test(url.pathname))) {
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
    
    // Revalidate in background
    networkPromise.then(networkResponse => {
      if (networkResponse) {
        console.log('Service Worker: Cache revalidated:', request.url);
      }
    });
    
    return cachedResponse;
  }
  
  // Wait for network if no cache
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
```

### 2. Service Worker Manager (`src/lib/service-worker-manager.ts`)

```typescript
/**
 * Service Worker Manager for ArcheForge Landing Page
 * Handles service worker registration, communication, and lifecycle management
 */

export interface ServiceWorkerConfig {
  enableCaching: boolean;
  enableOfflineSupport: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  cacheVersion: string;
  updateInterval: number; // minutes
}

export interface CacheInfo {
  name: string;
  entries: number;
  maxEntries: number;
  maxAge: number;
  urls: string[];
}

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  activated: boolean;
  controller: boolean;
  version: string | null;
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private messageChannel: MessageChannel | null = null;
  private updateTimer?: NodeJS.Timeout;
  private isOnline = navigator.onLine;

  constructor(config: ServiceWorkerConfig) {
    this.config = config;
    this.initializeNetworkMonitoring();
  }

  public async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      console.log('Service Worker: Registering...');
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker: Registered successfully');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start update checking
      this.startUpdateChecking();
      
      return true;
    } catch (error) {
      console.error('Service Worker: Registration failed:', error);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.registration) return;

    // Update found
    this.registration.addEventListener('updatefound', () => {
      console.log('Service Worker: Update found');
      const newWorker = this.registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New worker available, show update notification
            this.showUpdateNotification();
          }
        });
      }
    });

    // Controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker: Controller changed');
      window.location.reload();
    });

    // Message handling
    navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_INFO':
        this.onCacheInfo?.(data);
        break;
        
      case 'CACHE_CLEARED':
        this.onCacheCleared?.(data);
        break;
        
      case 'VIDEO_PRELOADED':
        this.onVideoPreloaded?.(data);
        break;
        
      default:
        console.log('Service Worker: Unknown message:', type, data);
    }
  }

  private initializeNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkChange?.(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkChange?.(false);
    });
  }

  private startUpdateChecking(): void {
    if (this.config.updateInterval > 0) {
      this.updateTimer = setInterval(() => {
        this.checkForUpdates();
      }, this.config.updateInterval * 60 * 1000);
    }
  }

  private async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.warn('Service Worker: Update check failed:', error);
    }
  }

  private showUpdateNotification(): void {
    // Create custom notification or use browser notification
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <p>A new version of ArcheForge is available</p>
        <button id="update-btn">Update Now</button>
        <button id="dismiss-btn">Later</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #000;
      color: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Handle button clicks
    document.getElementById('update-btn')?.addEventListener('click', () => {
      this.skipWaiting();
      document.body.removeChild(notification);
    });
    
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      document.body.removeChild(notification);
    });
  }

  // Public API Methods
  public async getCacheInfo(): Promise<{ [cacheName: string]: CacheInfo }> {
    return this.sendMessage('GET_CACHE_INFO');
  }

  public async clearCache(cacheType: string): Promise<void> {
    return this.sendMessage('CLEAR_CACHE', { cacheType });
  }

  public async preloadVideo(url: string): Promise<boolean> {
    const result = await this.sendMessage('PRELOAD_VIDEO', { url });
    return result?.success || false;
  }

  public skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private async sendMessage(type: string, data?: any): Promise<any> {
    if (!navigator.serviceWorker.controller) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data.data);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type, data },
        [channel.port2]
      );
    });
  }

  public getStatus(): ServiceWorkerStatus {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      activated: !!navigator.serviceWorker.controller,
      controller: !!navigator.serviceWorker.controller,
      version: this.config.cacheVersion
    };
  }

  public isServiceWorkerOnline(): boolean {
    return this.isOnline;
  }

  // Event callbacks
  public onCacheInfo?: (info: { [cacheName: string]: CacheInfo }) => void;
  public onCacheCleared?: (data: any) => void;
  public onVideoPreloaded?: (data: { url: string; success: boolean }) => void;
  public onNetworkChange?: (online: boolean) => void;

  public destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    if (this.messageChannel) {
      this.messageChannel.port1.close();
      this.messageChannel.port2.close();
    }
  }
}

export { ServiceWorkerManager, type ServiceWorkerConfig, type CacheInfo, type ServiceWorkerStatus };
```

### 3. React Hook for Service Worker (`src/hooks/useServiceWorker.ts`)

```typescript
/**
 * React Hook for Service Worker Integration
 * Provides easy access to service worker functionality in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceWorkerManager, ServiceWorkerConfig, ServiceWorkerStatus, CacheInfo } from '../lib/service-worker-manager';

export const useServiceWorker = (config: ServiceWorkerConfig) => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    supported: false,
    registered: false,
    activated: false,
    controller: false,
    version: null
  });
  
  const [cacheInfo, setCacheInfo] = useState<{ [cacheName: string]: CacheInfo }>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const managerRef = useRef<ServiceWorkerManager | null>(null);

  useEffect(() => {
    const manager = new ServiceWorkerManager(config);
    managerRef.current = manager;

    // Set up event callbacks
    manager.onCacheInfo = setCacheInfo;
    manager.onNetworkChange = setIsOnline;

    // Register service worker
    manager.register().then(success => {
      if (success) {
        setStatus(manager.getStatus());
      }
    });

    return () => {
      manager.destroy();
    };
  }, [config]);

  // Clear cache
  const clearCache = useCallback(async (cacheType: string) => {
    if (!managerRef.current) return;
    await managerRef.current.clearCache(cacheType);
  }, []);

  // Preload video
  const preloadVideo = useCallback(async (url: string): Promise<boolean> => {
    if (!managerRef.current) return false;
    return await managerRef.current.preloadVideo(url);
  }, []);

  // Get cache info
  const refreshCacheInfo = useCallback(async () => {
    if (!managerRef.current) return;
    const info = await managerRef.current.getCacheInfo();
    setCacheInfo(info);
  }, []);

  // Skip waiting for update
  const skipWaiting = useCallback(() => {
    if (!managerRef.current) return;
    managerRef.current.skipWaiting();
  }, []);

  return {
    status,
    cacheInfo,
    isOnline,
    clearCache,
    preloadVideo,
    refreshCacheInfo,
    skipWaiting
  };
};
```

## Integration with Existing Components

### Enhanced Landing Page with Service Worker

```typescript
// Update to src/components/landing-page.tsx
import { useServiceWorker } from '../hooks/useServiceWorker';

const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  onCTAClick,
  videoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  autoPlay = true
}) => {
  // Service worker integration
  const {
    status,
    cacheInfo,
    isOnline,
    clearCache,
    preloadVideo,
    refreshCacheInfo
  } = useServiceWorker({
    enableCaching: true,
    enableOfflineSupport: true,
    enableBackgroundSync: true,
    enablePushNotifications: false,
    cacheVersion: 'v2',
    updateInterval: 60 // Check for updates every hour
  });

  // Preload video when service worker is ready
  useEffect(() => {
    if (status.activated && autoPlay) {
      preloadVideo(videoUrl);
    }
  }, [status.activated, autoPlay, videoUrl, preloadVideo]);

  // Handle offline state
  useEffect(() => {
    if (!isOnline) {
      console.log('App is offline, using cached content');
      // Show offline indicator
      const offlineIndicator = document.createElement('div');
      offlineIndicator.id = 'offline-indicator';
      offlineIndicator.textContent = 'You are currently offline';
      offlineIndicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff6b6b;
        color: white;
        text-align: center;
        padding: 8px;
        z-index: 9999;
        font-family: system-ui;
      `;
      document.body.appendChild(offlineIndicator);

      return () => {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
          document.body.removeChild(indicator);
        }
      };
    }
  }, [isOnline]);

  // Enhanced video completion handler
  const handleVideoComplete = useCallback(() => {
    analytics?.trackVideoCompletion(30);
    
    // Refresh cache info to see what was cached
    refreshCacheInfo();
    
    // Existing logic...
  }, [analytics, refreshCacheInfo]);

  // Debug panel for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && status.registered) {
      const debugPanel = document.createElement('div');
      debugPanel.id = 'sw-debug-panel';
      debugPanel.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; z-index: 9999;">
          <div>SW Status: ${status.activated ? 'Active' : 'Inactive'}</div>
          <div>Online: ${isOnline ? 'Yes' : 'No'}</div>
          <div>Cache Entries: ${Object.values(cacheInfo).reduce((sum, cache) => sum + cache.entries, 0)}</div>
          <button onclick="clearCache('video')" style="margin-top: 8px; padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear Video Cache</button>
        </div>
      `;
      document.body.appendChild(debugPanel);

      // Make clearCache available globally for debug button
      (window as any).clearCache = clearCache;

      return () => {
        const panel = document.getElementById('sw-debug-panel');
        if (panel) {
          document.body.removeChild(panel);
        }
      };
    }
  }, [status, cacheInfo, isOnline, clearCache]);

  // Rest of component remains the same...
};
```

## Testing Strategy

### Service Worker Tests

```javascript
// public/test-sw.js
// Service Worker Testing Suite

self.importScripts('https://cdn.jsdelivr.net/npm/mocha/mocha.js');
self.importScripts('https://cdn.jsdelivr.net/npm/chai/chai.js');

const assert = chai.assert;

// Test cache strategies
describe('Service Worker Cache Strategies', () => {
  it('should cache static assets with cache-first strategy', async () => {
    const request = new Request('/static/js/bundle.js');
    const response = await fetch(request);
    
    assert.exists(response, 'Response should exist');
    assert.equal(response.status, 200, 'Should return 200 status');
  });

  it('should handle video requests with cache-first strategy', async () => {
    const request = new Request('https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4');
    const response = await fetch(request);
    
    assert.exists(response, 'Video response should exist');
  });

  it('should handle offline scenarios', async () => {
    // Simulate offline
    self.addEventListener('fetch', event => {
      if (event.request.url.includes('offline-test')) {
        event.respondWith(
          caches.match(event.request).then(response => {
            return response || new Response('Offline', { status: 503 });
          })
        );
      }
    });

    const request = new Request('/offline-test');
    const response = await fetch(request);
    
    assert.exists(response, 'Should handle offline requests');
  });
});

// Test cache management
describe('Cache Management', () => {
  it('should respect cache size limits', async () => {
    const cache = await caches.open('test-cache');
    
    // Add more items than limit
    for (let i = 0; i < 150; i++) {
      await cache.put(new Request(`/test-${i}`), new Response(`test-${i}`));
    }
    
    const keys = await cache.keys();
    assert.isAtMost(keys.length, 100, 'Should not exceed cache limit');
  });

  it('should clean up expired entries', async () => {
    const cache = await caches.open('test-cache');
    
    // Add expired entry
    const expiredResponse = new Response('expired', {
      headers: { 'date': new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toUTCString() }
    });
    
    await cache.put('/expired', expiredResponse);
    
    // Check if expired entry is handled
    const response = await cache.match('/expired');
    assert.isNull(response, 'Expired entry should be removed');
  });
});

// Run tests
mocha.run();
```

### Service Worker Manager Tests

```typescript
// src/test/service-worker-manager.test.ts
import { ServiceWorkerManager, ServiceWorkerConfig } from '../lib/service-worker-manager';

// Mock service worker for testing
const mockServiceWorker = {
  register: jest.fn(),
  ready: Promise.resolve()
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  configurable: true
});

describe('ServiceWorkerManager', () => {
  let manager: ServiceWorkerManager;
  let mockConfig: ServiceWorkerConfig;

  beforeEach(() => {
    mockConfig = {
      enableCaching: true,
      enableOfflineSupport: true,
      enableBackgroundSync: true,
      enablePushNotifications: false,
      cacheVersion: 'test-v1',
      updateInterval: 0
    };
    manager = new ServiceWorkerManager(mockConfig);
  });

  test('should register service worker successfully', async () => {
    const result = await manager.register();
    expect(result).toBe(true);
    expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  test('should get service worker status', () => {
    const status = manager.getStatus();
    expect(status.supported).toBe(true);
    expect(status.registered).toBe(false); // Not registered yet
  });

  test('should handle network changes', () => {
    const onNetworkChange = jest.fn();
    manager.onNetworkChange = onNetworkChange;

    // Simulate offline event
    window.dispatchEvent(new Event('offline'));
    
    expect(onNetworkChange).toHaveBeenCalledWith(false);
  });
});
```

## Implementation Checklist

- [ ] Create advanced service worker with intelligent caching strategies
- [ ] Implement service worker manager for easy integration
- [ ] Add React hook for service worker functionality
- [ ] Integrate service worker with existing components
- [ ] Add offline support and network monitoring
- [ ] Implement background sync for analytics
- [ ] Add cache management and cleanup
- [ ] Create comprehensive test suite
- [ ] Add debug tools for development
- [ ] Document service worker API and usage

## Performance Targets

The service worker implementation should achieve:

- **Cache Hit Rate**: > 80% for static assets
- **Offline Performance**: Full functionality available offline
- **Update Detection**: < 5 seconds to detect updates
- **Cache Size**: < 50MB total cache storage
- **Network Requests**: < 20% reduction in network requests
- **Load Time**: < 1s for cached assets
- **Background Sync**: 100% analytics data sync when online

This comprehensive service worker implementation will provide robust offline support, intelligent caching, and significant performance improvements for the ArcheForge landing page.