/**
 * Browser detection utilities for handling cross-browser compatibility
 */

import { logger } from './logger';

export interface BrowserInfo {
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isIE: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  version: string | null;
}

/**
 * Detects the current browser and returns browser information
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor || '';
  
  // Chrome detection
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(vendor);
  
  // Firefox detection
  const isFirefox = /Firefox/.test(userAgent);
  
  // Safari detection (must be checked before Chrome as Chrome also contains Safari)
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(vendor) && !isChrome;
  
  // Edge detection
  const isEdge = /Edg/.test(userAgent);
  
  // IE detection
  const isIE = /MSIE|Trident/.test(userAgent);
  
  // Mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isDesktop = !isMobile;
  
  // Extract version
  let version: string | null = null;
  try {
    if (isChrome) {
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : null;
    } else if (isFirefox) {
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : null;
    } else if (isSafari) {
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : null;
    } else if (isEdge) {
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : null;
    } else if (isIE) {
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
      version = match ? match[1] : null;
    }
  } catch (e) {
    logger.warn('Failed to extract browser version:', e);
  }
  
  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isIE,
    isMobile,
    isDesktop,
    version
  };
}

/**
 * Checks if the browser supports a specific video format
 */
export function supportsVideoFormat(format: 'webm' | 'mp4' | 'ogg'): boolean {
  const video = document.createElement('video');
  
  switch (format) {
    case 'webm':
      return video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
    case 'mp4':
      return video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '';
    case 'ogg':
      return video.canPlayType('video/ogg; codecs="theora, vorbis"') !== '';
    default:
      return false;
  }
}

/**
 * Gets the optimal video format for the current browser
 * For Cloudinary videos, always return 'mp4' for maximum compatibility
 */
export function getOptimalVideoFormat(): 'webm' | 'mp4' | 'ogg' {
  logger.browserDetection('Using MP4 format for Cloudinary videos');
  // Always use MP4 for Cloudinary videos to ensure maximum compatibility
  // MP4 is universally supported and works well with external hosting
  return 'mp4';
}

/**
 * Checks if the browser requires user interaction for video autoplay
 */
export function requiresUserInteractionForAutoplay(): boolean {
  const browser = detectBrowser();
  
  logger.browserDetection('Checking autoplay requirements for:', browser);
  
  // Safari and mobile browsers typically require user interaction
  if (browser.isSafari || browser.isMobile) {
    logger.browserDetection('User interaction required for Safari/Mobile');
    return true;
  }
  
  // Older versions of Chrome might also have restrictions
  if (browser.isChrome && browser.version && parseInt(browser.version) < 66) {
    logger.browserDetection('User interaction required for older Chrome');
    return true;
  }
  
  logger.browserDetection('Autoplay should work without user interaction');
  return false;
}

/**
 * Gets browser-specific CSS vendor prefixes
 */
export function getVendorPrefixes(): {
  transform: string;
  transition: string;
  animation: string;
  keyframes: string;
} {
  const browser = detectBrowser();
  
  // Default prefixes (modern browsers don't need them)
  const prefixes = {
    transform: 'transform',
    transition: 'transition',
    animation: 'animation',
    keyframes: 'keyframes'
  };
  
  // Add prefixes for older browsers if needed
  if (browser.isSafari || (browser.isChrome && browser.version && parseInt(browser.version) < 36)) {
    prefixes.transform = '-webkit-transform';
    prefixes.transition = '-webkit-transition';
    prefixes.animation = '-webkit-animation';
    prefixes.keyframes = '-webkit-keyframes';
  }
  
  if (browser.isFirefox && browser.version && parseInt(browser.version) < 16) {
    prefixes.transform = '-moz-transform';
    prefixes.transition = '-moz-transition';
    prefixes.animation = '-moz-animation';
    prefixes.keyframes = '-moz-keyframes';
  }
  
  if (browser.isEdge && browser.version && parseInt(browser.version) < 16) {
    prefixes.transform = '-ms-transform';
    prefixes.transition = '-ms-transition';
    prefixes.animation = '-ms-animation';
    prefixes.keyframes = '-ms-keyframes';
  }
  
  return prefixes;
}

/**
 * Checks if the browser supports passive event listeners
 */
export function supportsPassiveEvents(): boolean {
  let supportsPassive = false;
  
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {
        supportsPassive = true;
        return true;
      }
    });
    
    window.addEventListener('test', () => {}, opts);
    window.removeEventListener('test', () => {}, opts);
  } catch (e) {
    // Ignore errors
  }
  
  return supportsPassive;
}

/**
 * Gets the appropriate event listener options for the current browser
 */
export function getEventListenerOptions(passive = false): AddEventListenerOptions | boolean {
  if (supportsPassiveEvents()) {
    return { passive, capture: false };
  }
  
  // Fallback for older browsers
  return false;
}

/**
 * Checks if the browser supports CSS Grid
 */
export function supportsCSSGrid(): boolean {
  return CSS.supports('display', 'grid');
}

/**
 * Checks if the browser supports CSS Flexbox
 */
export function supportsCSSFlexbox(): boolean {
  return CSS.supports('display', 'flex');
}

/**
 * Gets the appropriate z-index value to ensure proper stacking context
 */
export function getSafeZIndex(): string {
  const browser = detectBrowser();
  
  // Some older browsers have issues with very high z-index values
  if (browser.isIE || (browser.isEdge && browser.version && parseInt(browser.version) < 16)) {
    return '9999';
  }
  
  // Modern browsers can handle higher values
  return '999999';
}

/**
 * Checks if the current context is secure (HTTPS or localhost)
 * Localhost is considered secure for development purposes
 */
export function isSecureContext(): boolean {
  // Check if window.isSecureContext is available (modern browsers)
  if (typeof window !== 'undefined' && 'isSecureContext' in window) {
    const isSecure = (window as any).isSecureContext;
    logger.browserDetection('isSecureContext (native):', isSecure);
    return isSecure;
  }
  
  // Fallback for older browsers
  if (typeof window !== 'undefined' && (window as any).location) {
    const protocol = (window as any).location.protocol;
    const hostname = (window as any).location.hostname;
    
    // HTTPS is always secure
    if (protocol === 'https:') {
      logger.browserDetection('HTTPS protocol detected, context is secure');
      return true;
    }
    
    // HTTP on localhost is considered secure for development
    if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.'))) {
      logger.browserDetection('Localhost detected, treating as secure context');
      return true;
    }
    
    logger.browserDetection('Non-secure context detected:', protocol, hostname);
    return false;
  }
  
  // Default to false for SSR or unknown environments
  logger.browserDetection('Unable to determine context security, defaulting to false');
  return false;
}

/**
 * Enhanced autoplay requirement check that considers secure context
 */
export function requiresUserInteractionForAutoplayEnhanced(): boolean {
  const browser = detectBrowser();
  const isSecure = isSecureContext();
  
  logger.browserDetection('Enhanced autoplay check:', { browser, isSecure });
  
  // In non-secure contexts, autoplay is almost always blocked
  if (!isSecure) {
    logger.browserDetection('Non-secure context, user interaction required');
    return true;
  }
  
  // Safari and mobile browsers typically require user interaction even in secure contexts
  if (browser.isSafari || browser.isMobile) {
    logger.browserDetection('User interaction required for Safari/Mobile even in secure context');
    return true;
  }
  
  // Older versions of Chrome might also have restrictions
  if (browser.isChrome && browser.version && parseInt(browser.version) < 66) {
    logger.browserDetection('User interaction required for older Chrome');
    return true;
  }
  
  logger.browserDetection('Autoplay should work without user interaction in secure context');
  return false;
}