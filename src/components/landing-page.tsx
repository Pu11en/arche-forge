import React, { useState, useEffect, useCallback } from "react";
import { LandingHero } from "./ui/landing-hero";
import { SocialFooter } from "./ui/social-footer";
import { LoadingOverlay } from "./ui/loading-overlay";
import { BackgroundVideo } from "./ui/background-video";
import { ForgeAnalytics } from "../lib/analytics-framework";
import { VideoPreloader } from "../lib/video-preloader";
import { VideoErrorHandler } from "../lib/video-error-handler";
import { MemoryManager } from "../lib/memory-manager";
import { PerformanceOptimizer } from "../lib/performance-optimizer";
import { useResourceCleanup } from "../hooks/useResourceCleanup";
import { useServiceWorker } from "../hooks/useServiceWorker";
import { usePerformanceMonitoring } from "../hooks/usePerformanceMonitoring";
import { detectBrowser } from "../lib/browser-detection";

export interface LandingPageProps {
  className?: string;
  onCTAClick?: () => void;
  videoUrl?: string;
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;
  autoPlay?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  onCTAClick,
  videoUrl,
  desktopVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4",
  mobileVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  autoPlay = true
}) => {
  // Determine the appropriate video URL based on device
  const selectedVideoUrl = useState<string>(() => {
    // If videoUrl is provided, use it for backward compatibility
    if (videoUrl) {
      return videoUrl;
    }
    
    // Otherwise, use device-specific URLs
    const browser = detectBrowser();
    return browser.isMobile ? mobileVideoUrl : desktopVideoUrl;
  })[0];
  // Initialize core systems
  const [analytics] = useState(() => new ForgeAnalytics({
    enableGoogleAnalytics: true,
    enableCustomAnalytics: true,
    apiEndpoint: '/api/analytics',
    sampleRate: 0.1,
    debugMode: process.env.NODE_ENV === 'development'
  }));

  const [videoPreloader] = useState(() => new VideoPreloader({
    enableAdaptiveStreaming: true,
    preloadStrategy: 'auto',
    networkThresholds: { slow: 1.5, fast: 5.0 },
    deviceProfiles: {
      mobile: [
        { src: selectedVideoUrl.replace('.mp4', '-mobile.mp4'), type: 'video/mp4', quality: 'low' },
        { src: selectedVideoUrl, type: 'video/mp4', quality: 'medium' }
      ],
      tablet: [
        { src: selectedVideoUrl, type: 'video/mp4', quality: 'medium' },
        { src: selectedVideoUrl.replace('.mp4', '-high.mp4'), type: 'video/mp4', quality: 'high' }
      ],
      desktop: [
        { src: selectedVideoUrl.replace('.mp4', '-high.mp4'), type: 'video/mp4', quality: 'high' },
        { src: selectedVideoUrl, type: 'video/mp4', quality: 'medium' }
      ]
    }
  }));

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
      medium: selectedVideoUrl
    }
  }));

  const [memoryManager] = useState(() => new MemoryManager({
    enableAutoCleanup: true,
    cleanupInterval: 30000,
    memoryThreshold: 100,
    enableLeakDetection: true,
    maxResourceAge: 300000,
    enablePerformanceMonitoring: true
  }));

  const [performanceOptimizer] = useState(() => new PerformanceOptimizer({
    enableImageOptimization: true,
    enableVideoOptimization: true,
    enableAnimationOptimization: true,
    enableMemoryOptimization: true,
    lazyLoadThreshold: 200,
    imageQuality: 'auto',
    videoQuality: 'auto'
  }));

  const {
    registerVideo
  } = useResourceCleanup(memoryManager);

  // Register resources for cleanup
  useEffect(() => {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      registerVideo(videoElement);
    }
  }, [registerVideo]);

  const {
    status: swStatus,
    isOnline,
    preloadVideo
  } = useServiceWorker({
    enableCaching: true,
    enableOfflineSupport: true,
    enableBackgroundSync: true,
    enablePushNotifications: false,
    cacheVersion: 'v2',
    updateInterval: 60
  });

  const performanceData = usePerformanceMonitoring(analytics);

  const [videoState, setVideoState] = useState<{
    isPlaying: boolean;
    isCompleted: boolean;
    hasError: boolean;
    isReady: boolean;
  }>({
    isPlaying: false,
    isCompleted: false,
    hasError: false,
    isReady: false
  });

  const [showHero, setShowHero] = useState(false);

  // Enhanced video completion handler
  const handleVideoComplete = useCallback(() => {
    analytics.trackVideoCompletion(30);
    setVideoState(prev => ({ ...prev, isCompleted: true, isPlaying: false }));
    
    // Trigger hero reveal
    setTimeout(() => setShowHero(true), 300);
  }, [analytics]);

  // Enhanced video error handler
  const handleVideoError = useCallback(async (error: Error) => {
    analytics.trackEvent('videoError', { error: error.message });
    
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement) {
      const recovered = await videoErrorHandler.handleVideoError({
        videoElement,
        error,
        sourceUrl: selectedVideoUrl,
        attempt: 1,
        maxAttempts: 3,
        fallbackStrategy: 'image-fallback'
      });

      if (!recovered) {
        setVideoState(prev => ({ ...prev, hasError: true }));
        analytics.trackEvent('videoErrorFatal', { error: error.message });
      }
    }
  }, [analytics, videoErrorHandler, videoUrl]);

  // Enhanced CTA click handler
  const handleCTAClick = useCallback(() => {
    analytics.trackCTAClick('ENTER THE FORGE', 'landing-page-hero');
    onCTAClick?.();
  }, [analytics]);

  // Initialize systems on mount
  useEffect(() => {
    // Preload critical assets
    videoPreloader.preloadCriticalAssets();
    
    // Preload video if service worker is ready
    if (swStatus.activated && autoPlay) {
      preloadVideo(selectedVideoUrl);
    }
  }, [videoPreloader, swStatus.activated, autoPlay, preloadVideo]);

  // Performance monitoring
  useEffect(() => {
    if (performanceData.fps < 30) {
      console.warn('Low FPS detected:', performanceData.fps);
      analytics.trackPerformanceMetric('lowFPS', performanceData.fps);
    }
    
    if (performanceData.memoryUsage > 80) {
      console.warn('High memory usage detected:', performanceData.memoryUsage);
      analytics.trackPerformanceMetric('highMemoryUsage', performanceData.memoryUsage);
    }
  }, [performanceData, analytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analytics.destroy();
      memoryManager.destroy();
      performanceOptimizer.destroy();
    };
  }, [analytics, memoryManager, performanceOptimizer]);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`} style={{ background: '#000' }}>
      {/* Background Video (Bull Loop) - Shows after intro */}
      <BackgroundVideo
        isVisible={showHero}
        className="background-video"
      />

      {/* Video Intro Overlay */}
      {!videoState.hasError && (
        <LoadingOverlay
          isVisible={true}
          videoUrl={selectedVideoUrl}
          onVideoComplete={handleVideoComplete}
          onVideoError={(error) => handleVideoError(error || new Error('Unknown video error'))}
          attemptAutoplay={autoPlay}
          className="absolute inset-0 z-50"
        />
      )}

      {/* Landing Hero Section */}
      <LandingHero
        initialVisibility={showHero || !autoPlay || videoState.hasError}
        onCTAClick={handleCTAClick}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showHero || !autoPlay || videoState.hasError ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Social Footer */}
      <SocialFooter />

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center p-2 z-50">
          You are currently offline
        </div>
      )}
    </div>
  );
};

export { LandingPage };