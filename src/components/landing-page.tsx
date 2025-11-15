import React, { useState, useEffect, useCallback } from "react";
import { LoadingOverlay } from "./ui/loading-overlay";
import { LandingHero } from "./ui/landing-hero";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ANIMATION_TIMING, AnimationOrchestrationState, TransitionTimers } from "../lib/animation-timing";

export interface LandingPageProps {
  /** Optional className for additional styling */
  className?: string;
  /** Optional callback when the CTA button is clicked */
  onCTAClick?: () => void;
  /** Video URL to use for the intro */
  videoUrl?: string;
  /** Whether to autoplay the video */
  autoPlay?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({
  className = "",
  onCTAClick,
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  autoPlay = true
}) => {
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [orchestrationState, setOrchestrationState] = useState<AnimationOrchestrationState>({
    sequencePhase: 'video-playing',
    canStartDissolve: false,
    canStartHero: false,
    dissolveStartTime: 0,
    heroStartTime: 0
  });

  const [transitionTimers, setTransitionTimers] = useState<TransitionTimers>({});
  const reducedMotion = useReducedMotion();

  // Cleanup all transition timers
  const cleanupTimers = useCallback(() => {
    Object.values(transitionTimers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    setTransitionTimers({});
  }, [transitionTimers]);

  // Handle video completion - starts the sequential animation flow
  const handleVideoComplete = useCallback(() => {
    setVideoState((prev: any) => ({
      ...prev,
      isCompleted: true,
      isPlaying: false
    }));

    setOrchestrationState((prev: AnimationOrchestrationState) => ({
      ...prev,
      sequencePhase: 'video-completed'
    }));
    
    // Start dissolve sequence after 0.5s delay
    const dissolveDelayTimer = setTimeout(() => {
      setOrchestrationState((prev: AnimationOrchestrationState) => ({
        ...prev,
        sequencePhase: 'video-dissolving',
        canStartDissolve: true
      }));
      // Only show hero after dissolve starts to prevent flash
      // setShowHero will be set in handleDissolveComplete
    }, reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DELAY);
    
    setTransitionTimers((prev: TransitionTimers) => ({ ...prev, dissolveDelay: dissolveDelayTimer as NodeJS.Timeout }));
  }, [reducedMotion]);

  // Handle dissolve completion - transitions to pause phase
  const handleDissolveComplete = useCallback(() => {
    setOrchestrationState((prev: AnimationOrchestrationState) => ({
      ...prev,
      sequencePhase: 'transition-pause'
    }));
    
    // Show hero immediately when dissolve completes to prevent flash
    setShowHero(true);
    
    // Shorter pause to ensure smooth transition
    const pauseTimer = setTimeout(() => {
      setOrchestrationState((prev: AnimationOrchestrationState) => ({
        ...prev,
        sequencePhase: 'hero-revealing',
        canStartHero: true
      }));
    }, reducedMotion ? 0 : 200); // Reduced from 500ms to 200ms for smoother transition
    
    setTransitionTimers((prev: TransitionTimers) => ({ ...prev, pauseDuration: pauseTimer as NodeJS.Timeout }));
  }, [reducedMotion]);

  // Handle video error - maintain sequential flow even on error
  const handleVideoError = useCallback((error: Error) => {
    console.error("Video loading error:", error);
    setVideoState((prev: any) => ({
      ...prev,
      hasError: true,
      isPlaying: false
    }));

    // Immediately show hero on error to prevent white screen
    setShowHero(true);
    
    // Skip the dissolve sequence on error for faster recovery
    setOrchestrationState((prev: AnimationOrchestrationState) => ({
      ...prev,
      sequencePhase: 'hero-revealing',
      canStartHero: true
    }));
  }, [reducedMotion]);

  // Handle video ready state
  const handleVideoReady = useCallback(() => {
    setVideoState((prev: any) => ({
      ...prev,
      isReady: true
    }));
  }, []);

  // Preload hero content to ensure it's ready before video ends
  useEffect(() => {
    // Mark initial load as complete after a short delay to prevent flash
    const initialLoadTimer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    // Preload the hero image to prevent flickering
    const img = new Image();
    img.src = "https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png";
    img.onload = () => {
      // Image is loaded, hero is ready to be displayed
      handleVideoReady();
    };
    img.onerror = () => {
      // Even if image fails, we should still show the hero
      handleVideoReady();
    };
    
    return () => {
      clearTimeout(initialLoadTimer);
    };
  }, [handleVideoReady]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, [cleanupTimers]);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {/* Video Intro Overlay */}
      {!videoState.hasError && orchestrationState.sequencePhase !== 'complete' && (
        <LoadingOverlay
          isVisible={true}
          videoUrl={videoUrl}
          onVideoComplete={handleVideoComplete}
          onVideoError={(error) => handleVideoError(error || new Error('Unknown video error'))}
          onTransitionComplete={handleDissolveComplete}
          attemptAutoplay={autoPlay}
          className="absolute inset-0 z-50"
          fallbackBgColor="bg-black"
          useFizzEffect={true}
          showLoadingIndicator={true}
          orchestrationState={orchestrationState}
        />
      )}

      {/* Landing Hero Section - Only render when ready to prevent flash */}
      {!isInitialLoad && (
        <LandingHero
          initialVisibility={showHero || !autoPlay || videoState.hasError}
          onCTAClick={onCTAClick}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            showHero || !autoPlay || videoState.hasError || orchestrationState.canStartHero ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 10 }} // Ensure hero is above fallback but below video overlay
        />
      )}
    </div>
  );
};

export { LandingPage };