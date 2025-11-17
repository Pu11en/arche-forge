/**
 * Enhanced Video Error Recovery System
 * Provides intelligent fallback strategies and recovery mechanisms for video playback issues
 */

export interface VideoErrorRecoveryConfig {
  maxRetryAttempts: number;
  retryDelayMs: number;
  enableQualityAdaptation: boolean;
  enableNetworkDetection: boolean;
  fallbackStrategies: Array<'retry' | 'lower-quality' | 'alternative-source' | 'skip-video'>;
  performanceThresholds: {
    maxLoadTimeMs: number;
    maxBufferEvents: number;
    minFPS: number;
  };
}

export interface VideoRecoveryContext {
  videoElement: HTMLVideoElement;
  originalUrl: string;
  error: Error | MediaError;
  attemptCount: number;
  playbackMetrics?: {
    loadTime: number;
    bufferEvents: number;
    averageFPS: number;
  };
}

export interface AlternativeSource {
  url: string;
  type: string;
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm' | 'ogg';
}

const DEFAULT_CONFIG: VideoErrorRecoveryConfig = {
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  enableQualityAdaptation: true,
  enableNetworkDetection: true,
  fallbackStrategies: ['retry', 'lower-quality', 'alternative-source', 'skip-video'],
  performanceThresholds: {
    maxLoadTimeMs: 5000,
    maxBufferEvents: 5,
    minFPS: 15
  }
};

export class VideoErrorRecovery {
  private config: VideoErrorRecoveryConfig;
  private recoveryAttempts: Map<string, number> = new Map();
  private networkSpeed: number = 0;

  constructor(config: Partial<VideoErrorRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.networkSpeed = connection.downlink || 0;

      connection.addEventListener('change', () => {
        this.networkSpeed = connection.downlink || 0;
        console.log(`VideoErrorRecovery: Network speed updated to ${this.networkSpeed} Mbps`);
      });
    }
  }

  /**
   * Attempts to recover from a video playback error
   */
  public async recoverFromError(context: VideoRecoveryContext): Promise<boolean> {
    const { videoElement, originalUrl, error, attemptCount } = context;
    const recoveryKey = `${originalUrl}_${videoElement.id || 'default'}`;
    
    // Track recovery attempts
    this.recoveryAttempts.set(recoveryKey, attemptCount);
    
    console.log('VideoErrorRecovery: Attempting recovery', {
      url: originalUrl,
      attempt: attemptCount,
      error: error.message,
      networkSpeed: this.networkSpeed
    });

    // Check if we've exceeded max attempts
    if (attemptCount > this.config.maxRetryAttempts) {
      console.log('VideoErrorRecovery: Max retry attempts exceeded');
      return this.executeFinalFallback(context);
    }

    // Analyze error type and determine recovery strategy
    const errorType = this.classifyError(error);
    const strategy = this.selectRecoveryStrategy(errorType, attemptCount, context);

    console.log(`VideoErrorRecovery: Using strategy "${strategy}" for error type "${errorType}"`);

    switch (strategy) {
      case 'retry':
        return this.retryPlayback(context);
      case 'lower-quality':
        return this.switchToLowerQuality(context);
      case 'alternative-source':
        return this.tryAlternativeSource(context);
      case 'skip-video':
        return this.skipVideo(context);
      default:
        return false;
    }
  }

  /**
   * Classifies the type of error for targeted recovery
   */
  private classifyError(error: Error | MediaError): string {
    if (error instanceof MediaError) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          return 'aborted';
        case MediaError.MEDIA_ERR_NETWORK:
          return 'network';
        case MediaError.MEDIA_ERR_DECODE:
          return 'decode';
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          return 'format_not_supported';
        default:
          return 'unknown_media';
      }
    }

    // Analyze error message for additional context
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('codec') || message.includes('format')) {
      return 'format_not_supported';
    }
    if (message.includes('decode') || message.includes('corrupt')) {
      return 'decode';
    }
    if (message.includes('autoplay')) {
      return 'autoplay_blocked';
    }

    return 'unknown';
  }

  /**
   * Selects the appropriate recovery strategy based on error type and context
   */
  private selectRecoveryStrategy(
    errorType: string, 
    attemptCount: number, 
    context: VideoRecoveryContext
  ): 'retry' | 'lower-quality' | 'alternative-source' | 'skip-video' {
    const { playbackMetrics } = context;

    // Performance-based recovery
    if (playbackMetrics) {
      if (playbackMetrics.loadTime > this.config.performanceThresholds.maxLoadTimeMs) {
        console.log('VideoErrorRecovery: High load time detected, switching to lower quality');
        return 'lower-quality';
      }
      if (playbackMetrics.bufferEvents > this.config.performanceThresholds.maxBufferEvents) {
        console.log('VideoErrorRecovery: Excessive buffering detected, switching to lower quality');
        return 'lower-quality';
      }
    }

    // Network-based recovery
    if (this.networkSpeed > 0 && this.networkSpeed < 2) {
      console.log('VideoErrorRecovery: Slow network detected, switching to lower quality');
      return 'lower-quality';
    }

    // Error-type-based recovery
    switch (errorType) {
      case 'network':
        return attemptCount < 2 ? 'retry' : 'lower-quality';
      case 'format_not_supported':
        return 'alternative-source';
      case 'decode':
        return 'lower-quality';
      case 'autoplay_blocked':
        return 'retry';
      default:
        return attemptCount < this.config.maxRetryAttempts ? 'retry' : 'skip-video';
    }
  }

  /**
   * Retries video playback with enhanced settings
   */
  private async retryPlayback(context: VideoRecoveryContext): Promise<boolean> {
    const { videoElement } = context;

    try {
      console.log('VideoErrorRecovery: Retrying playback');

      // Reset video element
      videoElement.pause();
      videoElement.currentTime = 0;

      // Wait for retry delay
      await this.delay(this.config.retryDelayMs * Math.pow(2, context.attemptCount - 1));

      // Enhanced playback settings
      videoElement.muted = true;
      videoElement.volume = 0;
      videoElement.playsInline = true;

      // Reload and attempt play
      await videoElement.load();
      
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      console.log('VideoErrorRecovery: Retry successful');
      return true;
    } catch (error) {
      console.warn('VideoErrorRecovery: Retry failed:', error);
      return false;
    }
  }

  /**
   * Switches to a lower quality version of the video
   */
  private async switchToLowerQuality(context: VideoRecoveryContext): Promise<boolean> {
    const { videoElement, originalUrl } = context;

    try {
      console.log('VideoErrorRecovery: Switching to lower quality');

      const lowerQualityUrl = this.generateLowerQualityUrl(originalUrl);
      if (!lowerQualityUrl) {
        console.log('VideoErrorRecovery: No lower quality URL available');
        return false;
      }

      // Update video source
      videoElement.src = lowerQualityUrl;
      await videoElement.load();

      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      console.log(`VideoErrorRecovery: Successfully switched to ${lowerQualityUrl}`);
      return true;
    } catch (error) {
      console.warn('VideoErrorRecovery: Quality switch failed:', error);
      return false;
    }
  }

  /**
   * Tries alternative video sources
   */
  private async tryAlternativeSource(context: VideoRecoveryContext): Promise<boolean> {
    const { videoElement, originalUrl } = context;

    try {
      console.log('VideoErrorRecovery: Trying alternative sources');

      const alternativeSources = this.generateAlternativeSources(originalUrl);

      for (const source of alternativeSources) {
        try {
          console.log(`VideoErrorRecovery: Trying alternative source: ${source.url}`);

          videoElement.src = source.url;
          await videoElement.load();

          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            await playPromise;
          }

          console.log(`VideoErrorRecovery: Alternative source successful: ${source.url}`);
          return true;
        } catch (error) {
          console.warn(`VideoErrorRecovery: Alternative source failed: ${source.url}`, error);
          continue;
        }
      }

      console.log('VideoErrorRecovery: All alternative sources failed');
      return false;
    } catch (error) {
      console.warn('VideoErrorRecovery: Alternative source error:', error);
      return false;
    }
  }

  /**
   * Skips the video and triggers completion
   */
  private async skipVideo(context: VideoRecoveryContext): Promise<boolean> {
    const { videoElement } = context;

    try {
      console.log('VideoErrorRecovery: Skipping video playback');

      // Hide video element
      videoElement.style.display = 'none';
      videoElement.pause();

      // Trigger completion event
      const event = new CustomEvent('videoSkipped', {
        detail: { reason: 'error_recovery', context }
      });
      document.dispatchEvent(event);

      return true;
    } catch (error) {
      console.warn('VideoErrorRecovery: Skip video failed:', error);
      return false;
    }
  }

  /**
   * Executes final fallback when all recovery attempts fail
   */
  private async executeFinalFallback(context: VideoRecoveryContext): Promise<boolean> {
    console.log('VideoErrorRecovery: Executing final fallback strategy');

    // Try to show a fallback image if available
    return this.showFallbackImage(context);
  }

  /**
   * Shows a fallback image when video cannot be played
   */
  private async showFallbackImage(context: VideoRecoveryContext): Promise<boolean> {
    const { videoElement } = context;

    try {
      console.log('VideoErrorRecovery: Showing fallback image');

      // Create fallback image
      const fallbackUrl = 'https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg';
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
        z-index: 1;
      `;

      // Replace video with image
      const parent = videoElement.parentNode;
      if (parent) {
        parent.replaceChild(img, videoElement);
      }

      // Trigger fallback event
      const event = new CustomEvent('videoFallbackApplied', {
        detail: { type: 'image', url: fallbackUrl, context }
      });
      document.dispatchEvent(event);

      console.log('VideoErrorRecovery: Fallback image applied successfully');
      return true;
    } catch (error) {
      console.error('VideoErrorRecovery: Fallback image failed:', error);
      return false;
    }
  }

  /**
   * Generates a lower quality URL from the original URL
   */
  private generateLowerQualityUrl(originalUrl: string): string | null {
    // For Cloudinary videos, we can modify the URL to get lower quality
    if (originalUrl.includes('cloudinary.com')) {
      // Add transformation parameters for lower quality
      if (originalUrl.includes('/upload/')) {
        return originalUrl.replace('/upload/', '/upload/q_auto:low/');
      }
    }

    // For other sources, try to add quality indicators
    if (originalUrl.includes('.mp4')) {
      return originalUrl.replace('.mp4', '-low.mp4');
    }

    return null;
  }

  /**
   * Generates alternative video sources
   */
  private generateAlternativeSources(originalUrl: string): AlternativeSource[] {
    const sources: AlternativeSource[] = [];

    // For Cloudinary videos, try different formats
    if (originalUrl.includes('cloudinary.com')) {
      // Try WebM format
      if (originalUrl.includes('.mp4')) {
        sources.push({
          url: originalUrl.replace('.mp4', '.webm'),
          type: 'video/webm',
          quality: 'medium',
          format: 'webm'
        });
      }
    }

    // Generic alternative sources
    if (originalUrl.includes('.mp4')) {
      sources.push({
        url: originalUrl.replace('.mp4', '-fallback.mp4'),
        type: 'video/mp4',
        quality: 'low',
        format: 'mp4'
      });
    }

    return sources.filter(source => source.url !== originalUrl);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets current network speed
   */
  public getNetworkSpeed(): number {
    return this.networkSpeed;
  }

  /**
   * Resets recovery statistics
   */
  public resetRecoveryStats(): void {
    this.recoveryAttempts.clear();
  }
}

export { VideoErrorRecovery as default };