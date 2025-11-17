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

  public async handleVideoError(context: VideoErrorContext): Promise<boolean> {
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

export { VideoErrorHandler };
export type { VideoErrorContext, VideoErrorHandlerConfig };