import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { LoadingOverlayProps, VideoState } from "./loading-types";
import {
  detectBrowser,
  getOptimalVideoFormat,
  requiresUserInteractionForAutoplay,
  getSafeZIndex,
  getEventListenerOptions,
  supportsVideoFormat
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
  getFlexboxStyles,
  mediaQueries
} from "../../../lib/cross-browser-styles";

const LoadingOverlay = ({
  isVisible = true,
  videoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
  videoUrls = {},
  fallbackBgColor = "bg-black",
  onVideoLoaded,
  onVideoError,
  onTransitionComplete,
  className = "",
  attemptAutoplay = true,
  showPlayButton = true,
  playButtonText = "Play to Continue",
}: LoadingOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoState, setVideoState] = useState<VideoState>(() => {
    const browserInfo = detectBrowser();
    const supportedFormat = getOptimalVideoFormat();
    const needsUserInteraction = requiresUserInteractionForAutoplay();
    
    return {
      isLoaded: false,
      hasError: false,
      isPlaying: false,
      isLoading: false,
      isBuffering: false,
      loadingProgress: 0,
      loadingState: 'idle',
      transitionState: 'visible',
      needsUserInteraction,
      autoplayAttempted: false,
      supportedFormat,
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
  const hasMinDisplayTimeElapsed = useRef(false);
  
  const reducedMotion = useReducedMotion();

  // Handle video events
  const handleVideoLoadStart = useCallback(() => {
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
          isBuffering: true,
          loadingState: 'buffering'
        }));
      }
    }
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isLoaded: true,
      isLoading: false,
      isBuffering: false,
      loadingProgress: 100,
      loadingState: 'ready'
    }));
    
    // Set minimum display time if not already set
    if (!hasMinDisplayTimeElapsed.current) {
      minDisplayTimeRef.current = setTimeout(() => {
        hasMinDisplayTimeElapsed.current = true;
      }, 1500); // Minimum 1.5 seconds display time
    }
    
    onVideoLoaded?.();
  }, [onVideoLoaded]);

  const handleVideoCanPlayThrough = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isLoaded: true,
      isLoading: false,
      isBuffering: false,
      loadingProgress: 100,
      loadingState: 'ready'
    }));
  }, []);

  const handleVideoError = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
      isBuffering: false,
      loadingState: 'error'
    }));
    
    // Convert error to Error object for callback
    const errorObj = new Error(`Video loading error: ${event.type || 'Unknown error'}`);
    onVideoError?.(errorObj);
  }, [onVideoError]);

  // Native DOM event handlers for addEventListener
  const handleVideoErrorNative = useCallback((event: Event) => {
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
      isBuffering: false,
      loadingState: 'error'
    }));
    
    // Convert error to Error object for callback
    const errorObj = new Error(`Video loading error: ${event.type || 'Unknown error'}`);
    onVideoError?.(errorObj);
  }, [onVideoError]);

  const handleVideoPlay = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handleVideoPause = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleVideoWaiting = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isBuffering: true,
      loadingState: 'buffering'
    }));
  }, []);

  const handleVideoPlaying = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isBuffering: false,
      loadingState: 'ready'
    }));
  }, []);

  const handleVideoEnded = useCallback(() => {
    setVideoState(prev => ({
      ...prev,
      isPlaying: false,
      transitionState: 'dissolving'
    }));
  }, []);

  // Handle user interaction to play video
  const handleUserInteraction = useCallback(async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      try {
        await video.play();
        setVideoState(prev => ({
          ...prev,
          isPlaying: true,
          needsUserInteraction: false
        }));
      } catch (error) {
        console.warn("Video play failed even with user interaction:", error);
        setVideoState(prev => ({
          ...prev,
          hasError: true,
          loadingState: 'error'
        }));
      }
    }
  }, []);

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current && isVisible && attemptAutoplay) {
      const video = videoRef.current;
      
      // Attempt to play the video
      const playVideo = async () => {
        try {
          await video.play();
          setVideoState(prev => ({
            ...prev,
            isPlaying: true,
            autoplayAttempted: true
          }));
        } catch (error) {
          console.warn("Video autoplay failed:", error);
          setVideoState(prev => ({
            ...prev,
            autoplayAttempted: true,
            needsUserInteraction: true
          }));
        }
      };

      // Start playing when video can play
      if (videoState.isLoaded && hasMinDisplayTimeElapsed.current && !videoState.autoplayAttempted) {
        playVideo();
      }
    }
  }, [isVisible, videoState.isLoaded, hasMinDisplayTimeElapsed.current, videoState.autoplayAttempted, attemptAutoplay]);

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

  // Handle transition state changes
  useEffect(() => {
    if (videoState.transitionState === 'dissolving') {
      const timer = setTimeout(() => {
        setVideoState(prev => ({
          ...prev,
          transitionState: 'complete'
        }));
        onTransitionComplete?.();
      }, reducedMotion ? 0 : 1500); // 1.5 seconds for the transition

      return () => clearTimeout(timer);
    }
  }, [videoState.transitionState, reducedMotion, onTransitionComplete]);

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
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
        duration: reducedMotion ? 0 : 1.5, // 1.5 seconds for dissolve
        ease: "easeInOut"
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

  if (!isVisible || videoState.transitionState === 'complete') return null;

  // Get safe z-index value
  const safeZIndex = getSafeZIndex();

  // Generate responsive video source URLs
  const getVideoSources = () => {
    const sources = [];
    
    // Add WebM source if available
    if (videoUrls.webm && supportsVideoFormat('webm')) {
      sources.push(
        <source key="webm" src={videoUrls.webm} type="video/webm" />
      );
    }
    
    // Add OGG source if available
    if (videoUrls.ogg && supportsVideoFormat('ogg')) {
      sources.push(
        <source key="ogg" src={videoUrls.ogg} type="video/ogg" />
      );
    }
    
    // Always add MP4 as fallback
    sources.push(
      <source key="mp4" src={videoUrl} type="video/mp4" />
    );
    
    return sources;
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

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={getResponsiveStyles()}
      variants={overlayVariants}
      initial="hidden"
      animate={videoState.transitionState === 'dissolving' ? 'dissolving' : 'visible'}
      exit="exit"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        style={{
          ...getResponsiveVideoStyles(),
          ...getPrefixedStyles({
            opacity: videoState.isLoaded ? '1' : '0',
            transition: `opacity ${reducedMotion ? '0' : '1'}s ease-in-out`
          })
        }}
        autoPlay={attemptAutoplay && !videoState.needsUserInteraction}
        muted
        playsInline
        preload="auto"
        loop={false}
        onCanPlay={handleVideoCanPlay}
        onError={handleVideoError}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
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
            transition: `opacity ${reducedMotion ? '0' : '1'}s ease-in-out`
          })
        }}
      />

      {/* Loading spinner for video loading and buffering states */}
      {(videoState.isLoading || videoState.isBuffering || (videoState.isLoaded && !videoState.isPlaying && !hasMinDisplayTimeElapsed.current)) && (
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
            {videoState.loadingState === 'buffering' && (
              <p
                className="text-white mt-2"
                style={{
                  ...getConsistentTextStyles(),
                  fontSize: videoState.browserInfo?.isMobile ? '0.875rem' : '0.875rem'
                }}
              >
                Buffering...
              </p>
            )}
            {videoState.loadingState === 'loading' && (
              <p
                className="text-white mt-2"
                style={{
                  ...getConsistentTextStyles(),
                  fontSize: videoState.browserInfo?.isMobile ? '0.875rem' : '0.875rem'
                }}
              >
                Loading... {Math.round(videoState.loadingProgress)}%
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