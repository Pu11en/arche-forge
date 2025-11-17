/**
 * React Hook for Service Worker Integration (FIXED VERSION)
 * Provides easy access to service worker functionality in React components
 * Uses singleton pattern to prevent multiple registrations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceWorkerManager, ServiceWorkerConfig, ServiceWorkerStatus, CacheInfo } from '../lib/service-worker-manager';

// Singleton instance to prevent multiple registrations
let singletonManager: ServiceWorkerManager | null = null;
let singletonConfig: ServiceWorkerConfig | null = null;

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
    // Use singleton pattern to prevent multiple registrations
    if (!singletonManager || JSON.stringify(config) !== JSON.stringify(singletonConfig)) {
      console.log('Service Worker: Creating singleton instance');
      singletonManager = new ServiceWorkerManager(config);
      singletonConfig = { ...config };
      managerRef.current = singletonManager;

      // Set up event callbacks
      singletonManager.onCacheInfo = setCacheInfo;
      singletonManager.onNetworkChange = setIsOnline;

      // Register service worker (only once)
      singletonManager.register().then(success => {
        if (success) {
          setStatus(singletonManager!.getStatus());
        }
      });
    } else {
      console.log('Service Worker: Using existing singleton instance');
      managerRef.current = singletonManager;
      
      // Update status from existing manager
      setStatus(singletonManager.getStatus());
      
      // Set up event callbacks
      singletonManager.onCacheInfo = setCacheInfo;
      singletonManager.onNetworkChange = setIsOnline;
    }
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