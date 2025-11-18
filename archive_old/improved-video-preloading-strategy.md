# Improved Video Preloading Strategy

## Overview

This document outlines a comprehensive strategy for implementing seamless video transitions through simultaneous preloading and precise timing control.

## Core Principles

### 1. Simultaneous Preloading
Both videos must begin loading immediately when the component mounts, regardless of which video is currently visible.

### 2. Continuous Rendering
Both video elements must remain in the DOM throughout the entire sequence, with visibility controlled through opacity rather than conditional rendering.

### 3. Precise Timing Control
Use requestAnimationFrame for smooth, frame-perfect transitions synchronized with the browser's render cycle.

### 4. Buffer Management
Ensure sufficient video buffering before transition to prevent playback stuttering.

## Implementation Architecture

### Component Structure
```
VideoSequence (main orchestrator)
├── VideoPreloader (handles simultaneous loading)
├── TransitionController (manages cross-fade timing)
├── IntroVideoLayer (intro video with opacity control)
├── LoopingVideoLayer (looping video with opacity control)
└── OverlayManager (handles text overlays during transition)
```

## Detailed Implementation Plan

### 1. VideoPreloader Component

```typescript
interface VideoPreloaderProps {
  introVideoUrl: string;
  loopingVideoUrl: string;
  onVideosReady: (introReady: boolean, loopingReady: boolean) => void;
}

export const VideoPreloader: React.FC<VideoPreloaderProps> = ({
  introVideoUrl,
  loopingVideoUrl,
  onVideosReady
}) => {
  const [introState, setIntroState] = useState<VideoLoadState>('loading');
  const [loopingState, setLoopingState] = useState<VideoLoadState>('loading');
  
  // Create hidden video elements for both videos
  useEffect(() => {
    const introVideo = createHiddenVideoElement(introVideoUrl);
    const loopingVideo = createHiddenVideoElement(loopingVideoUrl);
    
    // Start loading both videos simultaneously
    Promise.all([
      preloadVideo(introVideo),
      preloadVideo(loopingVideo)
    ]).then(() => {
      setIntroState('ready');
      setLoopingState('ready');
      onVideosReady(true, true);
    });
    
    return () => {
      introVideo.remove();
      loopingVideo.remove();
    };
  }, [introVideoUrl, loopingVideoUrl]);
  
  return null; // This component doesn't render anything
};
```

### 2. TransitionController Component

```typescript
interface TransitionControllerProps {
  isTransitioning: boolean;
  onTransitionComplete: () => void;
  transitionDuration?: number;
}

export const TransitionController: React.FC<TransitionControllerProps> = ({
  isTransitioning,
  onTransitionComplete,
  transitionDuration = 800
}) => {
  const [introOpacity, setIntroOpacity] = useState(1);
  const [loopingOpacity, setLoopingOpacity] = useState(0);
  
  useEffect(() => {
    if (!isTransitioning) return;
    
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);
      
      // Calculate opacity values for smooth cross-fade
      setIntroOpacity(1 - progress);
      setLoopingOpacity(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onTransitionComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }, [isTransitioning, transitionDuration, onTransitionComplete]);
  
  return { introOpacity, loopingOpacity };
};
```

### 3. Enhanced VideoSequence Component

```typescript
export const VideoSequence = ({
  introVideoUrl,
  loopingVideoUrl,
  onTransitionComplete
}: VideoSequenceProps) => {
  const [sequenceState, setSequenceState] = useState<'intro' | 'transitioning' | 'looping'>('intro');
  const [videosReady, setVideosReady] = useState({ intro: false, looping: false });
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Handle simultaneous video preloading
  const handleVideosReady = useCallback((introReady: boolean, loopingReady: boolean) => {
    setVideosReady({ intro: introReady, looping: loopingReady });
  }, []);
  
  // Handle intro video completion
  const handleIntroComplete = useCallback(() => {
    if (videosReady.looping) {
      // Start transition immediately if looping video is ready
      setIsTransitioning(true);
      setSequenceState('transitioning');
    } else {
      // Wait for looping video but with a timeout fallback
      const checkInterval = setInterval(() => {
        if (videosReady.looping) {
          clearInterval(checkInterval);
          setIsTransitioning(true);
          setSequenceState('transitioning');
        }
      }, 100);
      
      // Fallback timeout after 2 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsTransitioning(true);
        setSequenceState('transitioning');
      }, 2000);
    }
  }, [videosReady.looping]);
  
  // Handle transition completion
  const handleTransitionComplete = useCallback(() => {
    setSequenceState('looping');
    setIsTransitioning(false);
    onTransitionComplete();
  }, [onTransitionComplete]);
  
  // Get opacity values from transition controller
  const { introOpacity, loopingOpacity } = TransitionController({
    isTransitioning,
    onTransitionComplete: handleTransitionComplete
  });
  
  return (
    <div className="fixed inset-0 bg-black">
      {/* Video preloader - doesn't render anything */}
      <VideoPreloader
        introVideoUrl={introVideoUrl}
        loopingVideoUrl={loopingVideoUrl}
        onVideosReady={handleVideosReady}
      />
      
      {/* Intro video layer */}
      <div
        className="absolute inset-0"
        style={{ opacity: introOpacity, transition: 'none' }}
      >
        <IntroVideoLayer
          videoUrl={introVideoUrl}
          isVisible={sequenceState === 'intro' || sequenceState === 'transitioning'}
          onVideoEnded={handleIntroComplete}
        />
      </div>
      
      {/* Looping video layer */}
      <div
        className="absolute inset-0"
        style={{ opacity: loopingOpacity, transition: 'none' }}
      >
        <LoopingVideoLayer
          videoUrl={loopingVideoUrl}
          isVisible={sequenceState === 'transitioning' || sequenceState === 'looping'}
          autoPlay={sequenceState === 'looping'}
        />
      </div>
      
      {/* Text overlays - always visible during transition */}
      {(sequenceState === 'transitioning' || sequenceState === 'looping') && (
        <OverlayManager isVisible={true} />
      )}
    </div>
  );
};
```

### 4. Buffer Management Strategy

```typescript
// Enhanced video preloading with buffer management
const preloadVideoWithBuffer = async (videoElement: HTMLVideoElement, targetBufferSeconds: number = 5) => {
  return new Promise<void>((resolve, reject) => {
    let checkCount = 0;
    const maxChecks = 100; // Prevent infinite checking
    
    const checkBuffer = () => {
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const bufferedSeconds = bufferedEnd - videoElement.currentTime;
        
        if (bufferedSeconds >= targetBufferSeconds || checkCount >= maxChecks) {
          resolve();
          return;
        }
      }
      
      checkCount++;
      setTimeout(checkBuffer, 100);
    };
    
    videoElement.addEventListener('loadeddata', checkBuffer, { once: true });
    videoElement.addEventListener('error', reject, { once: true });
    videoElement.load();
  });
};
```

## Network Condition Adaptation

### 1. Adaptive Buffering
```typescript
const getBufferTarget = (connectionType: string): number => {
  switch (connectionType) {
    case 'slow-3g': return 10; // 10 seconds buffer
    case 'regular-3g': return 7; // 7 seconds buffer
    case 'regular-4g': return 5; // 5 seconds buffer
    case 'fast-4g': return 3; // 3 seconds buffer
    default: return 5; // Default 5 seconds
  }
};
```

### 2. Quality Adjustment
```typescript
const getVideoQuality = (connectionType: string): string => {
  switch (connectionType) {
    case 'slow-3g': return '480p';
    case 'regular-3g': return '720p';
    case 'regular-4g': return '1080p';
    case 'fast-4g': return '1080p';
    default: return '1080p';
  }
};
```

## Performance Monitoring

### 1. Transition Metrics
```typescript
interface TransitionMetrics {
  transitionStartTime: number;
  transitionEndTime: number;
  frameDrops: number;
  bufferUnderruns: number;
  visualGapsDetected: boolean;
}

const monitorTransition = (): TransitionMetrics => {
  // Implementation for tracking transition performance
};
```

### 2. Visual Gap Detection
```typescript
const detectVisualGaps = (): boolean => {
  // Use Intersection Observer to monitor video visibility
  // Track opacity changes to ensure no gaps
  // Monitor background color consistency
};
```

## Testing Strategy

### 1. Automated Tests
- Unit tests for preloading logic
- Integration tests for transition timing
- Performance tests under various network conditions

### 2. Manual Testing
- Visual inspection of transition smoothness
- Testing across different devices and browsers
- Network throttling tests

### 3. Continuous Monitoring
- Real-user performance metrics
- Error tracking for transition failures
- A/B testing of different timing strategies

## Implementation Timeline

1. **Phase 1**: Implement VideoPreloader and TransitionController components
2. **Phase 2**: Refactor VideoSequence to use new architecture
3. **Phase 3**: Add buffer management and network adaptation
4. **Phase 4**: Implement performance monitoring and testing
5. **Phase 5**: Optimize based on real-world usage data

This strategy ensures truly seamless video transitions by addressing all potential points of failure in the current implementation.