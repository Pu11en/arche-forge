i# Component Technical Specifications

## 1. Trademark Phrases Data Structure

### File: `src/data/trademark-phrases.ts`

```typescript
export interface TrademarkPhrase {
  id: number;
  text: string;
  hasTrademark: boolean;
}

export const TRADEMARK_PHRASES: TrademarkPhrase[] = [
  { id: 1, text: "Bye-Bye Bitches™", hasTrademark: true },
  { id: 2, text: "YFKI™", hasTrademark: true },
  // ... all 95 phrases
];

export const PHRASE_DISPLAY_DURATION = 1500; // 1.5 seconds
export const PHRASE_OPACITY = 0.25; // 25% opacity
```

## 2. TrademarkPhraseOverlay Component

### File: `src/components/ui/trademark-phrase-overlay.tsx`

```typescript
interface TrademarkPhraseOverlayProps {
  isVisible: boolean;
  phrases: TrademarkPhrase[];
  reducedMotion: boolean;
}

Key Features:
- Rotate through phrases every 1.5 seconds
- Fade in/out animations using Framer Motion
- 20-30% opacity for subtle overlay
- Responsive text sizing
- Reduced motion support
- Accessibility with ARIA live region
```

### Implementation Details:
- Use `useState` for current phrase index
- Use `useEffect` with `setInterval` for rotation
- Framer Motion `AnimatePresence` for fade transitions
- Position: absolute, top: 20%, center horizontally
- Z-index: 10 (above video, below UI elements)

## 3. LoopingVideo Component

### File: `src/components/ui/looping-video.tsx`

```typescript
interface LoopingVideoProps {
  videoUrl: string;
  isVisible: boolean;
  onVideoReady?: () => void;
  className?: string;
}

Key Features:
- Infinite loop functionality
- Cross-browser compatibility
- Mobile responsive
- Fallback background color
- Error handling
- Accessibility features
```

### Implementation Details:
- HTML5 video element with `loop={true}`
- Auto-play with muted attribute
- Preload="auto" for smooth playback
- Object-fit: cover for full screen
- Fallback to black background

## 4. HeadingWithCTA Component

### File: `src/components/ui/heading-with-cta.tsx`

```typescript
interface HeadingWithCTAProps {
  isVisible: boolean;
  onCTAClick: () => void;
  reducedMotion: boolean;
}

Key Features:
- Fade-in animation after 2 seconds
- Responsive typography
- Accessible CTA button
- Hover and focus states
- Keyboard navigation
```

### Implementation Details:
- Heading text: "Today's AI answers we remember—Soul Print makes AI feel less like a tool and more like you."
- CTA text: "Enter the Forge You"
- Position: bottom 30% of screen
- Center alignment
- Framer Motion for fade-in

## 5. VideoSequence Component

### File: `src/components/ui/video-sequence.tsx`

```typescript
interface VideoSequenceProps {
  introVideoUrl: string;
  loopingVideoUrl: string;
  onTransitionComplete: () => void;
}

Key Features:
- Orchestrates entire sequence
- Manages state transitions
- Coordinates timing
- Handles errors gracefully
- Responsive design
```

### State Management:
```typescript
type SequenceState = 'intro' | 'transitioning' | 'looping' | 'complete';

interface VideoSequenceState {
  sequenceState: SequenceState;
  showPhrases: boolean;
  showHeadingCTA: boolean;
  currentPhraseIndex: number;
  videoError: boolean;
}
```

## 6. Updated App Component

### File: `src/App.tsx`

```typescript
function App() {
  const [showVideoSequence, setShowVideoSequence] = useState(true);
  
  const handleVideoSequenceComplete = () => {
    setShowVideoSequence(false);
  };

  return (
    <div className="App relative">
      {showVideoSequence ? (
        <VideoSequence
          introVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
          loopingVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
          onTransitionComplete={handleVideoSequenceComplete}
        />
      ) : (
        <Hero />
      )}
    </div>
  );
}
```

## Responsive Design Specifications

### Mobile (< 768px)
- Phrase font size: 16px
- Heading font size: 24px
- CTA font size: 14px
- CTA padding: 12px 24px
- Phrase margin: 20px

### Tablet (768px - 1024px)
- Phrase font size: 18px
- Heading font size: 32px
- CTA font size: 16px
- CTA padding: 14px 28px
- Phrase margin: 30px

### Desktop (> 1024px)
- Phrase font size: 20px
- Heading font size: 40px
- CTA font size: 18px
- CTA padding: 16px 32px
- Phrase margin: 40px

## Accessibility Specifications

### ARIA Labels
- Video: `aria-label="Background video"`
- Phrase overlay: `aria-live="polite" aria-atomic="true"`
- CTA button: `aria-label="Enter the Forge You"`

### Keyboard Navigation
- Tab order: Video → Phrases → Heading → CTA
- Enter/Space for CTA activation
- Escape to skip intro (optional)

### Reduced Motion
- Respect `prefers-reduced-motion`
- Replace animations with immediate transitions
- Maintain functionality without motion

## Performance Optimizations

### Video Loading
- Preload critical videos
- Lazy load non-critical content
- Optimize video formats per browser

### Animation Performance
- Use CSS transforms for smooth animations
- GPU acceleration with `will-change`
- Efficient re-render patterns

### Memory Management
- Cleanup intervals and timeouts
- Proper event listener removal
- Component unmount cleanup

## Error Handling

### Video Errors
- Fallback to static background
- User notification for connection issues
- Retry mechanisms for failed loads

### Component Errors
- Error boundaries for graceful degradation
- Logging for debugging
- User-friendly error messages