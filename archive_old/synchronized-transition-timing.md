# Synchronized Video Transition Timing Implementation

## Overview

This document details the implementation of precise, frame-perfect video transitions using requestAnimationFrame and React state management to ensure seamless cross-fade between video segments.

## Core Timing Strategy

### 1. Frame-Perfect Transitions
Use requestAnimationFrame to synchronize opacity changes with the browser's render cycle, ensuring smooth 60fps transitions without jank.

### 2. Precise Duration Control
Implement exact timing control with millisecond precision to eliminate any visual gaps during the transition.

### 3. Synchronized State Management
Coordinate all transition-related state changes to prevent race conditions and ensure consistent visual behavior.

## Implementation Details

### 1. Transition Timing Controller

```typescript
interface TransitionTimingConfig {
  duration: number;        // Total transition duration in milliseconds
  fadeInDelay: number;    // Delay before fade-in starts
  fadeInDuration: number; // Duration of fade-in animation
  fadeOutDuration: number;// Duration of fade-out animation
}

const DEFAULT_TRANSITION_CONFIG: TransitionTimingConfig = {
  duration: 800,          // 0.8 seconds total
  fadeInDelay: 0,         // Start immediately
  fadeInDuration: 800,    // 0.8 seconds fade-in
  fadeOutDuration: 800    // 0.8 seconds fade-out
};

export const useTransitionTiming = (
  isTransitioning: boolean,
  config: TransitionTimingConfig = DEFAULT_TRANSITION_CONFIG
) => {
  const [introOpacity, setIntroOpacity] = useState(1);
  const [loopingOpacity, setLoopingOpacity] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!isTransitioning) {
      setIntroOpacity(1);
      setLoopingOpacity(0);
      setTransitionProgress(0);
      return;
    }

    const startTransition = () => {
      startTimeRef.current = performance.now();
      
      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;
        
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / config.duration, 1);
        
        // Calculate opacity values for smooth cross-fade
        const introOpacityValue = Math.max(0, 1 - (elapsed / config.fadeOutDuration));
        const loopingOpacityValue = Math.min(1, Math.max(0, (elapsed - config.fadeInDelay) / config.fadeInDuration));
        
        setIntroOpacity(introOpacityValue);
        setLoopingOpacity(loopingOpacityValue);
        setTransitionProgress(progress);
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Use requestIdleCallback for non-blocking start
    if ('requestIdleCallback' in window) {
      requestIdleCallback(startTransition);
    } else {
      setTimeout(startTransition, 0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTransitioning, config]);

  return {
    introOpacity,
    loopingOpacity,
    transitionProgress,
    isComplete: transitionProgress >= 1
  };
};
```

### 2. Video Synchronization Manager

```typescript
export const useVideoSynchronization = (
  introVideoRef: RefObject<HTMLVideoElement>,
  loopingVideoRef: RefObject<HTMLVideoElement>
) => {
  const [videosReady, setVideosReady] = useState({
    intro: false,
    looping: false
  });
  const [syncStatus, setSyncStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Monitor video ready states
  const checkVideoReadyState = useCallback(() => {
    const introReady = introVideoRef.current?.readyState >= 3; // HAVE_FUTURE_DATA
    const loopingReady = loopingVideoRef.current?.readyState >= 3;
    
    setVideosReady({ intro: introReady, looping: loopingReady });
    
    if (introReady && loopingReady) {
      setSyncStatus('ready');
    } else if (introVideoRef.current?.error || loopingVideoRef.current?.error) {
      setSyncStatus('error');
    }
  }, [introVideoRef, loopingVideoRef]);

  // Set up video event listeners
  useEffect(() => {
    const introVideo = introVideoRef.current;
    const loopingVideo = loopingVideoRef.current;
    
    if (!introVideo || !loopingVideo) return;

    const events = ['loadeddata', 'canplay', 'canplaythrough'];
    
    const handleVideoEvent = () => {
      checkVideoReadyState();
    };

    events.forEach(event => {
      introVideo.addEventListener(event, handleVideoEvent);
      loopingVideo.addEventListener(event, handleVideoEvent);
    });

    // Initial check
    checkVideoReadyState();

    return () => {
      events.forEach(event => {
        introVideo.removeEventListener(event, handleVideoEvent);
        loopingVideo.removeEventListener(event, handleVideoEvent);
      });
    };
  }, [checkVideoReadyState]);

  // Synchronize video playback
  const synchronizePlayback = useCallback(() => {
    const introVideo = introVideoRef.current;
    const loopingVideo = loopingVideoRef.current;
    
    if (!introVideo || !loopingVideo) return;

    // Ensure both videos are at the beginning
    introVideo.currentTime = 0;
    loopingVideo.currentTime = 0;
    
    // Pre-wind looping video to ensure smooth start
    if (loopingVideo.paused) {
      loopingVideo.play().then(() => {
        loopingVideo.pause();
      });
    }
  }, [introVideoRef, loopingVideoRef]);

  return {
    videosReady,
    syncStatus,
    synchronizePlayback,
    isReady: syncStatus === 'ready'
  };
};
```

### 3. Enhanced Video Sequence Component

```typescript
export const VideoSequence = ({
  introVideoUrl,
  loopingVideoUrl,
  onTransitionComplete
}: VideoSequenceProps) => {
  const [sequenceState, setSequenceState] = useState<'intro' | 'transitioning' | 'looping'>('intro');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const loopingVideoRef = useRef<HTMLVideoElement>(null);
  
  // Video synchronization
  const { videosReady, syncStatus, synchronizePlayback, isReady } = useVideoSynchronization(
    introVideoRef,
    loopingVideoRef
  );
  
  // Transition timing control
  const { introOpacity, loopingOpacity, transitionProgress, isComplete } = useTransitionTiming(
    isTransitioning
  );
  
  // Handle intro video completion
  const handleIntroComplete = useCallback(() => {
    console.log('[VideoSequence] Intro video completed, starting transition');
    
    // Synchronize videos before transition
    synchronizePlayback();
    
    // Start transition immediately
    setIsTransitioning(true);
    setSequenceState('transitioning');
  }, [synchronizePlayback]);
  
  // Handle transition completion
  useEffect(() => {
    if (isComplete && isTransitioning) {
      console.log('[VideoSequence] Transition complete');
      setIsTransitioning(false);
      setSequenceState('looping');
      onTransitionComplete();
    }
  }, [isComplete, isTransitioning, onTransitionComplete]);
  
  // Preload both videos
  useEffect(() => {
    if (introVideoRef.current && loopingVideoRef.current) {
      // Start loading both videos immediately
      introVideoRef.current.load();
      loopingVideoRef.current.load();
    }
  }, [introVideoUrl, loopingVideoUrl]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Intro Video Layer */}
      <div
        className="absolute inset-0"
        style={{ 
          opacity: introOpacity,
          zIndex: sequenceState === 'intro' ? 10 : 5
        }}
      >
        <video
          ref={introVideoRef}
          className="w-full h-full object-cover"
          src={introVideoUrl}
          muted
          playsInline
          autoPlay
          onEnded={handleIntroComplete}
          onError={(e) => console.error('Intro video error:', e)}
        />
      </div>
      
      {/* Looping Video Layer */}
      <div
        className="absolute inset-0"
        style={{ 
          opacity: loopingOpacity,
          zIndex: sequenceState === 'looping' ? 10 : 5
        }}
      >
        <video
          ref={loopingVideoRef}
          className="w-full h-full object-cover"
          src={loopingVideoUrl}
          muted
          playsInline
          loop
          autoPlay={sequenceState === 'looping'}
          onError={(e) => console.error('Looping video error:', e)}
        />
      </div>
      
      {/* Text Overlays - Always visible during transition */}
      {(sequenceState === 'transitioning' || sequenceState === 'looping') && (
        <div className="absolute inset-0 z-20">
          <TrademarkPhraseOverlay
            isVisible={true}
            phrases={TRADEMARK_PHRASES}
          />
          
          {/* Heading and CTA - Fade in during/after transition */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between p-8 pointer-events-none"
            style={{
              opacity: Math.max(0, Math.min(1, (transitionProgress - 0.5) * 2)),
              transition: 'none'
            }}
          >
            {/* Heading */}
            <div className="text-center max-w-4xl">
              <h1 className="text-white font-medium leading-tight" style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.6)'
              }}>
                Today's AI answers we remember—<br />
                Soul Print makes AI feel less like a tool and more like you.
              </h1>
            </div>
            
            {/* CTA Button */}
            <button
              className="px-8 py-4 bg-transparent text-white font-medium tracking-wider uppercase border-2 border-white pointer-events-auto"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                letterSpacing: '0.1em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)'
              }}
            >
              Enter the Forge You
            </button>
          </div>
        </div>
      )}
      
      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 z-30 bg-black bg-opacity-50 text-white p-2 text-xs">
          <div>State: {sequenceState}</div>
          <div>Transition: {isTransitioning ? 'Yes' : 'No'}</div>
          <div>Progress: {Math.round(transitionProgress * 100)}%</div>
          <div>Intro Opacity: {introOpacity.toFixed(2)}</div>
          <div>Looping Opacity: {loopingOpacity.toFixed(2)}</div>
          <div>Sync Status: {syncStatus}</div>
          <div>Videos Ready: {JSON.stringify(videosReady)}</div>
        </div>
      )}
    </div>
  );
};
```

## Performance Optimizations

### 1. GPU Acceleration
```css
.video-layer {
  will-change: opacity;
  transform: translateZ(0); /* Force GPU acceleration */
  backface-visibility: hidden;
}
```

### 2. Reduced Motion Support
```typescript
const useReducedMotionTransition = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    transitionDuration: prefersReducedMotion ? 0 : 800,
    useAnimation: !prefersReducedMotion
  };
};
```

### 3. Memory Management
```typescript
const cleanupVideoResources = (videoElement: HTMLVideoElement) => {
  videoElement.pause();
  videoElement.src = '';
  videoElement.load();
};
```

## Testing Strategy

### 1. Unit Tests
```typescript
describe('useTransitionTiming', () => {
  it('should update opacity values smoothly during transition', async () => {
    const { result } = renderHook(() => useTransitionTiming(false));
    
    act(() => {
      result.current.startTransition();
    });
    
    // Test opacity values at different points
    await waitFor(() => {
      expect(result.current.introOpacity).toBeLessThan(1);
      expect(result.current.loopingOpacity).toBeGreaterThan(0);
    });
  });
});
```

### 2. Performance Tests
```typescript
const measureTransitionPerformance = async () => {
  const startTime = performance.now();
  const frameCount = [];
  
  const measureFrame = () => {
    frameCount.push(performance.now());
    if (frameCount.length < 60) {
      requestAnimationFrame(measureFrame);
    } else {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (frameCount.length / duration) * 1000;
      
      console.log(`Transition FPS: ${fps.toFixed(2)}`);
    }
  };
  
  requestAnimationFrame(measureFrame);
};
```

### 3. Visual Regression Tests
```typescript
const captureTransitionFrames = async () => {
  const frames = [];
  const captureInterval = setInterval(() => {
    // Capture canvas snapshot
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // ... capture logic
    frames.push(canvas.toDataURL());
  }, 16); // ~60fps
  
  setTimeout(() => {
    clearInterval(captureInterval);
    // Compare frames for visual gaps
  }, 1000);
};
```

## Implementation Checklist

- [ ] Implement useTransitionTiming hook
- [ ] Implement useVideoSynchronization hook
- [ ] Refactor VideoSequence component
- [ ] Add GPU acceleration styles
- [ ] Implement reduced motion support
- [ ] Add performance monitoring
- [ ] Create unit tests
- [ ] Create performance tests
- [ ] Create visual regression tests
- [ ] Test across different network conditions
- [ ] Test on various devices and browsers
- [ ] Optimize based on performance metrics

This implementation ensures truly seamless video transitions with precise timing control and comprehensive testing strategies.