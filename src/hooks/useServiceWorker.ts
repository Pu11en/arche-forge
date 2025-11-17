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