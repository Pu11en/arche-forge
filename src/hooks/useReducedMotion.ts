import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion
 * Returns a boolean indicating whether reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes in preference
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to get motion-safe animation props based on user preference
 * Returns appropriate animation props for framer-motion
 */
export function useMotionProps() {
  const prefersReducedMotion = useReducedMotion();

  return {
    // Disable animations when reduced motion is preferred
    initial: prefersReducedMotion ? { opacity: 1 } : undefined,
    animate: prefersReducedMotion ? { opacity: 1 } : undefined,
    transition: prefersReducedMotion ? { duration: 0 } : undefined,
    whileHover: prefersReducedMotion ? {} : undefined,
    whileTap: prefersReducedMotion ? {} : undefined,
    variants: prefersReducedMotion ? {
      visible: { opacity: 1 },
      hidden: { opacity: 0 }
    } : undefined,
  };
}

/**
 * Hook to get CSS class names based on motion preference
 * Returns appropriate class names for conditional styling
 */
export function useMotionClasses() {
  const prefersReducedMotion = useReducedMotion();

  return {
    motionClass: prefersReducedMotion ? 'motion-reduce' : 'motion-safe',
    scrollClass: prefersReducedMotion ? 'scroll-reduce' : '',
    transformClass: prefersReducedMotion ? 'transform-reduce' : '',
  };
}