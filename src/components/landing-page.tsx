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
    setVideoState(prev => ({
      ...prev,
      isCompleted: true,
      isPlaying: false
    }));

    setOrchestrationState(prev => ({
      ...prev,
      sequencePhase: 'video-completed'
    }));
    
    // Start dissolve sequence after 0.5s delay
    const dissolveDelayTimer = setTimeout(() => {
      setOrchestrationState(prev => ({
        ...prev,
        sequencePhase: 'video-dissolving',
        canStartDissolve: true
      }));
      // Pre-emptively set showHero to true to ensure no white screen
      setShowHero(true);
    }, reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DELAY);
    
    setTransitionTimers(prev => ({ ...prev, dissolveDelayTimer }));
  }, [reducedMotion]);

  // Handle dissolve completion - transitions to pause phase
  const handleDissolveComplete = useCallback(() => {
    setOrchestrationState(prev => ({
      ...prev,
      sequencePhase: 'transition-pause'
    }));
    
    // Brief pause before hero - ensure hero is visible
    setShowHero(true);
    
    const pauseTimer = setTimeout(() => {
      setOrchestrationState(prev => ({
        ...prev,
        sequencePhase: 'hero-revealing',
        canStartHero: true
      }));
    }, reducedMotion ? 0 : ANIMATION_TIMING.TRANSITION_PAUSE);
    
    setTransitionTimers(prev => ({ ...prev, pauseTimer }));
  }, [reducedMotion]);

  // Handle video error - maintain sequential flow even on error
  const handleVideoError = useCallback((error: Error) => {
    console.error("Video loading error:", error);
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isPlaying: false
    }));

    // Immediately show hero on error to prevent white screen
    setShowHero(true);
    
    // Maintain sequential flow - wait for dissolve timeout, then show hero
    setTimeout(() => {
      setOrchestrationState(prev => ({
        ...prev,
        sequencePhase: 'hero-revealing',
        canStartHero: true
      }));
    }, reducedMotion ? 0 : (ANIMATION_TIMING.VIDEO_DISSOLVE_DELAY + ANIMATION_TIMING.VIDEO_DISSOLVE_DURATION));
  }, [reducedMotion]);

  // Handle video ready state
  const handleVideoReady = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isReady: true
    }));
  }, []);

  // Preload hero content to ensure it's ready before video ends
  useEffect(() => {
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

      {/* Landing Hero Section - Always rendered but visibility controlled by opacity */}
      <LandingHero
        initialVisibility={!autoPlay || videoState.hasError || orchestrationState.canStartHero}
        onCTAClick={onCTAClick}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showHero || !autoPlay || videoState.hasError || orchestrationState.canStartHero ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: 10 }} // Ensure hero is above fallback but below video overlay
      />

      {/* Fallback for when video is loading but hero should be ready */}
      {autoPlay && !videoState.hasError && orchestrationState.sequencePhase === 'video-playing' && (
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            videoState.isReady ? "opacity-0" : "opacity-100"
          }`}
          style={{ zIndex: 5 }} // Reduced z-index to prevent bleed through
        />
      )}
    </div>
  );
};

export { LandingPage };