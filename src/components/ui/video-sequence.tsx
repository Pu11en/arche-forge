import { useState, useCallback, useEffect, useRef } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { LoopingVideo } from "./looping-video";
import { BullVideoOverlay } from "./bull-video-overlay";
import { TrademarkPhraseOverlay } from "./trademark-phrase-overlay";
import { HeadingWithCTA } from "./heading-with-cta";
import { TRADEMARK_PHRASES } from "../../data/trademark-phrases";
import { useTransitionTiming } from "../../hooks/useTransitionTiming";
import { useVideoSynchronization } from "../../hooks/useVideoSynchronization";
import { useVideoTimingSync } from "../../hooks/useVideoTimingSync";

type SequenceState = 'intro' | 'transition' | 'looping' | 'complete';

interface VideoSequenceProps {
  introVideoUrl: string;
  bullVideoUrl: string;
  loopingVideoUrl: string;
  onTransitionComplete: () => void;
  className?: string;
}

/**
 * Main orchestrator component for the two-step video sequence:
 * 1. Intro video plays once
 * 2. Transition to looping bull video with phrase overlays and CTA
 * 
 * Enhanced with simultaneous preloading and frame-perfect transitions
 */
export const VideoSequence = ({
  introVideoUrl,
  bullVideoUrl,
  loopingVideoUrl,
  onTransitionComplete,
  className = ""
}: VideoSequenceProps) => {
  const [sequenceState, setSequenceState] = useState<SequenceState>('intro');
  const [showPhrases, setShowPhrases] = useState(false);
  const [showHeadingCTA, setShowHeadingCTA] = useState(false);
  const [introOpacity, setIntroOpacity] = useState(1);
  const [bullOpacity, setBullOpacity] = useState(0);
  const [loopingOpacity, setLoopingOpacity] = useState(0);
  
  // Refs for video elements
  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const loopingVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Use our custom hooks
  const { cancelTransition } = useTransitionTiming();
  const {
    preloadAllVideos,
    getVideoElement
  } = useVideoSynchronization([introVideoUrl, bullVideoUrl, loopingVideoUrl]);
  

  // Handle bull trigger point (1 second before intro ends)
  const handleBullTriggerPoint = useCallback(() => {
    console.log('[VideoSequence] Bull trigger point reached');
    if (sequenceState === 'intro') {
      setSequenceState('transition');
      setBullOpacity(1);
      setShowPhrases(true);
      
      // Start fading out intro video
      setIntroOpacity(0);
      
      // Immediately start playing the looping video
      const loopingVideo = loopingVideoRef.current;
      if (loopingVideo) {
        console.log('[VideoSequence] Starting looping video playback immediately');
        loopingVideo.play().catch(error => {
          console.warn('[VideoSequence] Failed to play looping video:', error);
        });
      }
      
      // Start looping video after 1 second
      setTimeout(() => {
        setLoopingOpacity(1);
        setBullOpacity(0);
        setSequenceState('looping');
        
        // Show heading and CTA after 2 seconds
        setTimeout(() => {
          setShowHeadingCTA(true);
        }, 2000);
      }, 1000);
    }
  }, [sequenceState]);

  // Video timing sync for bull overlay
  const {
    startMonitoring
  } = useVideoTimingSync({
    introVideoUrl,
    onTriggerPoint: handleBullTriggerPoint
  });

  // Handle intro video completion
  const handleIntroComplete = useCallback(() => {
    console.log('[VideoSequence] Intro video completed');
    
    // Immediately start the looping video to prevent white screen
    const loopingVideo = loopingVideoRef.current;
    if (loopingVideo) {
      console.log('[VideoSequence] Starting looping video on intro complete');
      loopingVideo.play().catch(error => {
        console.warn('[VideoSequence] Failed to play looping video on intro complete:', error);
      });
    }
    
    // If we haven't triggered the transition yet, do it now
    if (sequenceState === 'intro') {
      handleBullTriggerPoint();
    }
  }, [sequenceState, handleBullTriggerPoint]);

  // Handle bull video ready
  const handleBullVideoReady = useCallback(() => {
    console.log('[VideoSequence] Bull video is ready');
  }, []);

  // Handle bull video error
  const handleBullVideoError = useCallback((error: Error) => {
    console.error('[VideoSequence] Bull video error:', error);
    // Continue with sequence even if bull video fails
    handleBullTriggerPoint();
  }, [handleBullTriggerPoint]);

  // Handle CTA button click
  const handleCTAClick = useCallback(() => {
    console.log('[VideoSequence] CTA clicked, completing sequence');
    setSequenceState('complete');
    onTransitionComplete();
  }, [onTransitionComplete]);

  // Handle video errors
  const handleVideoError = useCallback((error?: Error) => {
    console.error('[VideoSequence] Video error:', error);
    // Continue with the sequence even if video fails
    if (sequenceState === 'intro') {
      handleIntroComplete();
    }
  }, [sequenceState, handleIntroComplete]);

  // Preload all videos when component mounts
  useEffect(() => {
    console.log('[VideoSequence] Component mounted, starting simultaneous preloading');
    
    // Start preloading all videos immediately
    preloadAllVideos().then(() => {
      console.log('[VideoSequence] All videos preloaded successfully');
    }).catch(error => {
      console.error('[VideoSequence] Error preloading videos:', error);
    });
  }, [preloadAllVideos]);

  // Get video elements for direct manipulation
  useEffect(() => {
    introVideoRef.current = getVideoElement(introVideoUrl);
    loopingVideoRef.current = getVideoElement(loopingVideoUrl);
    
    // Also get the bull video element
    const bullVideoElement = getVideoElement(bullVideoUrl);
    console.log('[VideoSequence] Bull video element:', bullVideoElement);
    
    // Start monitoring intro video for timing
    if (introVideoRef.current) {
      const cleanup = startMonitoring(introVideoRef.current);
      return cleanup;
    }
  }, [introVideoUrl, bullVideoUrl, loopingVideoUrl, getVideoElement, startMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelTransition();
    };
  }, [cancelTransition]);

  // Render the video sequence with all three videos always in DOM
  return (
    <div className={`fixed inset-0 ${className}`} style={{ backgroundColor: '#000000' }}>
      {/* Intro Video Layer - Always in DOM, visibility controlled by opacity */}
      <div
        className="absolute inset-0 z-10"
        style={{
          opacity: introOpacity,
          willChange: 'opacity', // GPU acceleration hint
          transform: 'translateZ(0)', // Force GPU layer
          display: sequenceState === 'looping' ? 'none' : 'block' // Completely hide after transition
        }}
      >
        <LoadingOverlay
          isVisible={sequenceState === 'intro'}
          videoUrl={introVideoUrl}
          onTransitionComplete={handleIntroComplete}
          onVideoError={handleVideoError}
          attemptAutoplay={true}
          showPlayButton={false}
          playButtonText=""
        />
      </div>

      {/* Bull Video Overlay Layer - z-25, appears during transition */}
      <BullVideoOverlay
        videoUrl={bullVideoUrl}
        isVisible={sequenceState === 'transition'}
        opacity={bullOpacity}
        onVideoReady={handleBullVideoReady}
        onVideoError={handleBullVideoError}
        videoElement={getVideoElement(bullVideoUrl)}
      />

      {/* Looping Video Layer - Always in DOM, visibility controlled by opacity */}
      <div
        className="absolute inset-0 z-30" // Higher z-index than intro and bull videos
        style={{
          opacity: loopingOpacity,
          willChange: 'opacity', // GPU acceleration hint
          transform: 'translateZ(0)', // Force GPU layer
          backgroundColor: '#000000', // Ensure black background
          pointerEvents: loopingOpacity > 0 ? 'auto' : 'none' // Only interact when visible
        }}
      >
        <LoopingVideo
          videoUrl={loopingVideoUrl}
          isVisible={loopingOpacity > 0} // Visible when opacity is greater than 0
          onVideoError={handleVideoError}
          onVideoReady={() => console.log('[VideoSequence] Looping video is ready')}
          onVideoCanPlay={() => console.log('[VideoSequence] Looping video can play')}
          onVideoLoadedData={() => console.log('[VideoSequence] Looping video data loaded')}
          videoElement={getVideoElement(loopingVideoUrl)}
        />
      </div>

      {/* Text Overlays - High z-index to stay visible during transition */}
      {(sequenceState === 'transition' || sequenceState === 'looping') && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Rotating Trademarks in the center - positioned absolutely for perfect centering */}
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <TrademarkPhraseOverlay
              isVisible={showPhrases}
              phrases={TRADEMARK_PHRASES}
            />
          </div>

          {/* Heading and CTA - positioned absolutely with animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className={`pointer-events-auto ${showHeadingCTA ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transition: 'opacity 0.7s ease-in-out'
              }}
            >
              <HeadingWithCTA
                isVisible={true}
                onCTAClick={handleCTAClick}
              />
            </div>
          </div>
        </div>
      )}

      {/* Debug information */}
      {true && (
        <div style={{ position: 'absolute', top: 10, right: 10, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px', fontSize: '12px', zIndex: 1000 }}>
          <div>Sequence State: {sequenceState}</div>
          <div>Intro Opacity: {introOpacity.toFixed(2)}</div>
          <div>Bull Opacity: {bullOpacity.toFixed(2)}</div>
          <div>Looping Opacity: {loopingOpacity.toFixed(2)}</div>
          <div>Show Phrases: {showPhrases.toString()}</div>
          <div>Show Heading CTA: {showHeadingCTA.toString()}</div>
        </div>
      )}
    </div>
  );
};