import { useState, useEffect, useCallback, useRef } from "react";

interface UseVideoTimingSyncProps {
  introVideoUrl: string;
  onTriggerPoint: () => void;
  fallbackDuration?: number;
}

interface VideoTimingState {
  introDuration: number;
  currentTime: number;
  triggerPoint: number;
  isMonitoring: boolean;
  hasTriggered: boolean;
}

/**
 * Hook that monitors intro video currentTime and triggers bull overlay
 * 1 second before intro ends for seamless transition
 */
export const useVideoTimingSync = ({
  onTriggerPoint,
  fallbackDuration = 8000 // 8 seconds fallback
}: UseVideoTimingSyncProps) => {
  const [timingState, setTimingState] = useState<VideoTimingState>({
    introDuration: 0,
    currentTime: 0,
    triggerPoint: 0,
    isMonitoring: false,
    hasTriggered: false
  });

  const introVideoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate trigger point: introDuration - 1000ms
  useEffect(() => {
    if (timingState.introDuration > 0) {
      const point = Math.max(0, timingState.introDuration - 1000);
      setTimingState(prev => ({ ...prev, triggerPoint: point }));
    }
  }, [timingState.introDuration]);

  // Set up fallback timing mechanism when video duration is unavailable
  useEffect(() => {
    if (timingState.introDuration === 0 && !fallbackTimerRef.current) {
      console.log('[VideoTimingSync] Using fallback timing mechanism');
      
      const fallbackTriggerPoint = fallbackDuration - 1000; // 7 seconds
      
      fallbackTimerRef.current = setTimeout(() => {
        if (!timingState.hasTriggered) {
          console.log('[VideoTimingSync] Fallback trigger point reached');
          onTriggerPoint();
          setTimingState(prev => ({ ...prev, hasTriggered: true }));
        }
      }, fallbackTriggerPoint);
    }

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [timingState.introDuration, fallbackDuration, onTriggerPoint, timingState.hasTriggered]);

  // Monitor intro video currentTime
  const handleTimeUpdate = useCallback((time: number) => {
    setTimingState(prev => ({ ...prev, currentTime: time }));
    
    // Trigger bull overlay 1 second before intro ends
    if (
      time >= timingState.triggerPoint && 
      timingState.triggerPoint > 0 && 
      !timingState.hasTriggered
    ) {
      console.log('[VideoTimingSync] Trigger point reached at time:', time);
      onTriggerPoint();
      setTimingState(prev => ({ ...prev, hasTriggered: true }));
    }
  }, [timingState.triggerPoint, timingState.hasTriggered, onTriggerPoint]);

  // Set up video monitoring
  const startMonitoring = useCallback((videoElement: HTMLVideoElement) => {
    if (!videoElement) return;
    
    console.log('[VideoTimingSync] Starting video monitoring');
    introVideoRef.current = videoElement;
    
    // Get video duration
    const updateDuration = () => {
      if (videoElement.duration && !isNaN(videoElement.duration)) {
        console.log('[VideoTimingSync] Intro duration detected:', videoElement.duration * 1000);
        setTimingState(prev => ({ 
          ...prev, 
          introDuration: videoElement.duration * 1000 // Convert to milliseconds
        }));
        
        // Clear fallback timer if we have real duration
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      }
    };

    // Initial duration check
    updateDuration();
    
    // Set up time update monitoring
    const handleTimeUpdateEvent = () => {
      if (videoElement.currentTime) {
        handleTimeUpdate(videoElement.currentTime * 1000); // Convert to milliseconds
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdateEvent);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    
    // Set up monitoring interval for more precise timing
    monitoringIntervalRef.current = setInterval(() => {
      if (videoElement.currentTime && !timingState.hasTriggered) {
        handleTimeUpdate(videoElement.currentTime * 1000);
      }
    }, 100); // Check every 100ms for precision

    setTimingState(prev => ({ ...prev, isMonitoring: true }));

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdateEvent);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
    };
  }, [handleTimeUpdate, timingState.hasTriggered]);

  // Handle video seeking
  const handleSeeking = useCallback(() => {
    if (!timingState.hasTriggered) {
      console.log('[VideoTimingSync] Video seeking detected, resetting trigger');
      setTimingState(prev => ({ ...prev, hasTriggered: false }));
    }
  }, [timingState.hasTriggered]);

  // Handle video buffering/interruptions
  const handleBuffering = useCallback(() => {
    console.log('[VideoTimingSync] Video buffering detected');
    // Implement buffering logic if needed
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  return {
    timingState,
    startMonitoring,
    handleSeeking,
    handleBuffering
  };
};