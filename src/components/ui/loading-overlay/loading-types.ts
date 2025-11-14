/**
 * Type definitions for the Loading Overlay component
 */

export interface LoadingOverlayProps {
  /**
   * Whether the loading overlay should be visible
   * @default true
   */
  isVisible?: boolean;
  
  /**
   * Video URL to use for the background
   * @default "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4"
   */
  videoUrl?: string;
  
  /**
   * Alternative video URLs for different formats (WebM, OGG)
   */
  videoUrls?: {
    webm?: string;
    ogg?: string;
  };
  
  /**
   * Fallback background color when video is loading or disabled
   * @default "bg-black"
   */
  fallbackBgColor?: string;
  
  /**
   * Optional callback when video loads successfully
   */
  onVideoLoaded?: () => void;
  
  /**
   * Optional callback when video fails to load
   */
  onVideoError?: (error?: Error) => void;
  
  /**
   * Optional callback when transition completes
   */
  onTransitionComplete?: () => void;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Whether to attempt autoplay with user interaction fallback
   * @default true
   */
  attemptAutoplay?: boolean;
  
  /**
   * Whether to show a play button for browsers that block autoplay
   * @default true
   */
  showPlayButton?: boolean;
  
  /**
   * Custom play button text
   * @default "Play to Continue"
   */
  playButtonText?: string;
}

/**
 * Transition states for the loading overlay
 */
export type TransitionState = 'visible' | 'dissolving' | 'complete';

export interface VideoState {
  isLoaded: boolean;
  hasError: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  loadingProgress: number;
  loadingState: 'idle' | 'loading' | 'buffering' | 'ready' | 'error';
  transitionState: TransitionState;
  needsUserInteraction: boolean;
  autoplayAttempted: boolean;
  supportedFormat: 'mp4' | 'webm' | 'ogg';
  browserInfo?: {
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isEdge: boolean;
    isMobile: boolean;
  };
}