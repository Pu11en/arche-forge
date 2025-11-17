import { useRef, useCallback, useEffect } from "react";

/**
 * Hook for managing precise transition timing using requestAnimationFrame
 * Provides frame-perfect opacity changes to eliminate visual gaps
 */
export const useTransitionTiming = () => {
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  /**
   * Perform a smooth opacity transition using requestAnimationFrame
   * @param duration - Transition duration in milliseconds (default: 800ms)
   * @param onProgress - Callback function called with progress (0-1) and current opacity
   * @param onComplete - Callback function called when transition completes
   * @param easing - Easing function (default: ease-in-out)
   */
  const startTransition = useCallback((
    duration: number = 800,
    onProgress: (progress: number, opacity: number) => void,
    onComplete?: () => void,
    easing: (t: number) => number = easeInOut
  ) => {
    // Cancel any existing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startTimeRef.current = performance.now();
    isAnimatingRef.current = true;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing function
      const easedProgress = easing(progress);
      
      // Call progress callback with current values
      onProgress(easedProgress, easedProgress);

      if (progress < 1 && isAnimatingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        isAnimatingRef.current = false;
        animationFrameRef.current = null;
        if (onComplete) {
          onComplete();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  /**
   * Perform a cross-fade transition between two elements
   * @param duration - Transition duration in milliseconds
   * @param onProgress - Callback with (fadeOutOpacity, fadeInOpacity)
   * @param onComplete - Callback when transition completes
   */
  const startCrossFade = useCallback((
    duration: number = 800,
    onProgress: (fadeOutOpacity: number, fadeInOpacity: number) => void,
    onComplete?: () => void
  ) => {
    console.log('[useTransitionTiming] Starting cross-fade transition, duration:', duration);
    startTransition(
      duration,
      (progress) => {
        // First element fades out from 1 to 0
        const fadeOutOpacity = 1 - progress;
        // Second element fades in from 0 to 1
        const fadeInOpacity = progress;
        console.log('[useTransitionTiming] Cross-fade progress - progress:', progress.toFixed(3), 'fadeOutOpacity:', fadeOutOpacity.toFixed(3), 'fadeInOpacity:', fadeInOpacity.toFixed(3));
        onProgress(fadeOutOpacity, fadeInOpacity);
      },
      () => {
        console.log('[useTransitionTiming] Cross-fade transition complete');
        if (onComplete) {
          onComplete();
        }
      }
    );
  }, [startTransition]);

  /**
   * Cancel any ongoing transition
   */
  const cancelTransition = useCallback(() => {
    isAnimatingRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelTransition();
    };
  }, [cancelTransition]);

  return {
    startTransition,
    startCrossFade,
    cancelTransition,
    isAnimating: () => isAnimatingRef.current
  };
};

/**
 * Default ease-in-out easing function
 * @param t - Normalized time (0-1)
 * @returns Eased value
 */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Linear easing function (no easing)
 * @param t - Normalized time (0-1)
 * @returns Same value
 */
export function linear(t: number): number {
  return t;
}

/**
 * Ease-out cubic easing function
 * @param t - Normalized time (0-1)
 * @returns Eased value
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease-in-out cubic easing function
 * @param t - Normalized time (0-1)
 * @returns Eased value
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}