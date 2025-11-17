import { useState, useCallback, useEffect, useRef } from "react";

interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  hasError: boolean;
  volume: number;
}

interface UseAudioSynchronizationProps {
  audioUrl: string;
  volume?: number;
}

/**
 * Hook for managing hammer.mp3 audio playback with preloading
 * and browser autoplay compliance handling
 */
export const useAudioSynchronization = ({
  audioUrl,
  volume = 0.8
}: UseAudioSynchronizationProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isLoaded: false,
    isPlaying: false,
    hasError: false,
    volume
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userInteractionListenerAdded = useRef(false);

  // Preload audio
  const preloadAudio = useCallback(async () => {
    console.log('[AudioSynchronization] Starting audio preloading');
    
    const audio = new Audio();
    audio.src = audioUrl;
    audio.preload = 'auto';
    audio.volume = volume;
    
    audioRef.current = audio;

    const handleCanPlayThrough = () => {
      console.log('[AudioSynchronization] Audio can play through');
      setAudioState(prev => ({ ...prev, isLoaded: true }));
    };

    const handleLoadStart = () => {
      console.log('[AudioSynchronization] Audio load started');
    };

    const handleLoadedData = () => {
      console.log('[AudioSynchronization] Audio data loaded');
    };

    const handleError = (e: Event) => {
      const mediaError = (e.target as HTMLAudioElement).error;
      console.error('[AudioSynchronization] Audio error:', mediaError);
      setAudioState(prev => ({ 
        ...prev, 
        hasError: true,
        isLoaded: false
      }));
    };

    const handlePlay = () => {
      console.log('[AudioSynchronization] Audio playing');
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      console.log('[AudioSynchronization] Audio paused');
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      console.log('[AudioSynchronization] Audio ended');
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };

    // Add event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    try {
      await audio.load();
    } catch (error) {
      console.error('[AudioSynchronization] Error during audio load:', error);
      setAudioState(prev => ({ 
        ...prev, 
        hasError: true,
        isLoaded: false
      }));
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, volume]);

  // Play audio synchronized with bull video appearance
  const playAudio = useCallback(async () => {
    if (!audioRef.current || !audioState.isLoaded) {
      console.warn('[AudioSynchronization] Cannot play: audio not ready');
      return false;
    }

    try {
      console.log('[AudioSynchronization] Attempting to play audio');
      await audioRef.current.play();
      return true;
    } catch (error) {
      console.warn('[AudioSynchronization] Audio autoplay blocked:', error);
      
      // Handle browser autoplay compliance with user interaction fallback
      if (!userInteractionListenerAdded.current) {
        console.log('[AudioSynchronization] Setting up user interaction fallback');
        
        const enableAudio = async () => {
          if (audioRef.current && audioState.isLoaded) {
            try {
              await audioRef.current.play();
              console.log('[AudioSynchronization] Audio started with user interaction');
              setAudioState(prev => ({ ...prev, isPlaying: true }));
            } catch (fallbackError) {
              console.warn('[AudioSynchronization] Audio still blocked after user interaction:', fallbackError);
            }
          }
        };

        // Add event listeners for user interaction
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
        
        userInteractionListenerAdded.current = true;
      }
      
      return false;
    }
  }, [audioState.isLoaded]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current && audioState.isPlaying) {
      console.log('[AudioSynchronization] Pausing audio');
      audioRef.current.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [audioState.isPlaying]);

  // Set audio volume
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audioRef.current.volume = clampedVolume;
      setAudioState(prev => ({ ...prev, volume: clampedVolume }));
    }
  }, []);

  // Check if audio is ready
  const isAudioReady = useCallback(() => {
    return audioState.isLoaded && !audioState.hasError;
  }, [audioState.isLoaded, audioState.hasError]);

  // Cleanup audio element
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      console.log('[AudioSynchronization] Cleaning up audio element');
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }
    
    // Remove user interaction listeners if they exist
    if (userInteractionListenerAdded.current) {
      // Note: We can't easily remove the once listeners, but they'll clean up themselves
      userInteractionListenerAdded.current = false;
    }
  }, []);

  // Preload audio when hook is used
  useEffect(() => {
    const cleanupFn = preloadAudio();
    
    return () => {
      cleanupFn?.then(cleanup => cleanup?.());
      cleanup();
    };
  }, [preloadAudio, cleanup]);

  return {
    audioState,
    playAudio,
    pauseAudio,
    setVolume,
    isAudioReady,
    cleanup
  };
};