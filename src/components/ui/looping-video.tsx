import { useRef, useEffect, useCallback, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  getEventListenerOptions
} from "../../lib/browser-detection";
import {
  getPrefixedStyles,
  getResponsiveVideoStyles,
  getVideoAttributes
} from "../../lib/cross-browser-styles";

interface LoopingVideoProps {
  videoUrl: string;
  isVisible: boolean;
  onVideoReady?: () => void;
  onVideoError?: (error?: Error) => void;
  onVideoCanPlay?: () => void;
  onVideoLoadedData?: () => void;
  preload?: boolean;
  className?: string;
  fallbackBgColor?: string;
  videoElement?: HTMLVideoElement | null; // Preloaded video element
}

/**
 * Video component that loops infinitely with cross-browser compatibility
 */
export const LoopingVideo = ({
  videoUrl,
  isVisible,
  onVideoReady,
  onVideoError,
  onVideoCanPlay,
  onVideoLoadedData,
  preload = true,
  className = "",
  fallbackBgColor = "bg-black",
  videoElement
}: LoopingVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoState, setVideoState] = useState({
    isLoaded: false,
    canPlay: false,
    loadedData: false,
    hasError: false,
    isPlaying: false,
    needsUserInteraction: false
  });

  const reducedMotion = useReducedMotion();

  // Handle video events
  const handleVideoCanPlay = useCallback(() => {
    console.log('[LoopingVideo] Video can play');
    setVideoState(prev => ({
      ...prev,
      canPlay: true,
      isLoaded: true,
      isPlaying: true
    }));
    onVideoCanPlay?.();
    onVideoReady?.();
  }, [onVideoCanPlay, onVideoReady]);

  const handleVideoError = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('[LoopingVideo] Video error:', event);
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isPlaying: false
    }));
    
    const errorObj = new Error(`Video loading error: ${event.type || 'Unknown error'}`);
    onVideoError?.(errorObj);
  }, [onVideoError]);

  // Native DOM event handler for addEventListener
  const handleVideoErrorNative = useCallback((event: Event) => {
    console.error('[LoopingVideo] Video error:', event);
    setVideoState(prev => ({
      ...prev,
      hasError: true,
      isPlaying: false
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

  const handleVideoLoadedData = useCallback(() => {
    console.log('[LoopingVideo] Video data loaded');
    setVideoState(prev => ({
      ...prev,
      loadedData: true
    }));
    onVideoLoadedData?.();
  }, [onVideoLoadedData]);

  // Handle user interaction to play video
  const handleUserInteraction = useCallback(async () => {
    const video = videoElement;
    if (video) {
      try {
        await video.play();
        setVideoState(prev => ({
          ...prev,
          isPlaying: true,
          needsUserInteraction: false
        }));
      } catch (error) {
        console.warn("[LoopingVideo] Video play failed even with user interaction:", error);
        setVideoState(prev => ({
          ...prev,
          hasError: true
        }));
      }
    }
  }, [videoElement]);

  // Use preloaded video element if provided
  useEffect(() => {
    if (videoElement && containerRef.current) {
      console.log('[LoopingVideo] Using preloaded video element');
      
      // Set video attributes for looping video
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.playsInline = true;
      
      // Move video element to our container
      containerRef.current.appendChild(videoElement);
      
      // Set video state based on current element state
      if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
        console.log('[LoopingVideo] Preloaded video is ready');
        setVideoState(prev => ({
          ...prev,
          isLoaded: true,
          canPlay: true,
          loadedData: true
        }));
        onVideoCanPlay?.();
        onVideoLoadedData?.();
        onVideoReady?.();
      }
      
      // Auto-play when visible
      if (isVisible) {
        videoElement.play().then(() => {
          console.log('[LoopingVideo] Preloaded video playing');
          setVideoState(prev => ({
            ...prev,
            isPlaying: true
          }));
        }).catch(error => {
          console.warn("[LoopingVideo] Preloaded video autoplay failed:", error);
          setVideoState(prev => ({
            ...prev,
            needsUserInteraction: true
          }));
        });
      }
    }
  }, [videoElement, isVisible, onVideoCanPlay, onVideoLoadedData, onVideoReady]);

  // Add effect to ensure video plays when parent opacity changes
  useEffect(() => {
    const video = videoElement;
    if (video && isVisible && videoState.isLoaded && !videoState.isPlaying && !videoState.needsUserInteraction) {
      console.log('[LoopingVideo] Video should be visible, attempting to play');
      console.log('[LoopingVideo] Video element state during opacity change - paused:', video.paused, 'currentTime:', video.currentTime, 'readyState:', video.readyState);
      video.play().then(() => {
        console.log('[LoopingVideo] Video play successful on opacity change');
        setVideoState(prev => ({ ...prev, isPlaying: true }));
      }).catch(error => {
        console.warn("[LoopingVideo] Video play failed on opacity change:", error);
      });
    }
  }, [isVisible, videoState.isLoaded, videoState.isPlaying, videoState.needsUserInteraction, videoElement]);

  // Force video to play when it becomes visible during transition
  useEffect(() => {
    const video = videoElement;
    if (video && isVisible && videoState.isLoaded && !videoState.isPlaying) {
      console.log('[LoopingVideo] Forcing video to play during transition');
      console.log('[LoopingVideo] Video element state during force play - paused:', video.paused, 'currentTime:', video.currentTime, 'readyState:', video.readyState);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('[LoopingVideo] Force play successful');
          setVideoState(prev => ({ ...prev, isPlaying: true }));
        }).catch(error => {
          console.warn('[LoopingVideo] Force play failed:', error);
        });
      }
    }
  }, [isVisible, videoState.isLoaded, videoState.isPlaying, videoElement]);

  // Set up event listeners for preloaded video
  useEffect(() => {
    const video = videoElement;
    if (!video) return;

    const listenerOptions = getEventListenerOptions();

    video.addEventListener('canplay', handleVideoCanPlay, listenerOptions);
    video.addEventListener('loadeddata', handleVideoLoadedData, listenerOptions);
    video.addEventListener('error', handleVideoErrorNative, listenerOptions);
    video.addEventListener('play', handleVideoPlay, listenerOptions);
    video.addEventListener('pause', handleVideoPause, listenerOptions);

    return () => {
      video.removeEventListener('canplay', handleVideoCanPlay, listenerOptions);
      video.removeEventListener('loadeddata', handleVideoLoadedData, listenerOptions);
      video.removeEventListener('error', handleVideoErrorNative, listenerOptions);
      video.removeEventListener('play', handleVideoPlay, listenerOptions);
      video.removeEventListener('pause', handleVideoPause, listenerOptions);
    };
  }, [handleVideoCanPlay, handleVideoLoadedData, handleVideoErrorNative, handleVideoPlay, handleVideoPause, videoElement]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 ${fallbackBgColor} ${className}`} style={{ backgroundColor: '#000000' }}>
      {/* Video Background */}
      <video
        style={{
          ...getResponsiveVideoStyles(),
          ...getPrefixedStyles({
            opacity: videoState.isLoaded ? '1' : '0',
            transition: `opacity ${reducedMotion ? '0' : '1'}s ease-in-out`,
            backgroundColor: '#000000' // Ensure black background
          })
        }}
        autoPlay={true} // Force autoplay
        muted
        playsInline
        preload="auto" // Force preload
        loop={true}
        onCanPlay={handleVideoCanPlay}
        onLoadedData={handleVideoLoadedData}
        onError={handleVideoError}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        aria-label="Background video"
        {...getVideoAttributes()}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Debug information */}
      {false && (
        <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px', fontSize: '12px', zIndex: 1000 }}>
          <div>URL: {videoUrl}</div>
          <div>isVisible: {isVisible.toString()}</div>
          <div>isLoaded: {videoState.isLoaded.toString()}</div>
          <div>isPlaying: {videoState.isPlaying.toString()}</div>
          <div>needsUserInteraction: {videoState.needsUserInteraction.toString()}</div>
          <div>hasError: {videoState.hasError.toString()}</div>
        </div>
      )}

      {/* Play button for browsers that block autoplay - HIDDEN FOR PROFESSIONAL PRESENTATION */}
      {false && videoState.needsUserInteraction && videoState.isLoaded && !videoState.isPlaying && (
        <div className="fixed inset-0 flex items-center justify-center z-20">
          <button
            onClick={handleUserInteraction}
            onTouchStart={handleUserInteraction}
            className="px-6 py-3 bg-black bg-opacity-50 text-white rounded-lg transition-colors duration-200 hover:bg-opacity-70"
            aria-label="Play video"
          >
            <span className="text-lg font-medium">Play Video</span>
          </button>
        </div>
      )}

      {/* Error state - HIDDEN FOR PROFESSIONAL PRESENTATION */}
      {false && videoState.hasError && (
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <p className="text-xl mb-2">Unable to load video</p>
            <p className="text-sm opacity-75">Please check your connection</p>
            {videoState.needsUserInteraction && (
              <button
                onClick={handleUserInteraction}
                className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-white rounded transition-colors duration-200 hover:bg-opacity-30"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};