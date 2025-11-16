import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { TMLoop } from "./tm-loop";
import {
  detectBrowser,
  getOptimalVideoFormat,
  requiresUserInteractionForAutoplay,
  getSafeZIndex,
  getEventListenerOptions
} from "../../lib/browser-detection";
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
} from "../../lib/cross-browser-styles";

interface VideoIntroOverlayProps {
  videoUrl: string;
  onVideoComplete?: () => void;
  onVideoError?: (error: Error) => void;
  className?: string;
  fallbackBgColor?: string;
  autoPlay?: boolean;
  showLoadingIndicator?: boolean;
  loadingText?: string;
  playButtonText?: string;
}

interface VideoState {
  isLoaded: boolean;
  hasError: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  loadingProgress: number;
  loadingState: 'idle' | 'loading' | 'buffering' | 'ready' | 'error';
  transitionState: 'visible' | 'dissolving' | 'complete';
  needsUserInteraction: boolean;
  autoplayAttempted: boolean;
  supportedFormat: 'webm' | 'mp4' | 'ogg';
  browserInfo: {
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isEdge: boolean;
    isMobile: boolean;
  };
}

const VideoIntroOverlay = ({
  videoUrl,
  onVideoComplete,
  onVideoError,
  className = "",
  fallbackBgColor = "bg-black",
  autoPlay = true,
  showLoadingIndicator = true,
  loadingText = "Loading...",
  playButtonText = "Tap to Play"
}: VideoIntroOverlayProps) => {
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
  }, []);

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
    
    const errorObj = new Error(`Video loading error: ${event.type || 'Unknown error'}`);
    onVideoError?.(errorObj);
  }, [onVideoError]);

  const handleVideoErrorNative = useCallback((event: Event) => {
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
      isBuffering: false,
      loadingState: 'error'
    }));
    
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
    
    // Trigger completion callback after a delay to allow for the dissolve effect
    setTimeout(() => {
      onVideoComplete?.();
    }, 500); // 0.5 second delay before triggering completion
  }, [onVideoComplete]);

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
    if (videoRef.current && autoPlay) {
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
      if (videoState.isLoaded && !videoState.autoplayAttempted) {
        playVideo();
      }
    }
  }, [autoPlay, videoState.isLoaded, videoState.autoplayAttempted]);

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

  // Handle transition state changes
  useEffect(() => {
    if (videoState.transitionState === 'dissolving') {
      const timer = setTimeout(() => {
        setVideoState(prev => ({
          ...prev,
          transitionState: 'complete'
        }));
      }, reducedMotion ? 0 : 4500); // 4.5 seconds for the extended dissolve transition

      return () => clearTimeout(timer);
    }
  }, [videoState.transitionState, reducedMotion]);

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
      filter: "blur(2px) brightness(1.2) contrast(1.1)",
      scale: 1.02,
      transition: {
        duration: reducedMotion ? 0 : 4.5, // 4.5 seconds for extended dissolve
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing curve for fizz effect
        delay: reducedMotion ? 0 : 0.5, // 0.5 second delay before starting dissolve
        filter: {
          duration: reducedMotion ? 0 : 3.5,
          ease: "easeInOut"
        },
        scale: {
          duration: reducedMotion ? 0 : 4.5,
          ease: "easeInOut"
        }
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

  if (videoState.transitionState === 'complete') return null;

  // Get safe z-index value
  const safeZIndex = getSafeZIndex();

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
      style={{
        ...getResponsiveStyles(),
        // Add additional styles for the fizz effect
        ...(videoState.transitionState === 'dissolving' && !reducedMotion ? {
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
        } : {})
      }}
      variants={overlayVariants}
      initial="hidden"
      animate={videoState.transitionState === 'dissolving' ? 'dissolving' : 'visible'}
      exit="exit"
      role="presentation"
      aria-label="Video introduction overlay"
    >
      {/* TM Loop - always visible during video */}
      <TMLoop isVisible={true} />

      {/* Logo Overlay - appears at start */}
      {videoState.transitionState === 'visible' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 1.2, // 1.2 seconds overlay duration
            ease: "easeOut"
          }}
          onAnimationComplete={() => {
            // Flash effect after overlay appears
            setTimeout(() => {
              // Play anvil sound
              const audio = new Audio('/hammer.mp3');
              audio.volume = 0.3;
              audio.play().catch(e => console.warn('Audio play failed:', e));

              // Logo flash
              setTimeout(() => {
                // Flash animation would happen here
              }, 300); // 0.3s flash

              // Fade out after total 1.2s + 0.7s = 1.9s
              setTimeout(() => {
                // Fade out handled by exit animation
              }, 700); // 0.7s fade-out
            }, 1200); // After 1.2s overlay
          }}
        >
          <motion.img
            src="https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png"
            alt="ARCHE FORGE"
            className="max-w-full h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            style={{
              width: 'clamp(240px, 50vw, 400px)',
              height: 'auto',
              objectFit: 'contain'
            }}
            animate={{
              scale: [1, 1.1, 1], // Flash effect
              filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.3, // 0.3s flash
              delay: reducedMotion ? 0 : 1.2, // After 1.2s overlay
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
      {/* Video Background */}
      <motion.video
        ref={videoRef}
        style={{
          ...getResponsiveVideoStyles(),
          ...getPrefixedStyles({
            opacity: videoState.isLoaded ? '1' : '0',
            transition: 'opacity 0s ease-in-out' // Instant transition
          })
        }}
        animate={videoState.transitionState === 'dissolving' ? {
          opacity: 0,
          filter: "blur(3px) brightness(1.3) saturate(1.2) contrast(1.2)",
          scale: 1.05,
        } : {}}
        transition={{
          duration: reducedMotion ? 0 : 4.5,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: reducedMotion ? 0 : 0.5,
        }}
        autoPlay={autoPlay && !videoState.needsUserInteraction}
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
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>

      {/* Fallback background while video loads or if video is disabled */}
      <div
        className={fallbackBgColor}
        style={{
          ...getResponsiveContainerStyles(),
          ...getPrefixedStyles({
            opacity: videoState.isLoaded && !videoState.hasError ? '0' : '1',
            transition: 'opacity 0s ease-in-out' // Instant transition
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
      {videoState.needsUserInteraction && videoState.isLoaded && !videoState.isPlaying && (
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
            {autoPlay && videoState.needsUserInteraction && (
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

export { VideoIntroOverlay };
export type { VideoIntroOverlayProps };