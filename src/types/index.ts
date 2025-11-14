/**
 * Type definitions for ArcheForge application
 */

/**
 * Video configuration for different device types
 */
export interface VideoConfig {
  desktop: string;
  mobile: string;
  fallback?: string;
}

/**
 * Video player state
 */
export interface VideoState {
  isLoaded: boolean;
  isPlaying: boolean;
  hasError: boolean;
  canPlay: boolean;
}

/**
 * Device detection result
 */
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasSlowConnection: boolean;
  orientation: "portrait" | "landscape";
}

/**
 * Social media link configuration
 */
export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  ariaLabel: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
}

/**
 * Reduced motion preferences
 */
export interface MotionPreferences {
  reducedMotion: boolean;
  prefersReducedMotion: boolean;
}