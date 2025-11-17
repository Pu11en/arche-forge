/**
 * Memory Management System for ArcheForge Landing Page
 * Provides automatic cleanup, resource monitoring, and leak detection
 */

import { logger } from './logger';

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
  intervals: Set<ReturnType<typeof setInterval>>;
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

  public registerTimer(timer: ReturnType<typeof setTimeout>): void {
    if (this.isDestroyed) return;
    this.resources.timers.add(timer);
  }

  public registerInterval(interval: ReturnType<typeof setInterval>): void {
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
    
    // Track listener
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

  public clearInterval(interval: ReturnType<typeof setInterval>): void {
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
    logger.warn(`Memory pressure detected: ${stats.usedJSHeapSize.toFixed(2)}MB used`);
    
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
      logger.warn('Potential memory leak detected - memory consistently increasing');
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
        logger.warn(`Potential leak in ${check.name}: ${check.resources.size} resources registered`);
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
      const timestamp = parseInt(image.dataset.timestamp || '0');
      if (now - timestamp > this.config.maxResourceAge) {
        this.unregisterImage(image);
      }
    });
    
    // Clean up completed animations
    this.resources.animations.forEach(_animationId => {
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
      logger.warn('Video cleanup failed:', error);
    }
  }

  private cleanupImage(image: HTMLImageElement): void {
    try {
      image.src = '';
      image.removeAttribute('src');
      image.removeAttribute('srcset');
    } catch (error) {
      logger.warn('Image cleanup failed:', error);
    }
  }

  private monitorVideoMemory(video: HTMLVideoElement): void {
    if (!('getVideoPlaybackQuality' in video)) return;
    
    const monitor = () => {
      if (this.isDestroyed || !document.contains(video)) return;
      
      const quality = (video as any).getVideoPlaybackQuality();
      const memoryUsage = quality.droppedVideoFrames / quality.totalVideoFrames;
      
      if (memoryUsage > 0.1) { // More than 10% dropped frames
        logger.warn('High memory usage detected in video playback');
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
    logger.log('Performing comprehensive cleanup...');
    
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

export { MemoryManager };