import { useEffect, useRef, useCallback, useState } from 'react';

export interface VideoPerformanceMetrics {
  loadTime: number;
  playTime: number;
  bufferEvents: number;
  errorCount: number;
  autoplayAttempts: number;
  autoplaySuccess: boolean;
  averageFPS: number;
  droppedFrames: number;
  networkSpeed: number;
}

export interface VideoPerformanceMonitoringOptions {
  enableMetrics: boolean;
  sampleRate: number; // Sample every N frames
  enableNetworkMonitoring: boolean;
  enableFPSMonitoring: boolean;
  debugMode: boolean;
}

const DEFAULT_OPTIONS: VideoPerformanceMonitoringOptions = {
  enableMetrics: true,
  sampleRate: 30, // Sample every 30 frames
  enableNetworkMonitoring: true,
  enableFPSMonitoring: true,
  debugMode: process.env.NODE_ENV === 'development'
};

export const useVideoPerformanceMonitoring = (
  videoElement: HTMLVideoElement | null,
  options: Partial<VideoPerformanceMonitoringOptions> = {}
) => {
  const [metrics, setMetrics] = useState<VideoPerformanceMetrics>({
    loadTime: 0,
    playTime: 0,
    bufferEvents: 0,
    errorCount: 0,
    autoplayAttempts: 0,
    autoplaySuccess: false,
    averageFPS: 0,
    droppedFrames: 0,
    networkSpeed: 0
  });

  const config = { ...DEFAULT_OPTIONS, ...options };
  const metricsRef = useRef(metrics);
  const startTimeRef = useRef<number>(0);
  const playStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Update metrics ref when state changes
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Monitor network speed
  const measureNetworkSpeed = useCallback(async (): Promise<number> => {
    if (!config.enableNetworkMonitoring) return 0;

    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        return connection.downlink || 0;
      }

      // Fallback: estimate from video loading time
      const startTime = performance.now();
      const response = await fetch(videoElement?.src || '', { 
        method: 'HEAD',
        cache: 'no-store' 
      });
      const endTime = performance.now();
      
      if (response.ok) {
        const size = parseInt(response.headers.get('content-length') || '0');
        const duration = (endTime - startTime) / 1000;
        return (size * 8) / (duration * 1024 * 1024); // Mbps
      }
    } catch (error) {
      if (config.debugMode) {
        console.warn('Network speed measurement failed:', error);
      }
    }
    
    return 0;
  }, [videoElement, config.enableNetworkMonitoring, config.debugMode]);

  // Monitor FPS
  const monitorFPS = useCallback(() => {
    if (!config.enableFPSMonitoring || !videoElement) return;

    const measureFrame = () => {
      const currentTime = performance.now();
      
      if (lastFrameTimeRef.current > 0) {
        const deltaTime = currentTime - lastFrameTimeRef.current;
        const currentFPS = 1000 / deltaTime;
        
        frameCountRef.current++;
        
        // Update average FPS every sampleRate frames
        if (frameCountRef.current % config.sampleRate === 0) {
          setMetrics(prev => ({
            ...prev,
            averageFPS: Math.round(currentFPS)
          }));
        }
      }
      
      lastFrameTimeRef.current = currentTime;
      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    rafIdRef.current = requestAnimationFrame(measureFrame);
  }, [videoElement, config.enableFPSMonitoring, config.sampleRate]);

  // Start monitoring when video element is available
  useEffect(() => {
    if (!videoElement || !config.enableMetrics) return;

    startTimeRef.current = performance.now();
    
    // Monitor video events
    const handleLoadStart = () => {
      if (config.debugMode) {
        console.log('VideoPerformanceMonitoring: Load started');
      }
      startTimeRef.current = performance.now();
    };

    const handleCanPlay = () => {
      const loadTime = performance.now() - startTimeRef.current;
      if (config.debugMode) {
        console.log(`VideoPerformanceMonitoring: Video ready in ${loadTime.toFixed(2)}ms`);
      }
      
      setMetrics(prev => ({ ...prev, loadTime }));
      measureNetworkSpeed().then(networkSpeed => {
        setMetrics(prev => ({ ...prev, networkSpeed }));
      });
    };

    const handlePlay = () => {
      playStartTimeRef.current = performance.now();
      if (config.debugMode) {
        console.log('VideoPerformanceMonitoring: Playback started');
      }
      
      setMetrics(prev => ({
        ...prev,
        autoplaySuccess: true,
        playTime: performance.now() - playStartTimeRef.current
      }));
      
      // Start FPS monitoring
      monitorFPS();
    };

    const handleWaiting = () => {
      setMetrics(prev => ({
        ...prev,
        bufferEvents: prev.bufferEvents + 1
      }));
      
      if (config.debugMode) {
        console.log('VideoPerformanceMonitoring: Buffering event detected');
      }
    };

    const handleError = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      const errorCode = video.error?.code;
      const errorMessage = video.error?.message;
      
      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
      
      if (config.debugMode) {
        console.error('VideoPerformanceMonitoring: Video error:', { errorCode, errorMessage });
      }
    };

    const handleEnded = () => {
      const totalPlayTime = performance.now() - playStartTimeRef.current;
      setMetrics(prev => ({
        ...prev,
        playTime: totalPlayTime
      }));
      
      if (config.debugMode) {
        console.log(`VideoPerformanceMonitoring: Playback completed in ${totalPlayTime.toFixed(2)}ms`);
      }
      
      // Stop FPS monitoring
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    // Add event listeners
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      // Cleanup
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('ended', handleEnded);
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [videoElement, config, measureNetworkSpeed, monitorFPS, config.debugMode]);

  // Track autoplay attempts
  const trackAutoplayAttempt = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      autoplayAttempts: prev.autoplayAttempts + 1
    }));
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      loadTime: 0,
      playTime: 0,
      bufferEvents: 0,
      errorCount: 0,
      autoplayAttempts: 0,
      autoplaySuccess: false,
      averageFPS: 0,
      droppedFrames: 0,
      networkSpeed: 0
    });
    
    frameCountRef.current = 0;
    lastFrameTimeRef.current = 0;
    startTimeRef.current = performance.now();
    playStartTimeRef.current = 0;
  }, []);

  // Get performance analysis
  const getPerformanceAnalysis = useCallback(() => {
    const analysis = {
      isPerformingWell: true,
      issues: [] as string[],
      recommendations: [] as string[]
    };

    // Analyze load time
    if (metrics.loadTime > 3000) {
      analysis.isPerformingWell = false;
      analysis.issues.push(`Slow load time: ${metrics.loadTime.toFixed(0)}ms`);
      analysis.recommendations.push('Consider preloading video or using lower quality');
    }

    // Analyze buffer events
    if (metrics.bufferEvents > 5) {
      analysis.isPerformingWell = false;
      analysis.issues.push(`Frequent buffering: ${metrics.bufferEvents} events`);
      analysis.recommendations.push('Check network connection or reduce video bitrate');
    }

    // Analyze FPS
    if (metrics.averageFPS > 0 && metrics.averageFPS < 24) {
      analysis.isPerformingWell = false;
      analysis.issues.push(`Low frame rate: ${metrics.averageFPS} FPS`);
      analysis.recommendations.push('Optimize video encoding or reduce resolution');
    }

    // Analyze errors
    if (metrics.errorCount > 0) {
      analysis.isPerformingWell = false;
      analysis.issues.push(`Video errors: ${metrics.errorCount}`);
      analysis.recommendations.push('Check video format compatibility and network stability');
    }

    // Analyze autoplay
    if (metrics.autoplayAttempts > 0 && !metrics.autoplaySuccess) {
      analysis.isPerformingWell = false;
      analysis.issues.push('Autoplay failed');
      analysis.recommendations.push('Ensure muted attribute and secure context for autoplay');
    }

    return analysis;
  }, [metrics]);

  return {
    metrics,
    trackAutoplayAttempt,
    resetMetrics,
    getPerformanceAnalysis
  };
};