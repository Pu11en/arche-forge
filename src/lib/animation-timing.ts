/**
 * Global timing constants for sequential loading animation
 * Follows the architecture specifications for precise timing control
 */

// Animation timing constants as specified in the architecture
export const ANIMATION_TIMING = {
  VIDEO_DISSOLVE_DELAY: 0,    // 0s delay before dissolve starts
  VIDEO_DISSOLVE_DURATION: 0, // 0s dissolve animation
  TRANSITION_PAUSE: 500,        // 0.5s gap before hero
  HERO_FADE_DURATION: 3000,     // 3s hero fade-in
  HERO_STAGGER_DELAY: 200,      // 0.2s stagger between elements
  HERO_CONTENT_DELAY: 300       // 0.3s delay before first element
} as const;

/**
 * Get animation configuration based on reduced motion preference
 */
export const getAnimationConfig = (reducedMotion: boolean) => ({
  videoDissolveDuration: reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DURATION,
  heroFadeDuration: reducedMotion ? 0 : ANIMATION_TIMING.HERO_FADE_DURATION,
  transitionPause: reducedMotion ? 0 : ANIMATION_TIMING.TRANSITION_PAUSE,
  delays: {
    dissolveDelay: reducedMotion ? 0 : ANIMATION_TIMING.VIDEO_DISSOLVE_DELAY,
    heroDelay: reducedMotion ? 0 : ANIMATION_TIMING.HERO_CONTENT_DELAY
  }
});

/**
 * Convert timing values to CSS-ready values
 */
export const toCSSDuration = (ms: number): string => `${ms / 1000}s`;

export type AnimationPhase = 'video-playing' | 'video-completed' | 'video-dissolving' | 'transition-pause' | 'hero-revealing' | 'complete';

export interface AnimationOrchestrationState {
  sequencePhase: AnimationPhase;
  canStartDissolve: boolean;
  canStartHero: boolean;
  dissolveStartTime: number;
  heroStartTime: number;
}

export interface TransitionTimers {
  dissolveDelay?: NodeJS.Timeout;
  dissolveDuration?: NodeJS.Timeout;
  pauseDuration?: NodeJS.Timeout;
  heroDelay?: NodeJS.Timeout;
}