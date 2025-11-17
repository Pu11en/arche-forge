import React, { useState, useEffect } from "react";
import { BullVideoHero } from "./ui/bull-video-hero";
import { HeroText } from "./ui/hero-text";
import { TMLoop } from "./ui/tm-loop";
import { SocialFooter } from "./ui/social-footer";
import { VideoIntro } from "./ui/video-intro";
import { ForgeAnalytics } from "../lib/analytics-framework";
import { MemoryManager } from "../lib/memory-manager";
import { PerformanceOptimizer } from "../lib/performance-optimizer";
import { useResourceCleanup } from "../hooks/useResourceCleanup";
import { useServiceWorker } from "../hooks/useServiceWorker";
import { usePerformanceMonitoring } from "../hooks/usePerformanceMonitoring";
import { logger } from "../lib/logger";

export interface LandingPageProps {
  className?: string;
  desktopBackgroundVideoUrl?: string;
  mobileBackgroundVideoUrl?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  desktopBackgroundVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4",
  mobileBackgroundVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4"
}) => {
  // Initialize core systems
  const [analytics] = useState(() => new ForgeAnalytics({
    enableGoogleAnalytics: true,
    enableCustomAnalytics: true,
    apiEndpoint: '/api/analytics',
    sampleRate: 0.1,
    debugMode: process.env.NODE_ENV === 'development'
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
    isOnline
  } = useServiceWorker({
    enableCaching: true,
    enableOfflineSupport: true,
    enableBackgroundSync: true,
    enablePushNotifications: false,
    cacheVersion: 'v2',
    updateInterval: 60
  });

  const performanceData = usePerformanceMonitoring(analytics);

  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const showHeroText = true;

  // Handle video intro completion
  const handleVideoEnd = () => {
    setShowVideoIntro(false);
  };

  // Performance monitoring
  useEffect(() => {
    if (performanceData.fps < 30) {
      logger.performance('medium', 'Low FPS detected:', performanceData.fps);
      analytics.trackPerformanceMetric('lowFPS', performanceData.fps);
    }

    if (performanceData.memoryUsage > 80) {
      logger.performance('high', 'High memory usage detected:', performanceData.memoryUsage);
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
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {/* Video Intro - shows first, then transitions to main content */}
      {showVideoIntro && (
        <VideoIntro onVideoEnd={handleVideoEnd} />
      )}

      {/* Main Content - only shows after video intro completes */}
      {!showVideoIntro && (
        <>
          {/* Bull Video Hero - loops continuously in background */}
          <BullVideoHero
            desktopVideoUrl={desktopBackgroundVideoUrl}
            mobileVideoUrl={mobileBackgroundVideoUrl}
            className="absolute inset-0"
          />

          {/* TM Loop - visible with hero section, cycling at low opacity */}
          <TMLoop isVisible={true} className="absolute inset-0" />

          {/* Hero Text - always visible */}
          <HeroText
            isVisible={showHeroText}
            className="absolute inset-0"
          />

          {/* Social Footer - always visible */}
          <SocialFooter />
        </>
      )}

      {/* Offline Indicator - always visible */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center p-2 z-50">
          You are currently offline
        </div>
      )}
    </div>
  );
};

export { LandingPage };