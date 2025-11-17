/**
 * Comprehensive Analytics Framework for ArcheForge Landing Page
 * Tracks user engagement, performance metrics, and interaction patterns
 */

export interface AnalyticsEvent {
  name: string;
  timestamp: number;
  data?: Record<string, any>;
  sessionId: string;
  userId?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserInfo: string;
  viewportSize: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  videoLoadTime?: number;
  videoPlaybackQuality?: {
    droppedFrames: number;
    totalFrames: number;
    averageLatency: number;
  };
}

export interface UserEngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  clickEvents: number;
  videoCompletion: boolean;
  videoWatchTime: number;
  ctaClicks: number;
  touchInteractions: number;
  bounceRate: boolean;
}

export interface ForgeAnalyticsConfig {
  enableGoogleAnalytics: boolean;
  enableCustomAnalytics: boolean;
  apiEndpoint?: string;
  sampleRate: number;
  debugMode: boolean;
}

class ForgeAnalytics {
  private config: ForgeAnalyticsConfig;
  private sessionId: string;
  private startTime: number;
  private interactionEvents: AnalyticsEvent[] = [];
  private performanceObserver?: PerformanceObserver;
  private videoMetrics?: PerformanceMetrics['videoPlaybackQuality'];

  constructor(config: ForgeAnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    this.setupPerformanceMonitoring();
    this.setupUserInteractionTracking();
    this.setupVideoTracking();
    this.setupPageVisibilityTracking();
  }

  // Performance Monitoring
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      // Core Web Vitals monitoring
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackPerformanceMetric('lcp', entry.startTime);
          } else if (entry.entryType === 'first-input') {
            this.trackPerformanceMetric('fid', (entry as any).processingStart - entry.startTime);
          } else if (entry.entryType === 'layout-shift') {
            this.trackPerformanceMetric('cls', (entry as any).value);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }

    // Page load timing
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.trackPerformanceMetric('pageLoadTime', loadTime);
    });
  }

  // User Interaction Tracking
  private setupUserInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackEvent('click', {
        element: target.tagName,
        elementId: target.id,
        elementClass: target.className,
        text: target.textContent?.slice(0, 50),
        coordinates: { x: event.clientX, y: event.clientY }
      });
    }, { passive: true });

    // Scroll depth tracking
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const scrollPercent = Math.round((currentScroll / scrollHeight) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        this.trackEvent('scrollDepth', { depth: scrollPercent });
      }
    }, { passive: true });

    // Touch interaction tracking
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', (event) => {
        this.trackEvent('touch', {
          touchCount: event.touches.length,
          coordinates: {
            x: event.touches[0]?.clientX,
            y: event.touches[0]?.clientY
          }
        });
      }, { passive: true });
    }
  }

  // Video Tracking
  private setupVideoTracking(): void {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      // Video load time
      video.addEventListener('loadeddata', () => {
        const loadTime = performance.now() - this.startTime;
        this.trackPerformanceMetric('videoLoadTime', loadTime);
      });

      // Video playback quality
      if ('getVideoPlaybackQuality' in video) {
        const qualityInterval = setInterval(() => {
          const quality = (video as any).getVideoPlaybackQuality();
          this.videoMetrics = {
            droppedFrames: quality.droppedVideoFrames,
            totalFrames: quality.totalVideoFrames,
            averageLatency: 0 // Browser doesn't provide this directly
          };
        }, 1000);

        video.addEventListener('ended', () => {
          clearInterval(qualityInterval);
          this.trackEvent('videoCompleted', {
            duration: video.duration,
            quality: this.videoMetrics
          });
        });
      }

      // Video engagement
      video.addEventListener('play', () => {
        this.trackEvent('videoPlay', {
          currentTime: video.currentTime,
          duration: video.duration
        });
      });

      video.addEventListener('pause', () => {
        this.trackEvent('videoPause', {
          currentTime: video.currentTime,
          duration: video.duration
        });
      });
    });
  }

  // Page Visibility Tracking
  private setupPageVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('pageHidden');
      } else {
        this.trackEvent('pageVisible');
      }
    });
  }

  // Public API Methods
  public trackEvent(eventName: string, data?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      timestamp: performance.now() - this.startTime,
      data,
      sessionId: this.sessionId,
      deviceType: this.getDeviceType(),
      browserInfo: this.getBrowserInfo(),
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    };

    this.interactionEvents.push(event);

    // Send to analytics endpoints
    if (this.config.enableCustomAnalytics) {
      this.sendToCustomAnalytics(event);
    }

    if (this.config.enableGoogleAnalytics) {
      this.sendToGoogleAnalytics(event);
    }

    if (this.config.debugMode) {
      console.log('Analytics Event:', event);
    }
  }

  public trackPerformanceMetric(metric: string, value: number): void {
    this.trackEvent('performance', { metric, value });
  }

  public trackCTAClick(buttonText: string, context?: string): void {
    const timeSpent = Math.round((performance.now() - this.startTime) / 1000);
    this.trackEvent('ctaClicked', {
      buttonText,
      context,
      timeSpent,
      deviceType: this.getDeviceType(),
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  public trackVideoCompletion(videoDuration: number): void {
    this.trackEvent('videoCompleted', {
      duration: videoDuration,
      completionRate: 1.0,
      quality: this.videoMetrics
    });
  }

  public getEngagementMetrics(): UserEngagementMetrics {
    const timeOnPage = Math.round((performance.now() - this.startTime) / 1000);
    const clickEvents = this.interactionEvents.filter(e => e.name === 'click').length;
    const videoEvents = this.interactionEvents.filter(e => e.name.includes('video'));
    const ctaClicks = this.interactionEvents.filter(e => e.name === 'ctaClicked').length;
    const touchInteractions = this.interactionEvents.filter(e => e.name === 'touch').length;
    const videoCompleted = this.interactionEvents.some(e => e.name === 'videoCompleted');
    const videoWatchTime = videoEvents.reduce((total, event) => {
      return total + (event.data?.duration || 0);
    }, 0);

    // Calculate scroll depth
    const scrollEvents = this.interactionEvents.filter(e => e.name === 'scrollDepth');
    const maxScrollDepth = Math.max(0, ...scrollEvents.map(e => e.data?.depth || 0));

    return {
      timeOnPage,
      scrollDepth: maxScrollDepth,
      clickEvents,
      videoCompletion: videoCompleted,
      videoWatchTime,
      ctaClicks,
      touchInteractions,
      bounceRate: timeOnPage < 5 && clickEvents === 0 // Less than 5 seconds, no interactions
    };
  }

  // Private Helper Methods
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private sendToCustomAnalytics(event: AnalyticsEvent): void {
    if (!this.config.apiEndpoint) return;

    // Sample rate to reduce data volume
    if (Math.random() > this.config.sampleRate) return;

    fetch(`${this.config.apiEndpoint}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(error => {
      if (this.config.debugMode) {
        console.error('Analytics error:', error);
      }
    });
  }

  private sendToGoogleAnalytics(event: AnalyticsEvent): void {
    if ((window as any).gtag) {
      (window as any).gtag('event', event.name, {
        event_category: 'Forge_Interaction',
        custom_parameter_1: event.deviceType,
        custom_parameter_2: event.viewportSize,
        value: Math.round(event.timestamp)
      });
    }
  }

  // Cleanup method
  public destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // Send final engagement metrics
    const metrics = this.getEngagementMetrics();
    this.trackEvent('sessionEnd', metrics);
  }
}

export { ForgeAnalytics };