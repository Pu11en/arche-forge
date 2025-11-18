# Video Sequence Implementation Plan

## Overview
Implement a two-step video sequence with trademark phrase overlays and CTA button:
1. Intro video plays once
2. Transition to looping bull video with trademark phrase overlays
3. Heading appears after 2 seconds
4. CTA button appears with heading

## Component Architecture

### 1. Data Layer
**File: `src/data/trademark-phrases.ts`**
- Export array of all trademark phrases
- Type definitions for phrase data structure

### 2. Video Sequence Component
**File: `src/components/ui/video-sequence.tsx`**
- Main orchestrator component
- Handles state management for video sequence
- Coordinates timing between intro and looping video
- Manages overlay visibility and transitions

### 3. Trademark Phrase Overlay Component
**File: `src/components/ui/trademark-phrase-overlay.tsx`**
- Rotates through phrases with fade in/out animations
- 1.5 second intervals per phrase
- Low opacity (20-30%) for subtle overlay effect
- Responsive text sizing
- Accessibility support with reduced motion

### 4. Looping Video Component
**File: `src/components/ui/looping-video.tsx`**
- Handles the bull video playback
- Infinite looping functionality
- Cross-browser compatibility
- Mobile responsive

### 5. Heading with CTA Component
**File: `src/components/ui/heading-with-cta.tsx`**
- Main heading text with fade-in animation
- "Enter the Forge You" CTA button
- Coordinated appearance timing (2 seconds after video start)
- Responsive design
- Hover and interaction states

### 6. Updated App Component
**File: `src/App.tsx`**
- Replace current LoadingOverlay + Hero structure
- Implement VideoSequence component
- Handle state transitions between intro and main content

## Technical Specifications

### Timing Sequence
```
0.0s: Intro video starts
0.0s: Intro video plays once
[When intro completes]: Transition to bull video
0.0s: Bull video starts looping
0.0s: Trademark phrase rotation begins (1.5s intervals)
2.0s: Heading fades in
2.0s: CTA button fades in with heading
```

### Phrase Overlay Specifications
- Opacity: 20-30%
- Animation: Fade in/out, 1.5 seconds per phrase
- Position: Top layer overlay
- Font: Consistent with brand typography
- Responsive sizing for mobile/tablet/desktop

### Video Specifications
- Intro video: Current URL from App.tsx
- Bull video: `https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4`
- Loop: Infinite for bull video
- Cross-browser compatibility with fallbacks

### CTA Button Specifications
- Text: "Enter the Forge You"
- Style: Consistent with existing button components
- Animation: Fade-in with heading
- Hover states and accessibility features
- Responsive sizing

## Implementation Approach

### Phase 1: Data and Basic Components
1. Create trademark phrases data file
2. Implement basic TrademarkPhraseOverlay component
3. Create LoopingVideo component
4. Create HeadingWithCTA component

### Phase 2: Integration
1. Create VideoSequence orchestrator component
2. Update App.tsx to use new sequence
3. Implement timing coordination
4. Add responsive design

### Phase 3: Polish and Testing
1. Add accessibility features
2. Cross-browser testing
3. Performance optimization
4. User flow testing

## File Structure
```
src/
├── data/
│   └── trademark-phrases.ts
├── components/
│   └── ui/
│       ├── video-sequence.tsx
│       ├── trademark-phrase-overlay.tsx
│       ├── looping-video.tsx
│       └── heading-with-cta.tsx
└── App.tsx (updated)
```

## Dependencies
- React hooks (useState, useEffect, useRef, useCallback)
- Framer Motion for animations
- Existing utility functions and browser detection
- Tailwind CSS for styling

## Accessibility Considerations
- Reduced motion support via useReducedMotion hook
- ARIA labels for video and interactive elements
- Keyboard navigation support for CTA button
- Screen reader compatibility for phrase overlays
- High contrast support

## Performance Considerations
- Lazy loading for video components
- Efficient animation using CSS transforms
- Optimized re-renders with proper dependency arrays
- Memory cleanup for timers and event listeners
