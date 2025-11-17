# ArcheForge Analytics Framework Implementation

## Overview
This document outlines the implementation of a comprehensive analytics framework for tracking user engagement, performance metrics, and interaction patterns on the ArcheForge landing page.

## Core Components

### 1. Analytics Framework (`src/lib/analytics-framework.ts`)

```typescript
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

export { ForgeAnalytics, type AnalyticsEvent, type PerformanceMetrics, type UserEngagementMetrics, type ForgeAnalyticsConfig };
```

### 2. Enhanced Video Preloading System (`src/lib/video-preloader.ts`)

```typescript
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

export { VideoPreloader, type VideoSource, type VideoPreloaderConfig };
```

### 3. Advanced Video Error Handling (`src/lib/video-error-handler.ts`)

```typescript
/**
 * Advanced Video Error Handling and Fallback Mechanisms
 * Provides graceful degradation and recovery strategies for video playback issues
 */

export interface VideoErrorContext {
  videoElement: HTMLVideoElement;
  error: Error | MediaError;
  sourceUrl: string;
  attempt: number;
  maxAttempts: number;
  fallbackStrategy: 'retry' | 'lower-quality' | 'image-fallback' | 'skip';
}

export interface VideoErrorHandlerConfig {
  maxRetryAttempts: number;
  retryDelay: number;
  enableQualityAdaptation: boolean;
  fallbackImageUrls: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  fallbackVideoSources: {
    low: string;
    medium: string;
  };
}

class VideoErrorHandler {
  private config: VideoErrorHandlerConfig;
  private retryAttempts: Map<string, number> = new Map();
  private errorLog: VideoErrorContext[] = [];

  constructor(config: VideoErrorHandlerConfig) {
    this.config = config;
  }

  public handleVideoError(context: VideoErrorContext): Promise<boolean> {
    this.logError(context);

    const attemptKey = `${context.sourceUrl}_${context.videoElement.id}`;
    const currentAttempt = this.retryAttempts.get(attemptKey) || 0;

    if (currentAttempt >= context.maxAttempts) {
      return this.executeFallbackStrategy(context);
    }

    // Increment retry count
    this.retryAttempts.set(attemptKey, currentAttempt + 1);

    // Determine recovery strategy based on error type
    if (this.isNetworkError(context.error)) {
      return this.handleNetworkError(context, currentAttempt);
    } else if (this.isCodecError(context.error)) {
      return this.handleCodecError(context);
    } else if (this.isResourceError(context.error)) {
      return this.handleResourceError(context);
    } else {
      return this.handleGenericError(context);
    }
  }

  private isNetworkError(error: Error | MediaError): boolean {
    if (error instanceof MediaError) {
      return error.code === MediaError.MEDIA_ERR_NETWORK;
    }
    return error.message.includes('network') || error.message.includes('fetch');
  }

  private isCodecError(error: Error | MediaError): boolean {
    if (error instanceof MediaError) {
      return error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
    }
    return error.message.includes('codec') || error.message.includes('format');
  }

  private isResourceError(error: Error | MediaError): boolean {
    if (error instanceof MediaError) {
      return error.code === MediaError.MEDIA_ERR_DECODE;
    }
    return error.message.includes('decode') || error.message.includes('corrupt');
  }

  private async handleNetworkError(context: VideoErrorContext, attempt: number): Promise<boolean> {
    if (attempt < this.config.maxRetryAttempts) {
      // Exponential backoff
      const delay = this.config.retryDelay * Math.pow(2, attempt);
      await this.delay(delay);
      
      // Retry with same source
      return this.retryVideo(context, 'network-retry');
    } else {
      // Try lower quality
      return this.switchToLowerQuality(context);
    }
  }

  private async handleCodecError(context: VideoErrorContext): Promise<boolean> {
    if (this.config.enableQualityAdaptation) {
      return this.switchToLowerQuality(context);
    } else {
      return this.executeFallbackStrategy(context);
    }
  }

  private async handleResourceError(context: VideoErrorContext): Promise<boolean> {
    // Try different source format
    return this.tryAlternativeSource(context);
  }

  private async handleGenericError(context: VideoErrorContext): Promise<boolean> {
    // Generic retry strategy
    if (context.attempt < this.config.maxRetryAttempts) {
      return this.retryVideo(context, 'generic-retry');
    } else {
      return this.executeFallbackStrategy(context);
    }
  }

  private async retryVideo(context: VideoErrorContext, reason: string): Promise<boolean> {
    try {
      // Reset video element
      context.videoElement.pause();
      context.videoElement.currentTime = 0;
      context.videoElement.load();

      // Wait a bit before playing
      await this.delay(500);

      if (context.videoElement.autoplay) {
        await context.videoElement.play();
      }

      console.log(`Video retry successful (${reason})`);
      return true;
    } catch (error) {
      console.warn(`Video retry failed (${reason}):`, error);
      return false;
    }
  }

  private async switchToLowerQuality(context: VideoErrorContext): Promise<boolean> {
    const currentUrl = context.sourceUrl;
    let fallbackUrl = '';

    if (currentUrl.includes('high')) {
      fallbackUrl = this.config.fallbackVideoSources.medium;
    } else if (currentUrl.includes('medium')) {
      fallbackUrl = this.config.fallbackVideoSources.low;
    } else {
      return this.executeFallbackStrategy(context);
    }

    try {
      // Update video source
      context.videoElement.src = fallbackUrl;
      await context.videoElement.load();

      if (context.videoElement.autoplay) {
        await context.videoElement.play();
      }

      console.log(`Switched to lower quality: ${fallbackUrl}`);
      return true;
    } catch (error) {
      console.warn('Quality switch failed:', error);
      return this.executeFallbackStrategy(context);
    }
  }

  private async tryAlternativeSource(context: VideoErrorContext): Promise<boolean> {
    const currentType = this.getVideoType(context.sourceUrl);
    const alternativeSources = this.getAlternativeSources(context.sourceUrl);

    for (const source of alternativeSources) {
      try {
        context.videoElement.src = source.url;
        await context.videoElement.load();

        if (context.videoElement.autoplay) {
          await context.videoElement.play();
        }

        console.log(`Switched to alternative source: ${source.url} (${source.type})`);
        return true;
      } catch (error) {
        console.warn(`Alternative source failed: ${source.url}`, error);
        continue;
      }
    }

    return this.executeFallbackStrategy(context);
  }

  private async executeFallbackStrategy(context: VideoErrorContext): Promise<boolean> {
    switch (context.fallbackStrategy) {
      case 'image-fallback':
        return this.showImageFallback(context);
      case 'skip':
        return this.skipVideo(context);
      default:
        return false;
    }
  }

  private async showImageFallback(context: VideoErrorContext): Promise<boolean> {
    const deviceType = this.getDeviceType();
    const fallbackUrl = this.config.fallbackImageUrls[deviceType];

    try {
      // Create image element
      const img = document.createElement('img');
      img.src = fallbackUrl;
      img.alt = 'Video fallback image';
      img.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
      `;

      // Replace video with image
      const parent = context.videoElement.parentNode;
      if (parent) {
        parent.replaceChild(img, context.videoElement);
      }

      console.log(`Replaced video with image fallback: ${fallbackUrl}`);
      return true;
    } catch (error) {
      console.error('Image fallback failed:', error);
      return false;
    }
  }

  private async skipVideo(context: VideoErrorContext): Promise<boolean> {
    // Remove video element and trigger completion callback
    const parent = context.videoElement.parentNode;
    if (parent) {
      parent.removeChild(context.videoElement);
    }

    // Trigger video completion event
    const event = new CustomEvent('videoFallbackTriggered', {
      detail: { reason: 'error', context }
    });
    document.dispatchEvent(event);

    console.log('Video skipped due to unrecoverable error');
    return true;
  }

  private getVideoType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      case 'ogg': return 'video/ogg';
      default: return 'video/mp4';
    }
  }

  private getAlternativeSources(currentUrl: string): Array<{ url: string; type: string }> {
    const baseUrl = currentUrl.replace(/\.(mp4|webm|ogg)$/, '');
    return [
      { url: `${baseUrl}.webm`, type: 'video/webm' },
      { url: `${baseUrl}.mp4`, type: 'video/mp4' },
      { url: `${baseUrl}.ogg`, type: 'video/ogg' }
    ].filter(source => source.url !== currentUrl);
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private logError(context: VideoErrorContext): void {
    this.errorLog.push({
      ...context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      networkSpeed: (navigator as any).connection?.downlink || 'unknown'
    });

    console.error('Video Error:', context);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getErrorLog(): VideoErrorContext[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
  }
}

export { VideoErrorHandler, type VideoErrorContext, type VideoErrorHandlerConfig };
```

## Integration with Existing Components

### Updated Landing Page Component

The existing `LandingPage` component should be enhanced to integrate these new systems:

```typescript
// Add to src/components/landing-page.tsx
import { ForgeAnalytics, ForgeAnalyticsConfig } from '../lib/analytics-framework';
import { VideoPreloader, VideoPreloaderConfig } from '../lib/video-preloader';
import { VideoErrorHandler, VideoErrorHandlerConfig } from '../lib/video-error-handler';

// Add these to the LandingPage component
const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  onCTAClick,
  videoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  autoPlay = true
}) => {
  // Initialize analytics
  const [analytics] = useState(() => new ForgeAnalytics({
    enableGoogleAnalytics: true,
    enableCustomAnalytics: true,
    apiEndpoint: '/api/analytics',
    sampleRate: 0.1, // 10% sampling
    debugMode: process.env.NODE_ENV === 'development'
  }));

  // Initialize video preloader
  const [videoPreloader] = useState(() => new VideoPreloader({
    enableAdaptiveStreaming: true,
    preloadStrategy: 'auto',
    networkThresholds: {
      slow: 1.5, // 1.5 Mbps
      fast: 5.0  // 5.0 Mbps
    },
    deviceProfiles: {
      mobile: [
        { src: videoUrl.replace('.mp4', '-mobile.mp4'), type: 'video/mp4', quality: 'low' },
        { src: videoUrl, type: 'video/mp4', quality: 'medium' }
      ],
      tablet: [
        { src: videoUrl, type: 'video/mp4', quality: 'medium' },
        { src: videoUrl.replace('.mp4', '-high.mp4'), type: 'video/mp4', quality: 'high' }
      ],
      desktop: [
        { src: videoUrl.replace('.mp4', '-high.mp4'), type: 'video/mp4', quality: 'high' },
        { src: videoUrl, type: 'video/mp4', quality: 'medium' }
      ]
    }
  }));

  // Initialize video error handler
  const [videoErrorHandler] = useState(() => new VideoErrorHandler({
    maxRetryAttempts: 3,
    retryDelay: 1000,
    enableQualityAdaptation: true,
    fallbackImageUrls: {
      mobile: 'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg',
      tablet: 'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg',
      desktop: 'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg'
    },
    fallbackVideoSources: {
      low: 'https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4',
      medium: videoUrl
    }
  }));

  // Preload critical assets on mount
  useEffect(() => {
    videoPreloader.preloadCriticalAssets();
    
    // Cleanup analytics on unmount
    return () => {
      analytics.destroy();
    };
  }, [videoPreloader, analytics]);

  // Enhanced CTA click handler
  const handleCTAClick = useCallback(() => {
    analytics.trackCTAClick('ENTER THE FORGE', 'landing-page-hero');
    onCTAClick?.();
  }, [analytics, onCTAClick]);

  // Enhanced video completion handler
  const handleVideoComplete = useCallback(() => {
    analytics.trackVideoCompletion(30); // Assuming 30 second video
    // Existing video completion logic...
  }, [analytics]);

  // Enhanced video error handler
  const handleVideoError = useCallback(async (error: Error) => {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      const recovered = await videoErrorHandler.handleVideoError({
        videoElement,
        error,
        sourceUrl: videoUrl,
        attempt: 1,
        maxAttempts: 3,
        fallbackStrategy: 'image-fallback'
      });

      if (!recovered) {
        analytics.trackEvent('videoErrorFatal', { error: error.message });
      }
    }
    
    // Existing error logic...
  }, [videoErrorHandler, analytics, videoUrl]);

  // Rest of the component remains the same...
};
```

## Performance Monitoring Integration

### Performance Monitoring Hook (`src/hooks/usePerformanceMonitoring.ts`)

```typescript
/**
 * Performance Monitoring Hook for Real-time Performance Tracking
 */

import { useEffect, useState, useCallback } from 'react';
import { ForgeAnalytics } from '../lib/analytics-framework';

export interface PerformanceData {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  timestamp: number;
}

export const usePerformanceMonitoring = (analytics?: ForgeAnalytics) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 60,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    timestamp: Date.now()
  });

  const measureFPS = useCallback(() => {
    let lastTime = performance.now();
    let frames = 0;

    const measure = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        setPerformanceData(prev => ({
          ...prev,
          fps,
          timestamp: currentTime
        }));

        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measure);
    };

    requestAnimationFrame(measure);
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      
      setPerformanceData(prev => ({
        ...prev,
        memoryUsage: usedMB
      }));

      analytics?.trackPerformanceMetric('memoryUsage', usedMB);
    }
  }, [analytics]);

  const measureNetworkLatency = useCallback(async () => {
    try {
      const startTime = performance.now();
      await fetch('/api/ping', { cache: 'no-store' });
      const latency = performance.now() - startTime;

      setPerformanceData(prev => ({
        ...prev,
        networkLatency: Math.round(latency)
      }));

      analytics?.trackPerformanceMetric('networkLatency', latency);
    } catch (error) {
      console.warn('Network latency measurement failed:', error);
    }
  }, [analytics]);

  useEffect(() => {
    // Start FPS monitoring
    measureFPS();

    // Measure memory usage every 5 seconds
    const memoryInterval = setInterval(measureMemoryUsage, 5000);

    // Measure network latency every 10 seconds
    const networkInterval = setInterval(measureNetworkLatency, 10000);

    return () => {
      clearInterval(memoryInterval);
      clearInterval(networkInterval);
    };
  }, [measureFPS, measureMemoryUsage, measureNetworkLatency]);

  return performanceData;
};
```

## Deployment Considerations

### 1. Service Worker Implementation (`public/sw.js`)

```javascript
/**
 * Service Worker for Caching and Offline Support
 */

const CACHE_NAME = 'archeforge-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  'https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4',
  'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));

          return response;
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 2. Analytics API Endpoint (`src/api/analytics.ts`)

```typescript
/**
 * Analytics API Endpoint for Server-side Analytics Processing
 */

import { AnalyticsEvent } from '../lib/analytics-framework';

export const analyticsAPI = {
  async logEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Analytics logging failed:', error);
    }
  },

  async logPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
    } catch (error) {
      console.error('Performance metrics logging failed:', error);
    }
  },

  async getEngagementMetrics(sessionId: string): Promise<UserEngagementMetrics | null> {
    try {
      const response = await fetch(`/api/analytics/engagement/${sessionId}`);
      return await response.json();
    } catch (error) {
      console.error('Engagement metrics fetch failed:', error);
      return null;
    }
  }
};
```

## Testing Strategy

### 1. Unit Tests for Analytics Framework

```typescript
// src/test/analytics.test.ts
import { ForgeAnalytics, ForgeAnalyticsConfig } from '../lib/analytics-framework';

describe('ForgeAnalytics', () => {
  let analytics: ForgeAnalytics;
  let mockConfig: ForgeAnalyticsConfig;

  beforeEach(() => {
    mockConfig = {
      enableGoogleAnalytics: false,
      enableCustomAnalytics: false,
      sampleRate: 1.0,
      debugMode: true
    };
    analytics = new ForgeAnalytics(mockConfig);
  });

  test('should track click events', () => {
    const mockEvent = new MouseEvent('click', { clientX: 100, clientY: 200 });
    document.body.dispatchEvent(mockEvent);
    
    // Verify event was tracked
    expect(analytics.getEngagementMetrics().clickEvents).toBe(1);
  });

  test('should track CTA clicks with context', () => {
    analytics.trackCTAClick('ENTER THE FORGE', 'hero-section');
    
    const metrics = analytics.getEngagementMetrics();
    expect(metrics.ctaClicks).toBe(1);
  });

  test('should calculate engagement metrics correctly', () => {
    const metrics = analytics.getEngagementMetrics();
    expect(metrics.timeOnPage).toBeGreaterThanOrEqual(0);
    expect(metrics.bounceRate).toBeDefined();
  });
});
```

### 2. Integration Tests for Video Preloader

```typescript
// src/test/video-preloader.test.ts
import { VideoPreloader, VideoPreloaderConfig } from '../lib/video-preloader';

describe('VideoPreloader', () => {
  let preloader: VideoPreloader;
  let mockConfig: VideoPreloaderConfig;

  beforeEach(() => {
    mockConfig = {
      enableAdaptiveStreaming: true,
      preloadStrategy: 'auto',
      networkThresholds: { slow: 1.5, fast: 5.0 },
      deviceProfiles: {
        mobile: [{ src: 'mobile.mp4', type: 'video/mp4', quality: 'low' }],
        tablet: [{ src: 'tablet.mp4', type: 'video/mp4', quality: 'medium' }],
        desktop: [{ src: 'desktop.mp4', type: 'video/mp4', quality: 'high' }]
      }
    };
    preloader = new VideoPreloader(mockConfig);
  });

  test('should detect device type correctly', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    expect(preloader.getDeviceType()).toBe('mobile');
  });

  test('should select appropriate video sources based on network speed', () => {
    // Mock network speed
    Object.defineProperty(navigator, 'connection', {
      value: { downlink: 1.0 },
      configurable: true
    });

    const sources = preloader.getOptimalVideoSources();
    expect(sources.every(s => s.quality === 'low')).toBe(true);
  });
});
```

## Implementation Checklist

- [ ] Create analytics framework with comprehensive event tracking
- [ ] Implement video preloader with adaptive streaming
- [ ] Add advanced video error handling with fallbacks
- [ ] Integrate performance monitoring hooks
- [ ] Set up service worker for caching
- [ ] Create analytics API endpoints
- [ ] Add comprehensive unit and integration tests
- [ ] Update existing components to use new systems
- [ ] Add documentation and deployment guides
- [ ] Test cross-browser compatibility thoroughly

## Performance Targets

Based on the implementation guide, the system should achieve:

- **Page Load Time**: < 2s on 3G networks
- **Video Load Time**: < 1s for adaptive streams
- **FPS**: Maintain 60fps during animations
- **Memory Usage**: < 100MB on mobile devices
- **Error Recovery**: 95% success rate for video playback
- **Analytics Overhead**: < 50ms impact on page performance

This comprehensive implementation will significantly enhance the ArcheForge landing page with robust analytics, optimized video handling, and improved cross-browser compatibility.