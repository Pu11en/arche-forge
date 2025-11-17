# Memory Management and Resource Cleanup Implementation

## Overview
This document outlines a comprehensive memory management and resource cleanup system for the ArcheForge landing page to prevent memory leaks, optimize performance, and ensure smooth operation across all devices.

## Core Components

### 1. Memory Management System (`src/lib/memory-manager.ts`)

```typescript
/**
 * Memory Management System for ArcheForge Landing Page
 * Provides automatic cleanup, resource monitoring, and leak detection
 */

export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ResourceRegistry {
  videos: Set<HTMLVideoElement>;
  images: Set<HTMLImageElement>;
  timers: Set<NodeJS.Timeout>;
  intervals: Set<NodeJS.Interval>;
  eventListeners: Map<EventTarget, Array<{ type: string; listener: EventListener; options?: AddEventListenerOptions }>>;
  observers: Set<IntersectionObserver | MutationObserver | ResizeObserver | PerformanceObserver>;
  animations: Set<number>;
  promises: Set<Promise<any>>;
}

export interface MemoryManagerConfig {
  enableAutoCleanup: boolean;
  cleanupInterval: number; // milliseconds
  memoryThreshold: number; // MB
  enableLeakDetection: boolean;
  maxResourceAge: number; // milliseconds
  enablePerformanceMonitoring: boolean;
}

class MemoryManager {
  private config: MemoryManagerConfig;
  private resources: ResourceRegistry;
  private memoryHistory: MemoryStats[] = [];
  private cleanupTimer?: NodeJS.Timeout;
  private isDestroyed = false;

  constructor(config: MemoryManagerConfig) {
    this.config = config;
    this.resources = {
      videos: new Set(),
      images: new Set(),
      timers: new Set(),
      intervals: new Set(),
      eventListeners: new Map(),
      observers: new Set(),
      animations: new Set(),
      promises: new Set()
    };

    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }

    if (this.config.enablePerformanceMonitoring) {
      this.startMemoryMonitoring();
    }

    // Page unload cleanup
    window.addEventListener('beforeunload', this.cleanupAll.bind(this));
    window.addEventListener('pagehide', this.cleanupAll.bind(this));
  }

  // Resource Registration Methods
  public registerVideo(video: HTMLVideoElement): void {
    if (this.isDestroyed) return;
    
    this.resources.videos.add(video);
    
    // Set up automatic cleanup for video
    const cleanup = () => this.unregisterVideo(video);
    this.addEventListener(video, 'ended', cleanup, { once: true });
    this.addEventListener(video, 'error', cleanup, { once: true });
    
    // Monitor video memory usage
    this.monitorVideoMemory(video);
  }

  public registerImage(image: HTMLImageElement): void {
    if (this.isDestroyed) return;
    this.resources.images.add(image);
    
    // Set up automatic cleanup
    const cleanup = () => this.unregisterImage(image);
    this.addEventListener(image, 'error', cleanup, { once: true });
    this.addEventListener(image, 'load', cleanup, { once: true, delay: 30000 }); // Cleanup after 30s
  }

  public registerTimer(timer: NodeJS.Timeout): void {
    if (this.isDestroyed) return;
    this.resources.timers.add(timer);
  }

  public registerInterval(interval: NodeJS.Interval): void {
    if (this.isDestroyed) return;
    this.resources.intervals.add(interval);
  }

  public addEventListener<T extends EventTarget>(
    target: T,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions & { delay?: number }
  ): void {
    if (this.isDestroyed) return;
    
    const cleanListener = listener;
    target.addEventListener(type, cleanListener, options);
    
    // Track the listener
    if (!this.resources.eventListeners.has(target)) {
      this.resources.eventListeners.set(target, []);
    }
    this.resources.eventListeners.get(target)!.push({ type, listener: cleanListener, options });
    
    // Auto-cleanup with delay
    if (options?.delay) {
      const timer = setTimeout(() => {
        this.removeEventListener(target, type, cleanListener);
      }, options.delay);
      this.registerTimer(timer);
    }
  }

  public removeEventListener<T extends EventTarget>(
    target: T,
    type: string,
    listener: EventListener
  ): void {
    const listeners = this.resources.eventListeners.get(target);
    if (listeners) {
      const index = listeners.findIndex(l => l.type === type && l.listener === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        target.removeEventListener(type, listener);
        
        if (listeners.length === 0) {
          this.resources.eventListeners.delete(target);
        }
      }
    }
  }

  public registerObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver | PerformanceObserver): void {
    if (this.isDestroyed) return;
    this.resources.observers.add(observer);
  }

  public registerAnimation(animationId: number): void {
    if (this.isDestroyed) return;
    this.resources.animations.add(animationId);
  }

  public registerPromise<T>(promise: Promise<T>): void {
    if (this.isDestroyed) return;
    this.resources.promises.add(promise);
    
    // Auto-remove when resolved/rejected
    promise.finally(() => {
      this.resources.promises.delete(promise);
    });
  }

  // Resource Unregistration Methods
  public unregisterVideo(video: HTMLVideoElement): void {
    this.resources.videos.delete(video);
    this.cleanupVideo(video);
  }

  public unregisterImage(image: HTMLImageElement): void {
    this.resources.images.delete(image);
    this.cleanupImage(image);
  }

  public clearTimer(timer: NodeJS.Timeout): void {
    this.resources.timers.delete(timer);
    clearTimeout(timer);
  }

  public clearInterval(interval: NodeJS.Interval): void {
    this.resources.intervals.delete(interval);
    clearInterval(interval);
  }

  public disconnectObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver | PerformanceObserver): void {
    this.resources.observers.delete(observer);
    observer.disconnect();
  }

  public cancelAnimation(animationId: number): void {
    this.resources.animations.delete(animationId);
    cancelAnimationFrame(animationId);
  }

  // Memory Monitoring
  private startMemoryMonitoring(): void {
    const measure = () => {
      if (this.isDestroyed) return;
      
      const stats = this.getMemoryStats();
      this.memoryHistory.push(stats);
      
      // Keep only last 100 measurements
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }
      
      // Check for memory threshold breach
      if (stats.usedJSHeapSize > this.config.memoryThreshold) {
        this.handleMemoryPressure(stats);
      }
      
      // Detect memory leaks
      if (this.config.enableLeakDetection) {
        this.detectMemoryLeaks();
      }
    };

    // Measure every 5 seconds
    const interval = setInterval(measure, 5000);
    this.registerInterval(interval);
  }

  public getMemoryStats(): MemoryStats {
    if (!('memory' in performance)) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        timestamp: Date.now(),
        trend: 'stable'
      };
    }

    const memory = (performance as any).memory;
    const current = memory.usedJSHeapSize / 1048576; // Convert to MB
    const previous = this.memoryHistory[this.memoryHistory.length - 1]?.usedJSHeapSize || current;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (current > previous * 1.1) {
      trend = 'increasing';
    } else if (current < previous * 0.9) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      usedJSHeapSize: current,
      totalJSHeapSize: memory.totalJSHeapSize / 1048576,
      jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576,
      timestamp: Date.now(),
      trend
    };
  }

  private handleMemoryPressure(stats: MemoryStats): void {
    console.warn(`Memory pressure detected: ${stats.usedJSHeapSize.toFixed(2)}MB used`);
    
    // Trigger garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clean up old resources
    this.cleanupOldResources();
    
    // Dispatch memory pressure event
    const event = new CustomEvent('memoryPressure', {
      detail: { stats, threshold: this.config.memoryThreshold }
    });
    document.dispatchEvent(event);
  }

  private detectMemoryLeaks(): void {
    if (this.memoryHistory.length < 10) return;
    
    const recent = this.memoryHistory.slice(-10);
    const isIncreasing = recent.every((stat, index) => {
      if (index === 0) return true;
      return stat.usedJSHeapSize > recent[index - 1].usedJSHeapSize;
    });
    
    if (isIncreasing) {
      console.warn('Potential memory leak detected - memory consistently increasing');
      this.performLeakDetection();
    }
  }

  private performLeakDetection(): void {
    // Check for common leak patterns
    const leakChecks = [
      { name: 'Videos', resources: this.resources.videos, maxAge: this.config.maxResourceAge },
      { name: 'Images', resources: this.resources.images, maxAge: this.config.maxResourceAge },
      { name: 'Timers', resources: this.resources.timers, maxAge: this.config.maxResourceAge },
      { name: 'Intervals', resources: this.resources.intervals, maxAge: this.config.maxResourceAge }
    ];

    leakChecks.forEach(check => {
      if (check.resources.size > 50) { // Arbitrary threshold for potential leaks
        console.warn(`Potential leak in ${check.name}: ${check.resources.size} resources registered`);
      }
    });
  }

  // Cleanup Methods
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldResources();
    }, this.config.cleanupInterval);
  }

  private cleanupOldResources(): void {
    const now = Date.now();
    
    // Clean up old images
    this.resources.images.forEach(image => {
      if (now - image.dataset.timestamp! > this.config.maxResourceAge) {
        this.unregisterImage(image);
      }
    });
    
    // Clean up completed animations
    this.resources.animations.forEach(animationId => {
      // Animation frames are automatically cleaned up after execution
      // This is more for tracking purposes
    });
  }

  private cleanupVideo(video: HTMLVideoElement): void {
    try {
      video.pause();
      video.src = '';
      video.load();
      
      // Remove all sources
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }
      
      // Clear any references
      video.removeAttribute('src');
      video.removeAttribute('poster');
    } catch (error) {
      console.warn('Video cleanup failed:', error);
    }
  }

  private cleanupImage(image: HTMLImageElement): void {
    try {
      image.src = '';
      image.removeAttribute('src');
      image.removeAttribute('srcset');
    } catch (error) {
      console.warn('Image cleanup failed:', error);
    }
  }

  private monitorVideoMemory(video: HTMLVideoElement): void {
    if (!('getVideoPlaybackQuality' in video)) return;
    
    const monitor = () => {
      if (this.isDestroyed || !document.contains(video)) return;
      
      const quality = (video as any).getVideoPlaybackQuality();
      const memoryUsage = quality.droppedVideoFrames / quality.totalVideoFrames;
      
      if (memoryUsage > 0.1) { // More than 10% dropped frames
        console.warn('High memory usage detected in video playback');
        this.handleVideoMemoryPressure(video);
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  private handleVideoMemoryPressure(video: HTMLVideoElement): void {
    // Reduce video quality
    if (video.videoWidth > 1280) {
      video.style.width = '1280px';
      video.style.height = '720px';
    }
    
    // Clear buffer if needed
    if ('buffered' in video && video.buffered.length > 0) {
      // Reduce buffer size to free memory
      const currentTime = video.currentTime;
      video.currentTime = 0.1;
      video.currentTime = currentTime;
    }
  }

  public cleanupAll(): void {
    console.log('Performing comprehensive cleanup...');
    
    // Clean up videos
    this.resources.videos.forEach(video => this.cleanupVideo(video));
    this.resources.videos.clear();
    
    // Clean up images
    this.resources.images.forEach(image => this.cleanupImage(image));
    this.resources.images.clear();
    
    // Clear timers
    this.resources.timers.forEach(timer => clearTimeout(timer));
    this.resources.timers.clear();
    
    // Clear intervals
    this.resources.intervals.forEach(interval => clearInterval(interval));
    this.resources.intervals.clear();
    
    // Remove event listeners
    this.resources.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ type, listener }) => {
        target.removeEventListener(type, listener);
      });
    });
    this.resources.eventListeners.clear();
    
    // Disconnect observers
    this.resources.observers.forEach(observer => observer.disconnect());
    this.resources.observers.clear();
    
    // Cancel animations
    this.resources.animations.forEach(id => cancelAnimationFrame(id));
    this.resources.animations.clear();
    
    // Clear auto-cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  public getResourceCounts(): { [key: string]: number } {
    return {
      videos: this.resources.videos.size,
      images: this.resources.images.size,
      timers: this.resources.timers.size,
      intervals: this.resources.intervals.size,
      eventListeners: Array.from(this.resources.eventListeners.values())
        .reduce((total, listeners) => total + listeners.length, 0),
      observers: this.resources.observers.size,
      animations: this.resources.animations.size,
      promises: this.resources.promises.size
    };
  }

  public getMemoryHistory(): MemoryStats[] {
    return [...this.memoryHistory];
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.cleanupAll();
    this.memoryHistory = [];
  }
}

export { MemoryManager, type MemoryStats, type ResourceRegistry, type MemoryManagerConfig };
```

### 2. Resource Cleanup Hook (`src/hooks/useResourceCleanup.ts`)

```typescript
/**
 * React Hook for Automatic Resource Cleanup
 * Provides easy cleanup management for React components
 */

import { useEffect, useRef, useCallback } from 'react';
import { MemoryManager } from '../lib/memory-manager';

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
    intervals: NodeJS.Interval[];
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
  const registerInterval = useCallback((callback: () => void, delay: number): NodeJS.Interval => {
    const interval = setInterval(callback, delay);
    memoryManager.registerInterval(interval);
    resourcesRef.current.intervals.push(interval);
    
    return interval;
  }, [memoryManager]);

  const clearCustomInterval = useCallback((interval: NodeJS.Interval) => {
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
            console.warn('Cleanup function failed:', error);
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
```

### 3. Performance Optimizer (`src/lib/performance-optimizer.ts`)

```typescript
/**
 * Performance Optimizer for ArcheForge Landing Page
 * Provides automatic performance optimization and monitoring
 */

export interface PerformanceConfig {
  enableImageOptimization: boolean;
  enableVideoOptimization: boolean;
  enableAnimationOptimization: boolean;
  enableMemoryOptimization: boolean;
  lazyLoadThreshold: number;
  imageQuality: 'low' | 'medium' | 'high' | 'auto';
  videoQuality: 'low' | 'medium' | 'high' | 'auto';
}

export interface OptimizationMetrics {
  imagesOptimized: number;
  videosOptimized: number;
  memorySaved: number; // MB
  loadTimeReduced: number; // ms
  fpsImproved: number;
}

class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: OptimizationMetrics;
  private observer?: IntersectionObserver;
  private optimizedElements: Set<HTMLElement> = new Set();

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.metrics = {
      imagesOptimized: 0,
      videosOptimized: 0,
      memorySaved: 0,
      loadTimeReduced: 0,
      fpsImproved: 0
    };

    this.initializeOptimization();
  }

  private initializeOptimization(): void {
    if (this.config.enableImageOptimization) {
      this.setupImageOptimization();
    }

    if (this.config.enableVideoOptimization) {
      this.setupVideoOptimization();
    }

    if (this.config.enableAnimationOptimization) {
      this.setupAnimationOptimization();
    }

    if (this.config.enableMemoryOptimization) {
      this.setupMemoryOptimization();
    }

    // Set up lazy loading
    this.setupLazyLoading();
  }

  // Image Optimization
  private setupImageOptimization(): void {
    const optimizeImage = (img: HTMLImageElement) => {
      if (this.optimizedElements.has(img)) return;

      // Determine optimal quality based on device and network
      const quality = this.getOptimalImageQuality();
      
      // Update image source if needed
      if (quality !== 'high' && img.src.includes('high')) {
        const optimizedSrc = img.src.replace('high', quality);
        img.src = optimizedSrc;
        this.metrics.imagesOptimized++;
      }

      // Add loading optimization
      img.loading = 'lazy';
      img.decoding = 'async';

      // Set appropriate sizes
      if (!img.sizes) {
        img.sizes = this.getResponsiveImageSizes(img);
      }

      this.optimizedElements.add(img);
    };

    // Optimize existing images
    document.querySelectorAll('img').forEach(optimizeImage);

    // Watch for new images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const images = element.querySelectorAll('img');
            images.forEach(optimizeImage);
            
            if (element.tagName === 'IMG') {
              optimizeImage(element as HTMLImageElement);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private getOptimalImageQuality(): string {
    const deviceType = this.getDeviceType();
    const networkSpeed = this.getNetworkSpeed();
    
    if (this.config.imageQuality !== 'auto') {
      return this.config.imageQuality;
    }

    if (deviceType === 'mobile' || networkSpeed < 3) {
      return 'low';
    } else if (deviceType === 'tablet' || networkSpeed < 10) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private getResponsiveImageSizes(img: HTMLImageElement): string {
    const deviceType = this.getDeviceType();
    
    switch (deviceType) {
      case 'mobile':
        return '(max-width: 768px) 100vw, 768px';
      case 'tablet':
        return '(max-width: 1024px) 100vw, 1024px';
      default:
        return '100vw';
    }
  }

  // Video Optimization
  private setupVideoOptimization(): void {
    const optimizeVideo = (video: HTMLVideoElement) => {
      if (this.optimizedElements.has(video)) return;

      // Set optimal quality
      const quality = this.getOptimalVideoQuality();
      
      // Optimize video attributes
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', 'true');

      // Set appropriate poster image
      if (!video.poster && quality !== 'high') {
        video.poster = this.getOptimalPosterImage(quality);
      }

      // Optimize buffer size
      if ('buffered' in video) {
        video.addEventListener('progress', () => {
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const bufferTarget = Math.min(video.duration * 0.3, 30); // Buffer 30% or 30 seconds
            
            if (bufferedEnd > bufferTarget) {
              // Pause buffering to save memory
              video.pause();
              setTimeout(() => {
                if (video.paused && video.readyState >= 3) {
                  video.play().catch(() => {});
                }
              }, 1000);
            }
          }
        });
      }

      this.optimizedElements.add(video);
      this.metrics.videosOptimized++;
    };

    // Optimize existing videos
    document.querySelectorAll('video').forEach(optimizeVideo);

    // Watch for new videos
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const videos = element.querySelectorAll('video');
            videos.forEach(optimizeVideo);
            
            if (element.tagName === 'VIDEO') {
              optimizeVideo(element as HTMLVideoElement);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private getOptimalVideoQuality(): string {
    const deviceType = this.getDeviceType();
    const networkSpeed = this.getNetworkSpeed();
    
    if (this.config.videoQuality !== 'auto') {
      return this.config.videoQuality;
    }

    if (deviceType === 'mobile' || networkSpeed < 2) {
      return 'low';
    } else if (deviceType === 'tablet' || networkSpeed < 8) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private getOptimalPosterImage(quality: string): string {
    const baseUrl = 'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground';
    return `${baseUrl}_${quality}.jpg`;
  }

  // Animation Optimization
  private setupAnimationOptimization(): void {
    // Reduce animation complexity on low-end devices
    const deviceType = this.getDeviceType();
    const networkSpeed = this.getNetworkSpeed();
    
    if (deviceType === 'mobile' || networkSpeed < 5) {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      document.documentElement.style.setProperty('--transition-duration', '0.2s');
      
      // Disable non-essential animations
      const style = document.createElement('style');
      style.textContent = `
        @media (max-width: 768px) {
          .animate-pulse { animation: none !important; }
          .animate-bounce { animation: none !important; }
          .animate-spin { animation: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    // Optimize animation performance
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="motion-"]');
    animatedElements.forEach(element => {
      (element as HTMLElement).style.willChange = 'transform, opacity';
      (element as HTMLElement).style.transform = 'translateZ(0)';
    });
  }

  // Memory Optimization
  private setupMemoryOptimization(): void {
    // Implement memory-saving techniques
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryPressure = () => {
        const usedMB = memory.usedJSHeapSize / 1048576;
        
        if (usedMB > 100) { // 100MB threshold
          // Trigger garbage collection if available
          if ('gc' in window) {
            (window as any).gc();
          }
          
          // Clear image caches
          this.clearImageCaches();
          
          // Reduce video quality
          this.reduceVideoQuality();
        }
      };

      // Check memory pressure every 10 seconds
      setInterval(memoryPressure, 10000);
    }
  }

  private clearImageCaches(): void {
    // Clear image bitmaps from canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  }

  private reduceVideoQuality(): void {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video.videoWidth > 1280) {
        video.style.width = '1280px';
        video.style.height = '720px';
      }
    });
  }

  // Lazy Loading Setup
  private setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          
          // Load lazy content
          if (element.dataset.src) {
            element.src = element.dataset.src;
            delete element.dataset.src;
          }
          
          if (element.dataset.poster) {
            (element as HTMLVideoElement).poster = element.dataset.poster;
            delete element.dataset.poster;
          }
          
          this.observer?.unobserve(element);
        }
      });
    }, {
      rootMargin: `${this.config.lazyLoadThreshold}px`
    });

    // Observe elements with lazy loading
    document.querySelectorAll('[data-src], [data-poster]').forEach(element => {
      this.observer?.observe(element);
    });
  }

  // Helper Methods
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getNetworkSpeed(): number {
    if ('connection' in navigator) {
      return (navigator as any).connection.downlink || 0;
    }
    return 10; // Default to fast connection
  }

  // Public API
  public optimizeElement(element: HTMLElement): void {
    if (element.tagName === 'IMG' && this.config.enableImageOptimization) {
      // Use image optimization logic
    } else if (element.tagName === 'VIDEO' && this.config.enableVideoOptimization) {
      // Use video optimization logic
    }
  }

  public getMetrics(): OptimizationMetrics {
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.metrics = {
      imagesOptimized: 0,
      videosOptimized: 0,
      memorySaved: 0,
      loadTimeReduced: 0,
      fpsImproved: 0
    };
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.optimizedElements.clear();
  }
}

export { PerformanceOptimizer, type PerformanceConfig, type OptimizationMetrics };
```

## Integration with Existing Components

### Enhanced Landing Page with Memory Management

```typescript
// Update to src/components/landing-page.tsx
import { MemoryManager, MemoryManagerConfig } from '../lib/memory-manager';
import { useResourceCleanup } from '../hooks/useResourceCleanup';
import { PerformanceOptimizer, PerformanceConfig } from '../lib/performance-optimizer';

const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  onCTAClick,
  videoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  autoPlay = true
}) => {
  // Initialize memory manager
  const [memoryManager] = useState(() => new MemoryManager({
    enableAutoCleanup: true,
    cleanupInterval: 30000, // 30 seconds
    memoryThreshold: 100, // 100MB
    enableLeakDetection: true,
    maxResourceAge: 300000, // 5 minutes
    enablePerformanceMonitoring: true
  }));

  // Initialize performance optimizer
  const [performanceOptimizer] = useState(() => new PerformanceOptimizer({
    enableImageOptimization: true,
    enableVideoOptimization: true,
    enableAnimationOptimization: true,
    enableMemoryOptimization: true,
    lazyLoadThreshold: 200,
    imageQuality: 'auto',
    videoQuality: 'auto'
  }));

  // Resource cleanup hook
  const { registerVideo, registerImage, addEventListener, addCleanupFunction } = useResourceCleanup(memoryManager);

  // Enhanced video completion handler with memory management
  const handleVideoComplete = useCallback(() => {
    // Track completion
    analytics?.trackVideoCompletion(30);
    
    // Clean up video resources
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      memoryManager.unregisterVideo(video);
    }
    
    // Existing logic...
  }, [analytics, memoryManager]);

  // Enhanced CTA click handler
  const handleCTAClick = useCallback(() => {
    analytics?.trackCTAClick('ENTER THE FORGE', 'landing-page-hero');
    
    // Clean up any lingering resources
    memoryManager.cleanupOldResources();
    
    onCTAClick?.();
  }, [analytics, memoryManager, onCTAClick]);

  // Memory pressure handling
  useEffect(() => {
    const handleMemoryPressure = (event: CustomEvent) => {
      console.warn('Memory pressure detected, optimizing performance');
      performanceOptimizer.optimizeElement(event.target as HTMLElement);
    };

    document.addEventListener('memoryPressure', handleMemoryPressure as EventListener);
    
    return () => {
      document.removeEventListener('memoryPressure', handleMemoryPressure as EventListener);
    };
  }, [performanceOptimizer]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const memoryStats = memoryManager.getMemoryStats();
      const performanceMetrics = performanceOptimizer.getMetrics();
      
      // Log performance data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Memory Stats:', memoryStats);
        console.log('Performance Metrics:', performanceMetrics);
      }
      
      // Send to analytics if significant
      if (memoryStats.usedJSHeapSize > 80) {
        analytics?.trackPerformanceMetric('highMemoryUsage', memoryStats.usedJSHeapSize);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [memoryManager, performanceOptimizer, analytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      memoryManager.destroy();
      performanceOptimizer.destroy();
    };
  }, [memoryManager, performanceOptimizer]);

  // Rest of component remains the same...
};
```

## Testing Strategy

### Memory Management Tests

```typescript
// src/test/memory-manager.test.ts
import { MemoryManager, MemoryManagerConfig } from '../lib/memory-manager';

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  let mockConfig: MemoryManagerConfig;

  beforeEach(() => {
    mockConfig = {
      enableAutoCleanup: true,
      cleanupInterval: 1000,
      memoryThreshold: 50,
      enableLeakDetection: true,
      maxResourceAge: 5000,
      enablePerformanceMonitoring: true
    };
    memoryManager = new MemoryManager(mockConfig);
  });

  test('should register and track video resources', () => {
    const video = document.createElement('video');
    memoryManager.registerVideo(video);
    
    const counts = memoryManager.getResourceCounts();
    expect(counts.videos).toBe(1);
  });

  test('should clean up video resources', () => {
    const video = document.createElement('video');
    memoryManager.registerVideo(video);
    memoryManager.unregisterVideo(video);
    
    const counts = memoryManager.getResourceCounts();
    expect(counts.videos).toBe(0);
  });

  test('should detect memory pressure', () => {
    const mockMemoryStats = {
      usedJSHeapSize: 60, // Above threshold of 50
      totalJSHeapSize: 100,
      jsHeapSizeLimit: 2048,
      timestamp: Date.now(),
      trend: 'increasing'
    };

    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: { usedJSHeapSize: 60 * 1048576 },
      configurable: true
    });

    const handleMemoryPressure = jest.fn();
    document.addEventListener('memoryPressure', handleMemoryPressure);

    // Trigger memory check
    memoryManager.getMemoryStats();

    expect(handleMemoryPressure).toHaveBeenCalled();
  });
});
```

### Performance Optimizer Tests

```typescript
// src/test/performance-optimizer.test.ts
import { PerformanceOptimizer, PerformanceConfig } from '../lib/performance-optimizer';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;
  let mockConfig: PerformanceConfig;

  beforeEach(() => {
    mockConfig = {
      enableImageOptimization: true,
      enableVideoOptimization: true,
      enableAnimationOptimization: true,
      enableMemoryOptimization: true,
      lazyLoadThreshold: 100,
      imageQuality: 'auto',
      videoQuality: 'auto'
    };
    optimizer = new PerformanceOptimizer(mockConfig);
  });

  test('should optimize image quality based on device', () => {
    const img = document.createElement('img');
    img.src = 'https://example.com/image-high.jpg';
    
    // Mock mobile device
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    
    optimizer.optimizeElement(img);
    
    expect(img.src).toContain('low');
  });

  test('should set up lazy loading for images', () => {
    const img = document.createElement('img');
    img.dataset.src = 'https://example.com/image.jpg';
    
    optimizer.optimizeElement(img);
    
    expect(img.loading).toBe('lazy');
  });
});
```

## Implementation Checklist

- [ ] Create memory management system with resource tracking
- [ ] Implement resource cleanup hook for React components
- [ ] Add performance optimizer with automatic optimization
- [ ] Integrate memory management into existing components
- [ ] Add memory pressure handling and recovery
- [ ] Implement automatic resource cleanup on unmount
- [ ] Add performance monitoring and reporting
- [ ] Create comprehensive tests for memory management
- [ ] Add documentation and usage examples
- [ ] Test memory leak detection and recovery

## Performance Targets

The memory management system should achieve:

- **Memory Usage**: < 100MB on mobile devices
- **Resource Cleanup**: Automatic cleanup of unused resources
- **Leak Detection**: Identify memory leaks within 10 seconds
- **Performance Impact**: < 5ms overhead from memory management
- **Recovery Time**: < 1 second to recover from memory pressure
- **Resource Tracking**: 100% tracking of allocated resources

This comprehensive memory management system will ensure optimal performance and prevent memory leaks across all devices and usage patterns.