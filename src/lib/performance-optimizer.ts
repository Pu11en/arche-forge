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

  private getResponsiveImageSizes(_img: HTMLImageElement): string {
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
            (element as HTMLImageElement).src = element.dataset.src;
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

export { PerformanceOptimizer };