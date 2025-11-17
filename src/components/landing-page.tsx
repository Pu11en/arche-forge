import React, { useState, useEffect, useCallback } from "react";
import { BullVideoHero } from "./ui/bull-video-hero";
import { HeroText } from "./ui/hero-text";
import { TMLoop } from "./ui/tm-loop";
import { LoadingOverlay } from "./ui/loading-overlay";
import { SocialFooter } from "./ui/social-footer";
import { ForgeAnalytics } from "../lib/analytics-framework";
import { VideoPreloader } from "../lib/video-preloader";
import { VideoErrorHandler } from "../lib/video-error-handler";
import { MemoryManager } from "../lib/memory-manager";
import { PerformanceOptimizer } from "../lib/performance-optimizer";
import { useResourceCleanup } from "../hooks/useResourceCleanup";
import { useServiceWorker } from "../hooks/useServiceWorker";
import { usePerformanceMonitoring } from "../hooks/usePerformanceMonitoring";
import { useVideoPerformanceMonitoring } from "../hooks/useVideoPerformanceMonitoring";

export interface LandingPageProps {
  className?: string;
  introVideoUrl?: string;
  desktopBackgroundVideoUrl?: string;
  mobileBackgroundVideoUrl?: string;
  autoPlay?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  introVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  desktopBackgroundVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4",
  mobileBackgroundVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4",
  autoPlay = true
}) => {
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
        { src: introVideoUrl.replace('.mp4', '-mobile.mp4'), type: 'video/mp4', quality: 'low' },
        { src: introVideoUrl, type: 'video/mp4', quality: 'medium' }
      ],
      tablet: [
        { src: introVideoUrl, type: 'video/mp4', quality: 'medium' },
        { src: introVideoUrl.replace('.mp4', '-high.mp4'), type: 'video/mp4', quality: 'high' }
      ],
      desktop: [
        { src: introVideoUrl.replace('.mp4', '-high.mp4'), type: 'video/mp4', quality: 'high' },
        { src: introVideoUrl, type: 'video/mp4', quality: 'medium' }
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
      low: mobileBackgroundVideoUrl,
      medium: introVideoUrl
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
  
  // Video performance monitoring for intro video
  const [introVideoElement, setIntroVideoElement] = useState<HTMLVideoElement | null>(null);
  const {
    metrics: introVideoMetrics,
    getPerformanceAnalysis: getIntroVideoAnalysis
  } = useVideoPerformanceMonitoring(introVideoElement, {
    enableMetrics: true,
    enableNetworkMonitoring: true,
    enableFPSMonitoring: false, // Disabled for intro video to save resources
    debugMode: process.env.NODE_ENV === 'development'
  });

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
  const [showHeroText, setShowHeroText] = useState(false);

  // Enhanced video completion handler
  const handleVideoComplete = useCallback(() => {
    console.log('LandingPage: Video completed, showing hero');
    
    // Log performance metrics
    const performanceAnalysis = getIntroVideoAnalysis();
    console.log('LandingPage: Intro video performance:', performanceAnalysis);
    
    // Track analytics with performance data
    analytics.trackVideoCompletion(30);
    analytics.trackPerformanceMetric('videoLoadTime', introVideoMetrics.loadTime);
    analytics.trackPerformanceMetric('videoPlayTime', introVideoMetrics.playTime);
    
    if (introVideoMetrics.errorCount > 0) {
      analytics.trackEvent('videoPlaybackIssues', {
        errorCount: introVideoMetrics.errorCount,
        bufferEvents: introVideoMetrics.bufferEvents
      });
    }
    
    setVideoState(prev => ({ ...prev, isCompleted: true, isPlaying: false }));
    
    // Show hero section immediately after intro video completes
    setShowHero(true);
    
    // Show hero text after 1-2 seconds delay as specified
    setTimeout(() => {
      setShowHeroText(true);
    }, 1500);
  }, [analytics, introVideoMetrics, getIntroVideoAnalysis]);

  // Enhanced video error handler
  const handleVideoError = useCallback(async (error: Error) => {
    analytics.trackEvent('videoError', { error: error.message });
    
    // Set video element reference for performance monitoring
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (videoElement && !introVideoElement) {
      setIntroVideoElement(videoElement);
    }
    
    if (videoElement) {
      const recovered = await videoErrorHandler.handleVideoError({
        videoElement,
        error,
        sourceUrl: introVideoUrl,
        attempt: 1,
        maxAttempts: 3,
        fallbackStrategy: 'image-fallback'
      });

      if (!recovered) {
        setVideoState(prev => ({ ...prev, hasError: true }));
        analytics.trackEvent('videoErrorFatal', { error: error.message });
        
        // Log performance analysis for debugging
        const performanceAnalysis = getIntroVideoAnalysis();
        console.error('LandingPage: Fatal video error with performance:', {
          error: error.message,
          performanceAnalysis,
          videoMetrics: introVideoMetrics
        });
      }
    }
  }, [analytics, videoErrorHandler, introVideoUrl, introVideoElement, introVideoMetrics, getIntroVideoAnalysis]);

  // Initialize systems on mount
  useEffect(() => {
    // Preload critical assets
    videoPreloader.preloadCriticalAssets();
    
    // Preload video if service worker is ready
    if (swStatus.activated && autoPlay) {
      preloadVideo(introVideoUrl);
    }
    
    // Add fallback to show hero after 5 seconds if video doesn't complete
    const fallbackTimer = setTimeout(() => {
      if (!showHero && !videoState.isCompleted) {
        console.log('LandingPage: Fallback timer triggered, showing hero');
        setShowHero(true);
        setVideoState(prev => ({ ...prev, isCompleted: true }));
      }
    }, 5000);
    
    return () => clearTimeout(fallbackTimer);
  }, [videoPreloader, swStatus.activated, autoPlay, preloadVideo, showHero, videoState.isCompleted]);

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

  // Debug logging to identify the issue
  console.log('LandingPage render state:', {
    showHero,
    autoPlay,
    videoState,
    isOnline,
    swStatus,
    introVideoMetrics,
    introVideoAnalysis: getIntroVideoAnalysis()
  });

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {/* Video Intro Overlay - plays once and covers everything */}
      {!videoState.hasError && !videoState.isCompleted && (
        <LoadingOverlay
          isVisible={true}
          videoUrl={introVideoUrl}
          onVideoComplete={handleVideoComplete}
          onVideoError={(error) => handleVideoError(error || new Error('Unknown video error'))}
          attemptAutoplay={autoPlay}
          className="absolute inset-0 z-50"
        />
      )}

      {/* Bull Video Hero - loops continuously in background, visible after intro video */}
      {showHero && (
        <BullVideoHero
          desktopVideoUrl={desktopBackgroundVideoUrl}
          mobileVideoUrl={mobileBackgroundVideoUrl}
          className="absolute inset-0"
        />
      )}

      {/* TM Loop - visible with hero section, cycling at low opacity */}
      {showHero && (
        <TMLoop isVisible={true} className="absolute inset-0" />
      )}

      {/* Hero Text - appears after 1-2 seconds delay when hero is visible */}
      <HeroText
        isVisible={showHeroText || !autoPlay || videoState.hasError}
        className="absolute inset-0"
      />

      {/* Social Footer - always visible */}
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