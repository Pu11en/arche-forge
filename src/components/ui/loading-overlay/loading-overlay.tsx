import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useVideoPerformanceMonitoring } from "../../../hooks/useVideoPerformanceMonitoring";
import { LoadingOverlayProps, VideoState } from "./loading-types";
import { ANIMATION_TIMING } from "../../../lib/animation-timing";
import {
  detectBrowser,
  requiresUserInteractionForAutoplayEnhanced,
  isSecureContext,
  getSafeZIndex,
  getEventListenerOptions
} from "../../../lib/browser-detection";
import {
  getPrefixedStyles,
  getHardwareAccelerationStyles,
  getResponsiveVideoStyles,
  getResponsiveContainerStyles,
  getLoadingSpinnerStyles,
  getTouchButtonStyles,
  getConsistentTextStyles,
  getOverlayStyles,
  getVideoAttributes,
  getFlexboxStyles
} from "../../../lib/cross-browser-styles";

const LoadingOverlay = ({
  isVisible = true,
  videoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  fallbackBgColor = "bg-black",
  onVideoLoaded,
  onVideoError,
  onTransitionComplete,
  onVideoComplete,
  className = "",
  attemptAutoplay = true,
  showPlayButton = true,
  showLoadingIndicator = true,
  loadingText = "Loading...",
  playButtonText = "Play to Continue",
  useFizzEffect = true,
  orchestrationState,
}: LoadingOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoState, setVideoState] = useState<VideoState>(() => {
    const browserInfo = detectBrowser();
    const isSecure = isSecureContext();
    const needsUserInteraction = requiresUserInteractionForAutoplayEnhanced();
    
    console.log('LoadingOverlay: Initializing with browser info:', browserInfo);
    console.log('LoadingOverlay: Is secure context:', isSecure);
    console.log('LoadingOverlay: Video URL:', videoUrl);
    
    return {
      isLoaded: false,
      hasError: false,
      isPlaying: false,
      isLoading: false,
      isBuffering: false,
      loadingProgress: 0,
      loadingState: 'idle',
      transitionState: 'visible',
      playbackState: 'idle',
      needsUserInteraction,
      autoplayAttempted: false,
      supportedFormat: 'mp4', // Always use MP4 for Cloudinary videos
      browserInfo: {
        isChrome: browserInfo.isChrome,
        isFirefox: browserInfo.isFirefox,
        isSafari: browserInfo.isSafari,
        isEdge: browserInfo.isEdge,
        isMobile: browserInfo.isMobile,
      }
    };
  });
  
  const minDisplayTimeRef = useRef<NodeJS.Timeout | null>(null);
  
  const reducedMotion = useReducedMotion();
  
  // Video performance monitoring
  const {
    metrics: videoMetrics,
    trackAutoplayAttempt,
    getPerformanceAnalysis
  } = useVideoPerformanceMonitoring(videoRef.current, {
    enableMetrics: true,
    enableNetworkMonitoring: true,
    enableFPSMonitoring: true,
    debugMode: process.env.NODE_ENV === 'development'
  });
  
  // Simplified video source - always use the provided MP4 URL from Cloudinary
  const getOptimalVideoSource = useCallback(() => {
    console.log('LoadingOverlay: Using Cloudinary MP4 video URL:', videoUrl);
    return {
      primary: videoUrl,
      fallback: videoUrl,
      formats: {
        mp4: videoUrl
      }
    };
  }, [videoUrl]);

  // Handle video events
  const handleVideoLoadStart = useCallback(() => {
    console.log('LoadingOverlay: Video load started');
    setVideoState(prev => ({
      ...prev,
      isLoading: true,
      loadingState: 'loading',
      loadingProgress: 0
    }));
  }, []);

  const handleVideoProgress = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const progress = (video.buffered.end(0) / video.duration) * 100;
        setVideoState(prev => ({
          ...prev,
          loadingProgress: Math.min(progress, 100),
          loadingState: 'loading'
        }));
      }
    }
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    console.log('LoadingOverlay: Video can play');
    const video = videoRef.current;
    
    // Check video duration and ready state
    if (video) {
      console.log('LoadingOverlay: Video duration:', video.duration);
      console.log('LoadingOverlay: Video readyState:', video.readyState);
      console.log('LoadingOverlay: Video buffered:', video.buffered.length > 0 ? video.buffered.end(0) : 'none');
    }
    
    setVideoState(prev => ({
      ...prev,
      isLoaded: true,
      isLoading: false,
      loadingProgress: 100,
      loadingState: 'ready'
    }));
    
    onVideoLoaded?.();
  }, [onVideoLoaded]);

  const handleVideoCanPlayThrough = useCallback(() => {
    console.log('LoadingOverlay: Video can play through');
    setVideoState(prev => ({
      ...prev,
      isLoaded: true,
      isLoading: false,
      loadingProgress: 100,
      loadingState: 'ready'
    }));
  }, []);

  const handleVideoError = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('LoadingOverlay: Video error (React):', event);
    const videoElement = event.currentTarget;
    const errorCode = videoElement.error?.code || 'Unknown';
    const errorMessage = videoElement.error?.message || 'No error message available';
    
    console.error('LoadingOverlay: Error details:', { errorCode, errorMessage });
    
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
      loadingState: 'error'
    }));
    
    const errorObj = new Error(`Video loading error: ${errorCode} - ${errorMessage}`);
    onVideoError?.(errorObj);
  }, [onVideoError]);

  // Native DOM event handlers for addEventListener
  const handleVideoErrorNative = useCallback((event: Event) => {
    console.error('LoadingOverlay: Video error (Native):', event);
    const videoElement = event.target as HTMLVideoElement;
    const errorCode = videoElement.error?.code || 'Unknown';
    const errorMessage = videoElement.error?.message || 'No error message available';
    
    console.error('LoadingOverlay: Error details:', { errorCode, errorMessage });
    
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
      loadingState: 'error'
    }));
    
    const errorObj = new Error(`Video loading error: ${errorCode} - ${errorMessage}`);
    onVideoError?.(errorObj);
  }, [onVideoError]);

  const handleVideoPlay = useCallback(() => {
    console.log('LoadingOverlay: Video started playing');
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handleVideoPause = useCallback(() => {
    console.log('LoadingOverlay: Video paused');
    setVideoState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleVideoWaiting = useCallback(() => {
    console.log('LoadingOverlay: Video waiting (buffering)');
    setVideoState(prev => ({
      ...prev,
      loadingState: 'loading'
    }));
  }, []);

  const handleVideoPlaying = useCallback(() => {
    console.log('LoadingOverlay: Video playing');
    setVideoState(prev => ({
      ...prev,
      loadingState: 'ready'
    }));
  }, []);

  const handleVideoEnded = useCallback(() => {
    console.log('LoadingOverlay: Video ended');
    setVideoState(prev => ({
      ...prev,
      isPlaying: false,
      playbackState: 'completed',
      transitionState: 'dissolving' // Start dissolving immediately when video ends
    }));
    
    // Trigger completion immediately when video ends
    // The parent will handle showing the main content
    onVideoComplete?.();
    
    // Auto-transition to complete state after dissolve duration
    const dissolveDuration = reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DURATION;
    setTimeout(() => {
      setVideoState(prev => ({
        ...prev,
        transitionState: 'complete',
        playbackState: 'hidden'
      }));
    }, dissolveDuration);
  }, [onVideoComplete, reducedMotion]);

  // Handle user interaction to play video
  const handleUserInteraction = useCallback(async () => {
    console.log('LoadingOverlay: User interaction detected, attempting to play video');
    if (videoRef.current) {
      const video = videoRef.current;
      
      try {
        // Ensure video is ready before attempting play
        if (video.readyState < 2) {
          console.log('LoadingOverlay: Video not ready, waiting for canplay event');
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              video.removeEventListener('canplay', handleCanPlay);
              resolve(void 0);
            };
            video.addEventListener('canplay', handleCanPlay);
          });
        }
        
        // Set optimal playback properties
        video.muted = true;
        video.volume = 0;
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        console.log('LoadingOverlay: Video started playing after user interaction');
        setVideoState(prev => ({
          ...prev,
          isPlaying: true,
          needsUserInteraction: false,
          hasError: false,
          loadingState: 'ready'
        }));
      } catch (error) {
        console.error("LoadingOverlay: Video play failed even with user interaction:", error);
        setVideoState(prev => ({
          ...prev,
          hasError: true,
          loadingState: 'error',
          isPlaying: false
        }));
      }
    }
  }, []);

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current && isVisible && attemptAutoplay && videoState.isLoaded && !videoState.autoplayAttempted) {
      const video = videoRef.current;
      const isSecure = isSecureContext();
      
      // Attempt to play the video with enhanced retry logic
      const playVideo = async (retryCount = 0) => {
        try {
          console.log(`LoadingOverlay: Attempting autoplay (attempt ${retryCount + 1}) in secure context:`, isSecure);
          
          // Ensure video is properly loaded before attempting play
          if (video.readyState < 2) {
            console.log('LoadingOverlay: Video not ready, waiting for canplay event');
            await new Promise((resolve) => {
              const handleCanPlay = () => {
                video.removeEventListener('canplay', handleCanPlay);
                resolve(void 0);
              };
              video.addEventListener('canplay', handleCanPlay);
            });
          }
          
          // Set video properties for better autoplay success
          video.muted = true;
          video.playsInline = true;
          video.volume = 0;
          
          const playPromise = video.play();
          
          // Handle play promise (some browsers return promises)
          if (playPromise !== undefined) {
            await playPromise;
          }
          
          console.log('LoadingOverlay: Autoplay successful');
          setVideoState(prev => ({
            ...prev,
            isPlaying: true,
            autoplayAttempted: true,
            needsUserInteraction: false
          }));
        } catch (error) {
          console.warn(`LoadingOverlay: Autoplay failed (attempt ${retryCount + 1}):`, error);
          console.log("LoadingOverlay: Secure context:", isSecure);
          console.log("LoadingOverlay: Video readyState:", video.readyState);
          
          // Retry logic for transient failures
          if (retryCount < 2) {
            console.log('LoadingOverlay: Retrying autoplay after short delay');
            setTimeout(() => playVideo(retryCount + 1), 500);
            return;
          }
          
          // If we're in a non-secure context, show the play button immediately
          if (!isSecure) {
            console.log("LoadingOverlay: Non-secure context detected, showing play button immediately");
          }
          
          setVideoState(prev => ({
            ...prev,
            autoplayAttempted: true,
            needsUserInteraction: true,
            isPlaying: false
          }));
        }
      };

      // Track autoplay attempt for monitoring
      trackAutoplayAttempt();
      
      // Add a small delay to ensure DOM is fully ready
      setTimeout(() => playVideo(), 100);
    }
  }, [isVisible, videoState.isLoaded, videoState.autoplayAttempted, attemptAutoplay]);

  // Add fallback to complete video if it doesn't play after 3 seconds
  useEffect(() => {
    if (isVisible && attemptAutoplay && !videoState.isPlaying && !videoState.hasError) {
      const fallbackTimer = setTimeout(() => {
        console.log('LoadingOverlay: Fallback timer triggered, completing video');
        setVideoState(prev => ({
          ...prev,
          transitionState: 'complete',
          playbackState: 'completed'
        }));
        onVideoComplete?.();
      }, 3000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [isVisible, attemptAutoplay, videoState.isPlaying, videoState.hasError, onVideoComplete]);

  // Set up event listeners with cross-browser compatibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const listenerOptions = getEventListenerOptions();

    // Add event listeners with proper options
    video.addEventListener('loadstart', handleVideoLoadStart, listenerOptions);
    video.addEventListener('progress', handleVideoProgress, listenerOptions);
    video.addEventListener('canplay', handleVideoCanPlay, listenerOptions);
    video.addEventListener('canplaythrough', handleVideoCanPlayThrough, listenerOptions);
    video.addEventListener('error', handleVideoErrorNative, listenerOptions);
    video.addEventListener('waiting', handleVideoWaiting, listenerOptions);
    video.addEventListener('playing', handleVideoPlaying, listenerOptions);
    video.addEventListener('ended', handleVideoEnded, listenerOptions);

    // Add touch event listeners for mobile compatibility
    if (videoState.browserInfo?.isMobile) {
      video.addEventListener('touchstart', handleUserInteraction, listenerOptions);
      video.addEventListener('touchend', handleUserInteraction, listenerOptions);
    }

    // Cleanup function
    return () => {
      video.removeEventListener('loadstart', handleVideoLoadStart, listenerOptions);
      video.removeEventListener('progress', handleVideoProgress, listenerOptions);
      video.removeEventListener('canplay', handleVideoCanPlay, listenerOptions);
      video.removeEventListener('canplaythrough', handleVideoCanPlayThrough, listenerOptions);
      video.removeEventListener('error', handleVideoErrorNative, listenerOptions);
      video.removeEventListener('waiting', handleVideoWaiting, listenerOptions);
      video.removeEventListener('playing', handleVideoPlaying, listenerOptions);
      video.removeEventListener('ended', handleVideoEnded, listenerOptions);
      
      if (videoState.browserInfo?.isMobile) {
        video.removeEventListener('touchstart', handleUserInteraction, listenerOptions);
        video.removeEventListener('touchend', handleUserInteraction, listenerOptions);
      }
    };
  }, [handleVideoLoadStart, handleVideoProgress, handleVideoCanPlay, handleVideoCanPlayThrough, handleVideoErrorNative, handleVideoWaiting, handleVideoPlaying, handleVideoEnded, handleUserInteraction, videoState.browserInfo?.isMobile]);

  // Cleanup minimum display timer
  useEffect(() => {
    return () => {
      if (minDisplayTimeRef.current) {
        clearTimeout(minDisplayTimeRef.current);
      }
    };
  }, []);

  // Handle transition state changes with orchestration support
  useEffect(() => {
    // Only start dissolving when orchestration allows it
    if (orchestrationState?.sequencePhase === 'video-dissolving' && videoState.transitionState !== 'dissolving') {
      setVideoState(prev => ({
        ...prev,
        transitionState: 'dissolving',
        playbackState: 'dissolving'
      }));
    }
  }, [orchestrationState?.sequencePhase, videoState.transitionState]);

  useEffect(() => {
    if (videoState.transitionState === 'dissolving') {
      const duration = reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DURATION;
      const timer = setTimeout(() => {
        setVideoState(prev => ({
          ...prev,
          transitionState: 'complete',
          playbackState: 'hidden'
        }));
        onTransitionComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [videoState.transitionState, reducedMotion, onTransitionComplete]);

  // Animation variants as specified in architecture
  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: { duration: 0 }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0 : 0.3,
        ease: "easeOut"
      }
    },
    dissolving: {
      opacity: 0,
      transition: {
        duration: reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DURATION / 1000,
        delay: 0
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.3,
        ease: "easeIn"
      }
    }
  };

  // Don't return null immediately when transition is complete to prevent white screen
  // Instead, keep the component but make it fully transparent
  if (!isVisible) {
    console.log('LoadingOverlay: Not visible, returning null');
    return null;
  }

  // Get safe z-index value
  const safeZIndex = getSafeZIndex();

  // Simplified video source - always use the MP4 URL from Cloudinary
  const getVideoSources = () => {
    const optimalSource = getOptimalVideoSource();
    console.log('LoadingOverlay: Using video source:', optimalSource);
    
    return [
      <source key="cloudinary-mp4" src={optimalSource.primary} type="video/mp4" />
    ];
  };

  // Get responsive styles based on viewport
  const getResponsiveStyles = useCallback(() => {
    const baseStyles = {
      ...getOverlayStyles(safeZIndex),
      ...getPrefixedStyles({
        transition: `opacity ${reducedMotion ? '0' : '0.3'}s ease-out`
      })
    };

    // Add responsive adjustments for mobile
    if (videoState.browserInfo?.isMobile) {
      return {
        ...baseStyles,
        ...getSafeAreaInsets()
      };
    }

    return baseStyles;
  }, [safeZIndex, reducedMotion, videoState.browserInfo?.isMobile]);

  // Get safe area insets for mobile devices
  const getSafeAreaInsets = () => ({
    paddingTop: 'env(safe-area-inset-top, 0)',
    paddingRight: 'env(safe-area-inset-right, 0)',
    paddingBottom: 'env(safe-area-inset-bottom, 0)',
    paddingLeft: 'env(safe-area-inset-left, 0)'
  });

  // Performance analysis and debug logging
  const performanceAnalysis = getPerformanceAnalysis();
  
  // Debug logging for overlay state
  console.log('LoadingOverlay render state:', {
    isVisible,
    videoState,
    orchestrationState,
    videoMetrics,
    performanceAnalysis,
    animateState: videoState.transitionState === 'complete' ? 'exit' :
      orchestrationState?.sequencePhase === 'video-dissolving' ? 'dissolving' :
      videoState.transitionState === 'dissolving' ? 'dissolving' :
      'visible'
  });

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000',
        ...getResponsiveStyles(),
        // Add GPU acceleration for smooth transitions
        ...getHardwareAccelerationStyles(),
      }}
      variants={overlayVariants}
      initial="hidden"
      animate={
        videoState.transitionState === 'complete' ? 'exit' :
        orchestrationState?.sequencePhase === 'video-dissolving' ? 'dissolving' :
        videoState.transitionState === 'dissolving' ? 'dissolving' :
        'visible'
      }
      exit="exit"
      role="presentation"
      aria-label="Video introduction overlay"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          ...getResponsiveVideoStyles(),
          ...getPrefixedStyles({
            opacity: videoState.isLoaded ? '1' : '0',
            transition: 'opacity 0s ease-in-out' // Instant transition for video opacity
          }),
          // Add GPU acceleration for the video element
          ...getHardwareAccelerationStyles()
        }}
        autoPlay={false} // We'll handle autoplay manually for better control
        muted
        playsInline
        preload="auto" // Ensure full preload for immediate playback
        loop={false}
        // Add development-specific attributes for localhost
        {...(process.env.NODE_ENV === 'development' && {
          crossOrigin: 'anonymous',
          // Force muted autoplay in development
          muted: true
        })}
        // Add device-specific performance attributes
        x-webkit-airplay="allow"
        x-webkit-preserve-pitch="false"
        // Add adaptive quality attributes for mobile devices
        {...(videoState.browserInfo?.isMobile && {
          // Reduce quality on mobile to save bandwidth
          'data-optimized': 'mobile',
          // Disable picture-in-picture on mobile to save resources
          disablePictureInPicture: true
        })}
        onLoadStart={handleVideoLoadStart}
        onProgress={handleVideoProgress}
        onCanPlay={handleVideoCanPlay}
        onCanPlayThrough={handleVideoCanPlayThrough}
        onError={handleVideoError}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onWaiting={handleVideoWaiting}
        onPlaying={handleVideoPlaying}
        onEnded={handleVideoEnded}
        {...getVideoAttributes()}
      >
        {getVideoSources()}
        Your browser does not support the video tag.
      </video>

      {/* Fallback background while video loads or if video is disabled */}
      <div
        className={fallbackBgColor}
        style={{
          ...getResponsiveContainerStyles(),
          ...getPrefixedStyles({
            opacity: videoState.isLoaded && !videoState.hasError ? '0' : '1',
            transition: useFizzEffect ? 'opacity 0s ease-in-out' : `opacity ${reducedMotion ? '0' : '1'}s ease-in-out`,
            // Ensure black background stays during transition to prevent white flash
            backgroundColor: '#000000'
          })
        }}
      />

      {/* Loading spinner */}
      {showLoadingIndicator && videoState.isLoading && (
        <div
          style={{
            ...getLoadingSpinnerStyles(),
            ...getFlexboxStyles('column', 'center', 'center')
          }}
        >
          <div style={getFlexboxStyles('column', 'center', 'center')}>
            <Loader2
              className={`text-white ${reducedMotion ? '' : 'animate-spin'}`}
              strokeWidth={2}
              style={{
                ...getHardwareAccelerationStyles(),
                width: videoState.browserInfo?.isMobile ? '3rem' : '3rem',
                height: videoState.browserInfo?.isMobile ? '3rem' : '3rem'
              }}
            />
            {videoState.loadingState === 'loading' && (
              <p
                className="text-white mt-2"
                style={{
                  ...getConsistentTextStyles(),
                  fontSize: videoState.browserInfo?.isMobile ? '0.875rem' : '0.875rem'
                }}
              >
                {loadingText} {Math.round(videoState.loadingProgress)}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* Play button for browsers that block autoplay */}
      {showPlayButton && videoState.needsUserInteraction && videoState.isLoaded && !videoState.isPlaying && (
        <div
          style={{
            ...getLoadingSpinnerStyles(),
            zIndex: '20'
          }}
        >
          <button
            onClick={handleUserInteraction}
            onTouchStart={handleUserInteraction}
            style={{
              ...getTouchButtonStyles(),
              ...getFlexboxStyles('column', 'center', 'center'),
              ...getPrefixedStyles({
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                borderRadius: '0.5rem',
                padding: videoState.browserInfo?.isMobile ? '1rem' : '1.5rem',
                transition: 'background-color 0.2s ease'
              })
            }}
            aria-label={playButtonText}
          >
            <Play
              strokeWidth={2}
              style={{
                width: videoState.browserInfo?.isMobile ? '3rem' : '4rem',
                height: videoState.browserInfo?.isMobile ? '3rem' : '4rem',
                marginBottom: '0.5rem'
              }}
            />
            <span
              style={{
                ...getConsistentTextStyles(),
                fontSize: videoState.browserInfo?.isMobile ? '1rem' : '1.125rem',
                fontWeight: '500'
              }}
            >
              {playButtonText}
            </span>
          </button>
        </div>
      )}

      {/* Error state */}
      {videoState.hasError && (
        <div
          style={{
            ...getLoadingSpinnerStyles(),
            zIndex: '10'
          }}
        >
          <div style={getFlexboxStyles('column', 'center', 'center')}>
            <p
              className="text-white mb-2"
              style={{
                ...getConsistentTextStyles(),
                fontSize: videoState.browserInfo?.isMobile ? '1.125rem' : '1.25rem'
              }}
            >
              Unable to load video
            </p>
            <p
              className="text-white opacity-75"
              style={{
                ...getConsistentTextStyles(),
                fontSize: videoState.browserInfo?.isMobile ? '0.875rem' : '0.875rem'
              }}
            >
              Please check your connection
            </p>
            {attemptAutoplay && videoState.needsUserInteraction && (
              <button
                onClick={handleUserInteraction}
                style={{
                  ...getTouchButtonStyles(),
                  ...getPrefixedStyles({
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '0.25rem',
                    transition: 'background-color 0.2s ease'
                  })
                }}
                aria-label="Try playing video again"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export { LoadingOverlay };