/**
 * React Hook for Automatic Resource Cleanup
 * Provides easy cleanup management for React components
 */

import { useEffect, useRef, useCallback } from 'react';
import { MemoryManager } from '../lib/memory-manager';
import { logger } from '../lib/logger';

export interface UseResourceCleanupOptions {
  enableAutoCleanup: boolean;
  cleanupOnUnmount: boolean;
  cleanupInterval: number;
}

export const useResourceCleanup = (
  memoryManager: MemoryManager,
  options: UseResourceCleanupOptions = {
    enableAutoCleanup: true,
    cleanupOnUnmount: true,
    cleanupInterval: 30000
  }
) => {
  const resourcesRef = useRef<{
    videos: HTMLVideoElement[];
    images: HTMLImageElement[];
    timers: NodeJS.Timeout[];
    intervals: ReturnType<typeof setInterval>[];
    cleanupFunctions: (() => void)[];
  }>({
    videos: [],
    images: [],
    timers: [],
    intervals: [],
    cleanupFunctions: []
  });

  // Video management
  const registerVideo = useCallback((video: HTMLVideoElement) => {
    memoryManager.registerVideo(video);
    resourcesRef.current.videos.push(video);
    
    return () => {
      memoryManager.unregisterVideo(video);
      const index = resourcesRef.current.videos.indexOf(video);
      if (index !== -1) {
        resourcesRef.current.videos.splice(index, 1);
      }
    };
  }, [memoryManager]);

  // Image management
  const registerImage = useCallback((image: HTMLImageElement) => {
    memoryManager.registerImage(image);
    resourcesRef.current.images.push(image);
    
    return () => {
      memoryManager.unregisterImage(image);
      const index = resourcesRef.current.images.indexOf(image);
      if (index !== -1) {
        resourcesRef.current.images.splice(index, 1);
      }
    };
  }, [memoryManager]);

  // Timer management
  const registerTimer = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = setTimeout(callback, delay);
    memoryManager.registerTimer(timer);
    resourcesRef.current.timers.push(timer);
    
    return timer;
  }, [memoryManager]);

  const clearInterval = useCallback((timer: NodeJS.Timeout) => {
    memoryManager.clearTimer(timer);
    const index = resourcesRef.current.timers.indexOf(timer);
    if (index !== -1) {
      resourcesRef.current.timers.splice(index, 1);
    }
  }, [memoryManager]);

  // Interval management
  const registerInterval = useCallback((callback: () => void, delay: number): ReturnType<typeof setInterval> => {
    const interval = setInterval(callback, delay);
    memoryManager.registerInterval(interval);
    resourcesRef.current.intervals.push(interval);
    
    return interval;
  }, [memoryManager]);

  const clearCustomInterval = useCallback((interval: ReturnType<typeof setInterval>) => {
    memoryManager.clearInterval(interval);
    const index = resourcesRef.current.intervals.indexOf(interval);
    if (index !== -1) {
      resourcesRef.current.intervals.splice(index, 1);
    }
  }, [memoryManager]);

  // Event listener management
  const addEventListener = useCallback((
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    memoryManager.addEventListener(target, type, listener, options);
    
    return () => {
      memoryManager.removeEventListener(target, type, listener);
    };
  }, [memoryManager]);

  // Cleanup function registration
  const addCleanupFunction = useCallback((cleanup: () => void) => {
    resourcesRef.current.cleanupFunctions.push(cleanup);
  }, []);

  // Auto-cleanup effect
  useEffect(() => {
    if (!options.enableAutoCleanup) return;

    const cleanupInterval = setInterval(() => {
      // Clean up resources that are no longer in DOM
      resourcesRef.current.videos = resourcesRef.current.videos.filter(video => {
        if (!document.contains(video)) {
          memoryManager.unregisterVideo(video);
          return false;
        }
        return true;
      });

      resourcesRef.current.images = resourcesRef.current.images.filter(image => {
        if (!document.contains(image)) {
          memoryManager.unregisterImage(image);
          return false;
        }
        return true;
      });
    }, options.cleanupInterval);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [memoryManager, options.enableAutoCleanup, options.cleanupInterval]);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (options.cleanupOnUnmount) {
        // Run all cleanup functions
        resourcesRef.current.cleanupFunctions.forEach(cleanup => {
          try {
            cleanup();
          } catch (error) {
            logger.warn('Cleanup function failed:', error);
          }
        });

        // Clean up remaining resources
        resourcesRef.current.videos.forEach(video => memoryManager.unregisterVideo(video));
        resourcesRef.current.images.forEach(image => memoryManager.unregisterImage(image));
        resourcesRef.current.timers.forEach(timer => memoryManager.clearTimer(timer));
        resourcesRef.current.intervals.forEach(interval => memoryManager.clearInterval(interval));
      }
    };
  }, [memoryManager, options.cleanupOnUnmount]);

  return {
    registerVideo,
    registerImage,
    registerTimer,
    clearInterval,
    registerInterval,
    clearCustomInterval,
    addEventListener,
    addCleanupFunction
  };
};