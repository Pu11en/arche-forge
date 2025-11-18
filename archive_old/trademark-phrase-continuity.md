# Trademark Phrase Overlay Continuity During Video Transitions

## Overview

This document outlines the strategy for maintaining uninterrupted trademark phrase rotation during the video transition, ensuring a seamless user experience without visual disruption to the text overlays.

## Current Implementation Analysis

### Existing Phrase Rotation Logic
From `trademark-phrase-overlay.tsx`:
- Phrases rotate every 2000ms (PHRASE_DISPLAY_DURATION)
- Uses AnimatePresence with fade animations
- Phrases have 75% opacity with enhanced text shadows

### Potential Issues During Transition
1. **Timing Reset**: Phrase rotation might reset when transition begins
2. **Z-index Conflicts**: Text layers might get hidden behind video layers
3. **Animation Interruption**: Ongoing phrase animations could be interrupted
4. **Visibility Gaps**: Text might disappear momentarily during layer changes

## Continuity Strategy

### 1. Persistent Phrase State
Maintain phrase rotation state independently of video transition state.

```typescript
interface PhraseState {
  currentIndex: number;
  isTransitioning: boolean;
  lastRotationTime: number;
  rotationInterval: number;
}

export const usePhraseContinuity = () => {
  const [phraseState, setPhraseState] = useState<PhraseState>({
    currentIndex: 0,
    isTransitioning: false,
    lastRotationTime: Date.now(),
    rotationInterval: PHRASE_DISPLAY_DURATION
  });
  
  // Continuous rotation regardless of video state
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseState(prev => ({
        ...prev,
        currentIndex: (prev.currentIndex + 1) % TRADEMARK_PHRASES.length,
        lastRotationTime: Date.now()
      }));
    }, phraseState.rotationInterval);
    
    return () => clearInterval(interval);
  }, [phraseState.rotationInterval]);
  
  return phraseState;
};
```

### 2. Enhanced TrademarkPhraseOverlay Component

```typescript
export const TrademarkPhraseOverlay = ({
  isVisible,
  phrases,
  className = "",
  preserveStateDuringTransition = true
}: TrademarkPhraseOverlayProps & {
  preserveStateDuringTransition?: boolean;
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [rotationStartTime, setRotationStartTime] = useState(Date.now());
  const reducedMotion = useReducedMotion();
  const rotationIntervalRef = useRef<NodeJS.Timeout>();

  // Continuous phrase rotation
  useEffect(() => {
    if (!isVisible || phrases.length === 0) return;

    const startRotation = () => {
      setRotationStartTime(Date.now());
      rotationIntervalRef.current = setInterval(() => {
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        setRotationStartTime(Date.now());
      }, PHRASE_DISPLAY_DURATION);
    };

    // Start rotation immediately
    startRotation();

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [isVisible, phrases.length]);

  // Get current phrase
  const currentPhrase = phrases[currentPhraseIndex] || phrases[0];

  // Calculate remaining time for current phrase
  const getRemainingTime = () => {
    const elapsed = Date.now() - rotationStartTime;
    return Math.max(0, PHRASE_DISPLAY_DURATION - elapsed);
  };

  // Enhanced animation variants with continuity
  const phraseVariants = {
    hidden: { 
      opacity: 0,
      scale: reducedMotion ? 1 : 0.95,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: PHRASE_OPACITY,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: reducedMotion ? 0 : 0.3,
        ease: "easeInOut",
        opacity: { duration: reducedMotion ? 0 : 0.4 },
        filter: { duration: reducedMotion ? 0 : 0.3 }
      }
    },
    exit: { 
      opacity: 0,
      scale: reducedMotion ? 1 : 1.05,
      filter: 'blur(4px)',
      transition: {
        duration: reducedMotion ? 0 : 0.2,
        ease: "easeInOut"
      }
    }
  };

  if (!isVisible || !currentPhrase) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center pointer-events-none ${className}`}
      style={{ 
        zIndex: 100, // Ensure high z-index during transition
        isolation: 'isolate' // Create new stacking context
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait" custom={currentPhraseIndex}>
        <motion.div
          key={preserveStateDuringTransition ? `phrase-${currentPhraseIndex}` : currentPhraseIndex}
          variants={phraseVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-center max-w-4xl mx-auto px-4 w-full flex items-center justify-center"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            willChange: 'opacity, transform, filter', // Optimize for animations
            backfaceVisibility: 'hidden' // Prevent flicker
          }}
        >
          <p
            className="text-white font-medium tracking-wide w-full"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.4,
              fontWeight: '600',
              letterSpacing: '0.06em',
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              // Enhanced contrast for visibility during transition
              filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.8))',
              // Ensure text remains sharp during opacity changes
              transform: 'translateZ(0)' // Force GPU acceleration
            }}
          >
            {currentPhrase.text}
          </p>
        </motion.div>
      </AnimatePresence>
      
      {/* Debug overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 text-xs rounded">
          <div>Phrase: {currentPhraseIndex + 1}/{phrases.length}</div>
          <div>Remaining: {Math.round(getRemainingTime() / 1000)}s</div>
          <div>Text: "{currentPhrase.text.substring(0, 20)}..."</div>
        </div>
      )}
    </div>
  );
};
```

### 3. Video Sequence Integration

```typescript
// In VideoSequence component
export const VideoSequence = ({
  introVideoUrl,
  loopingVideoUrl,
  onTransitionComplete
}: VideoSequenceProps) => {
  // ... other state
  
  // Phrase overlay state - independent of video state
  const [showPhrases, setShowPhrases] = useState(true);
  
  // Show phrases immediately when intro starts
  useEffect(() => {
    setShowPhrases(true);
  }, []);
  
  // Never hide phrases during transition
  // Phrases remain visible throughout the entire sequence
  
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Video layers as before */}
      
      {/* Phrase overlay - always visible once started */}
      {showPhrases && (
        <div className="absolute inset-0 z-100">
          <TrademarkPhraseOverlay
            isVisible={true}
            phrases={TRADEMARK_PHRASES}
            preserveStateDuringTransition={true}
          />
        </div>
      )}
      
      {/* Other overlays */}
    </div>
  );
};
```

### 4. Z-index Management Strategy

```typescript
// Define consistent z-index layers
export const Z_INDEX_LAYERS = {
  background: 1,
  introVideo: 5,
  loopingVideo: 10,
  phraseOverlay: 100, // Highest priority
  headingOverlay: 90,
  ctaOverlay: 95,
  debugOverlay: 1000
} as const;

// Apply consistent layering
const LayeredContainer = () => (
  <div className="relative w-full h-full">
    {/* Background */}
    <div style={{ zIndex: Z_INDEX_LAYERS.background }} />
    
    {/* Videos */}
    <div style={{ zIndex: Z_INDEX_LAYERS.introVideo }} />
    <div style={{ zIndex: Z_INDEX_LAYERS.loopingVideo }} />
    
    {/* Text overlays - always on top */}
    <div style={{ zIndex: Z_INDEX_LAYERS.phraseOverlay }} />
    <div style={{ zIndex: Z_INDEX_LAYERS.headingOverlay }} />
    <div style={{ zIndex: Z_INDEX_LAYERS.ctaOverlay }} />
  </div>
);
```

### 5. Performance Optimization

```typescript
// Optimize text rendering during transitions
const useOptimizedTextRendering = () => {
  const [isOptimized, setIsOptimized] = useState(false);
  
  useEffect(() => {
    // Optimize text rendering during transitions
    const optimizeText = () => {
      // Force GPU acceleration for text elements
      const textElements = document.querySelectorAll('[data-phrase-text]');
      textElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'opacity, transform';
        (el as HTMLElement).style.transform = 'translateZ(0)';
      });
      setIsOptimized(true);
    };
    
    // Optimize immediately and after any DOM changes
    optimizeText();
    
    return () => {
      // Clean up optimization
      const textElements = document.querySelectorAll('[data-phrase-text]');
      textElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'auto';
      });
    };
  }, []);
  
  return isOptimized;
};
```

### 6. Testing Strategy

```typescript
// Test phrase continuity during transition
const testPhraseContinuity = async () => {
  const phraseElements = document.querySelectorAll('[data-phrase-text]');
  const visibilityLog = [];
  
  // Monitor phrase visibility during transition
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      visibilityLog.push({
        timestamp: performance.now(),
        visible: entry.isIntersecting,
        opacity: window.getComputedStyle(entry.target).opacity
      });
    });
  });
  
  phraseElements.forEach(el => observer.observe(el));
  
  // Start transition
  // ... trigger transition
  
  // Wait for transition to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Analyze visibility log for gaps
  const gaps = visibilityLog.filter(log => log.visible && parseFloat(log.opacity) < 0.1);
  
  return {
    hasGaps: gaps.length > 0,
    gapCount: gaps.length,
    visibilityLog
  };
};
```

### 7. Visual Regression Testing

```typescript
// Capture phrase overlay during transition
const capturePhraseOverlayFrames = async () => {
  const frames = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Focus on phrase overlay area
  const phraseOverlay = document.querySelector('[data-phrase-overlay]');
  const rect = phraseOverlay?.getBoundingClientRect();
  
  if (rect && ctx) {
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const captureFrame = () => {
      // Capture only the phrase overlay area
      ctx.drawImage(
        document.documentElement,
        rect.left, rect.top, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );
      
      frames.push(canvas.toDataURL());
    };
    
    // Capture frames during transition
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      captureFrame();
    }
  }
  
  return frames;
};
```

## Implementation Checklist

- [ ] Implement usePhraseContinuity hook
- [ ] Enhance TrademarkPhraseOverlay with state preservation
- [ ] Implement consistent z-index management
- [ ] Add GPU acceleration optimizations
- [ ] Create phrase continuity tests
- [ ] Implement visual regression testing
- [ ] Add performance monitoring
- [ ] Test across different browsers
- [ ] Verify accessibility during transition
- [ ] Optimize for reduced motion preferences

## Expected Outcomes

1. **Uninterrupted Phrase Rotation**: Phrases continue rotating smoothly during video transition
2. **Consistent Visibility**: Text remains visible with proper contrast throughout transition
3. **No Animation Jank**: Smooth animations without flicker or stutter
4. **Performance Optimized**: GPU-accelerated rendering for smooth 60fps experience
5. **Accessibility Compliant**: Maintains screen reader compatibility during transition

This strategy ensures that trademark phrases remain a consistent, visible element throughout the entire video sequence, enhancing the professional presentation and user experience.