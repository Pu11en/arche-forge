import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Video loading state for individual video
 */
export interface VideoState {
  url: string;
  isLoading: boolean;
  isLoaded: boolean;
  canPlay: boolean;
  error: Error | null;
  element: HTMLVideoElement | null;
  bufferedPercent: number;
}

/**
 * Synchronization state for multiple videos
 */
export interface SynchronizationState {
  allVideosReady: boolean;
  anyVideoError: boolean;
  loadingProgress: number; // 0-1
}

/**
 * Hook for managing video loading states and synchronization
 * Ensures both videos are ready before transition
 */
export const useVideoSynchronization = (videoUrls: string[]) => {
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>(() => {
    const initialStates: Record<string, VideoState> = {};
    videoUrls.forEach(url => {
      initialStates[url] = {
        url,
        isLoading: false,
        isLoaded: false,
        canPlay: false,
        error: null,
        element: null,
        bufferedPercent: 0
      };
    });
    return initialStates;
  });

  const [syncState, setSyncState] = useState<SynchronizationState>({
    allVideosReady: false,
    anyVideoError: false,
    loadingProgress: 0
  });

  const videoElementsRef = useRef<Record<string, HTMLVideoElement>>({});
  const preloadPromisesRef = useRef<Record<string, Promise<void>>>({});

  /**
   * Update video state
   */
  const updateVideoState = useCallback((url: string, updates: Partial<VideoState>) => {
    setVideoStates(prev => ({
      ...prev,
      [url]: { ...prev[url], ...updates }
    }));
  }, []);

  /**
   * Preload a single video
   */
  const preloadVideo = useCallback((url: string): Promise<void> => {
    // Return existing promise if already loading
    if (url in preloadPromisesRef.current) {
      return preloadPromisesRef.current[url];
    }

    console.log(`[VideoSynchronization] Starting to preload video: ${url}`);
    updateVideoState(url, { isLoading: true, error: null });

    const promise = new Promise<void>((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.loop = url === videoUrls[2]; // Only loop the third video (looping video)
      video.crossOrigin = 'anonymous'; // Enable CORS for better performance
      video.style.display = 'none'; // Hide the video element
      
      // Store reference
      videoElementsRef.current[url] = video;
      updateVideoState(url, { element: video });

      const handleCanPlayThrough = () => {
        console.log(`[VideoSynchronization] Video can play through: ${url}`);
        updateVideoState(url, { 
          canPlay: true, 
          isLoaded: true, 
          isLoading: false,
          bufferedPercent: 1
        });
        cleanup();
        resolve();
      };

      const handleCanPlay = () => {
        console.log(`[VideoSynchronization] Video can play: ${url}`);
        updateVideoState(url, { canPlay: true });
      };

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const buffered = video.buffered.end(0);
          const duration = video.duration || 1;
          const percent = Math.min(buffered / duration, 1);
          updateVideoState(url, { bufferedPercent: percent });
        }
      };

      const handleError = (e: Event) => {
        const mediaError = (e.target as HTMLVideoElement).error;
        const error = mediaError ? new Error(`Video error: ${mediaError.message || mediaError.code}`) : new Error('Unknown video error');
        console.error(`[VideoSynchronization] Error loading video: ${url}`, mediaError);
        updateVideoState(url, {
          error,
          isLoading: false
        });
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('error', handleError);
      };

      // Add event listeners
      video.addEventListener('canplaythrough', handleCanPlayThrough);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('error', handleError);

      // Set source and start loading
      video.src = url;
      video.load();
    });

    preloadPromisesRef.current[url] = promise;
    return promise;
  }, [updateVideoState]);

  /**
   * Preload all videos simultaneously
   */
  const preloadAllVideos = useCallback(async (): Promise<void> => {
    console.log('[VideoSynchronization] Starting to preload all videos');
    
    try {
      // Start all preloads in parallel
      const preloadPromises = videoUrls.map(url => preloadVideo(url));
      
      // Wait for all videos to be ready
      await Promise.allSettled(preloadPromises);
      
      console.log('[VideoSynchronization] All videos preloaded');
    } catch (error) {
      console.error('[VideoSynchronization] Error preloading videos:', error);
    }
  }, [videoUrls, preloadVideo]);

  /**
   * Get video element for a URL
   */
  const getVideoElement = useCallback((url: string): HTMLVideoElement | null => {
    return videoElementsRef.current[url] || null;
  }, []);

  /**
   * Check if all videos are ready
   */
  const areAllVideosReady = useCallback((): boolean => {
    const allReady = Object.values(videoStates).every(state => state.canPlay);
    console.log('[VideoSynchronization] areAllVideosReady check:', allReady);
    console.log('[VideoSynchronization] Video states:', videoStates);
    return allReady;
  }, [videoStates]);

  /**
   * Get video state for a URL
   */
  const getVideoState = useCallback((url: string): VideoState | undefined => {
    return videoStates[url];
  }, [videoStates]);

  /**
   * Cleanup video elements
   */
  const cleanup = useCallback(() => {
    console.log('[VideoSynchronization] Cleaning up video elements');
    
    Object.entries(videoElementsRef.current).forEach(([url, video]) => {
      if (video) {
        video.pause();
        video.src = '';
        video.load(); // This clears the buffer
        video.remove();
      }
      delete videoElementsRef.current[url];
    });

    Object.keys(preloadPromisesRef.current).forEach(url => {
      delete preloadPromisesRef.current[url];
    });
  }, []);

  // Update synchronization state based on individual video states
  useEffect(() => {
    const states = Object.values(videoStates);
    const allReady = states.every(state => state.canPlay);
    const anyError = states.some(state => state.error !== null);
    const totalBuffered = states.reduce((sum, state) => sum + state.bufferedPercent, 0);
    const avgProgress = states.length > 0 ? totalBuffered / states.length : 0;

    setSyncState({
      allVideosReady: allReady,
      anyVideoError: anyError,
      loadingProgress: avgProgress
    });
  }, [videoStates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    videoStates,
    syncState,
    preloadVideo,
    preloadAllVideos,
    getVideoElement,
    getVideoState,
    areAllVideosReady,
    cleanup,
    updateVideoState
  };
};