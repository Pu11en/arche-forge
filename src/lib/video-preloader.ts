/**
 * Enhanced Video Preloading System with Adaptive Bitrate Streaming
 * Optimizes video loading based on device capabilities and network conditions
 */

export interface VideoSource {
  src: string;
  type: string;
  bitrate?: number;
  resolution?: string;
  quality: 'low' | 'medium' | 'high' | 'auto';
}

export interface VideoPreloaderConfig {
  enableAdaptiveStreaming: boolean;
  preloadStrategy: 'none' | 'metadata' | 'auto';
  networkThresholds: {
    slow: number; // Mbps
    fast: number; // Mbps
  };
  deviceProfiles: {
    mobile: VideoSource[];
    tablet: VideoSource[];
    desktop: VideoSource[];
  };
}

class VideoPreloader {
  private config: VideoPreloaderConfig;
  private networkSpeed: number = 0;
  private deviceType: 'mobile' | 'tablet' | 'desktop';
  private preloadCache: Map<string, HTMLVideoElement> = new Map();

  constructor(config: VideoPreloaderConfig) {
    this.config = config;
    this.deviceType = this.detectDeviceType();
    this.initializeNetworkMonitoring();
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private initializeNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.networkSpeed = connection.downlink || 0;

      connection.addEventListener('change', () => {
        this.networkSpeed = connection.downlink || 0;
      });
    } else {
      // Fallback: estimate network speed from resource timing
      this.estimateNetworkSpeed();
    }
  }

  private async estimateNetworkSpeed(): Promise<void> {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/network-test', { cache: 'no-store' });
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      if (response.ok) {
        const size = parseInt(response.headers.get('content-length') || '0');
        this.networkSpeed = (size * 8) / (duration * 1024 * 1024); // Mbps
      }
    } catch (error) {
      console.warn('Network speed estimation failed:', error);
    }
  }

  public getOptimalVideoSources(): VideoSource[] {
    const deviceSources = this.config.deviceProfiles[this.deviceType];
    
    if (!this.config.enableAdaptiveStreaming) {
      return deviceSources.filter(source => source.quality === 'medium');
    }

    // Adaptive streaming based on network speed
    if (this.networkSpeed < this.config.networkThresholds.slow) {
      return deviceSources.filter(source => source.quality === 'low');
    } else if (this.networkSpeed >= this.config.networkThresholds.fast) {
      return deviceSources.filter(source => source.quality === 'high');
    } else {
      return deviceSources.filter(source => source.quality === 'medium');
    }
  }

  public async preloadVideo(sources: VideoSource[]): Promise<HTMLVideoElement> {
    const cacheKey = sources.map(s => s.src).join('|');
    
    if (this.preloadCache.has(cacheKey)) {
      return this.preloadCache.get(cacheKey)!;
    }

    const video = document.createElement('video');
    video.preload = this.config.preloadStrategy;
    video.muted = true;
    video.playsInline = true;

    // Add sources in order of preference
    sources.forEach(source => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source.src;
      sourceElement.type = source.type;
      video.appendChild(sourceElement);
    });

    return new Promise((resolve, reject) => {
      video.addEventListener('loadeddata', () => {
        this.preloadCache.set(cacheKey, video);
        resolve(video);
      }, { once: true });

      video.addEventListener('error', (error) => {
        reject(new Error(`Video preload failed: ${error}`));
      }, { once: true });

      // Start loading
      video.load();
    });
  }

  public preloadCriticalAssets(): Promise<void> {
    const criticalSources = this.getOptimalVideoSources();
    const preloadPromises: Promise<void>[] = [];

    criticalSources.forEach(source => {
      if (source.quality === 'auto' || source.quality === 'high') {
        // Preload high priority videos
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = source.src;
        link.as = 'video';
        link.type = source.type;
        document.head.appendChild(link);
        
        preloadPromises.push(
          new Promise<void>((resolve) => {
            link.onload = () => resolve();
            link.onerror = () => resolve();
          })
        );
      }
    });

    return Promise.all(preloadPromises).then(() => {});
  }

  public createVideoElement(sources: VideoSource[]): HTMLVideoElement {
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.setAttribute('preload', this.config.preloadStrategy);

    // Add responsive sources
    sources.forEach(source => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source.src;
      sourceElement.type = source.type;
      if (source.resolution) {
        sourceElement.setAttribute('media', `(max-width: ${this.getResolutionBreakpoint(source.resolution)})`);
      }
      video.appendChild(sourceElement);
    });

    return video;
  }

  private getResolutionBreakpoint(resolution: string): string {
    const width = parseInt(resolution.split('x')[0]);
    if (width <= 640) return '640px';
    if (width <= 960) return '960px';
    if (width <= 1280) return '1280px';
    return '1920px';
  }

  public clearCache(): void {
    this.preloadCache.clear();
  }

  public getNetworkSpeed(): number {
    return this.networkSpeed;
  }

  public getDeviceType(): string {
    return this.deviceType;
  }
}

export { VideoPreloader };