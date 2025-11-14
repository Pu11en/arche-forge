/**
 * Cross-browser CSS utilities for consistent styling across all browsers
 */

/**
 * Generates CSS properties with vendor prefixes for cross-browser compatibility
 */
export function getPrefixedStyles(styles: Record<string, string>): Record<string, string> {
  const prefixedStyles: Record<string, string> = { ...styles };
  
  // Add vendor prefixes for transform
  if (styles.transform) {
    prefixedStyles.WebkitTransform = styles.transform;
    prefixedStyles.msTransform = styles.transform;
    prefixedStyles.MozTransform = styles.transform;
    prefixedStyles.OTransform = styles.transform;
  }
  
  // Add vendor prefixes for transition
  if (styles.transition) {
    prefixedStyles.WebkitTransition = styles.transition;
    prefixedStyles.msTransition = styles.transition;
    prefixedStyles.MozTransition = styles.transition;
    prefixedStyles.OTransition = styles.transition;
  }
  
  // Add vendor prefixes for animation
  if (styles.animation) {
    prefixedStyles.WebkitAnimation = styles.animation;
    prefixedStyles.msAnimation = styles.animation;
    prefixedStyles.MozAnimation = styles.animation;
    prefixedStyles.OAnimation = styles.animation;
  }
  
  // Add vendor prefixes for backfaceVisibility
  if (styles.backfaceVisibility) {
    prefixedStyles.WebkitBackfaceVisibility = styles.backfaceVisibility;
    prefixedStyles.msBackfaceVisibility = styles.backfaceVisibility;
    prefixedStyles.MozBackfaceVisibility = styles.backfaceVisibility;
    prefixedStyles.OBackfaceVisibility = styles.backfaceVisibility;
  }
  
  // Add vendor prefixes for perspective
  if (styles.perspective) {
    prefixedStyles.WebkitPerspective = styles.perspective;
    prefixedStyles.msPerspective = styles.perspective;
    prefixedStyles.MozPerspective = styles.perspective;
    prefixedStyles.OPerspective = styles.perspective;
  }
  
  // Add vendor prefixes for transformStyle
  if (styles.transformStyle) {
    prefixedStyles.WebkitTransformStyle = styles.transformStyle;
    prefixedStyles.msTransformStyle = styles.transformStyle;
    prefixedStyles.MozTransformStyle = styles.transformStyle;
    prefixedStyles.OTransformStyle = styles.transformStyle;
  }
  
  return prefixedStyles;
}

/**
 * Gets hardware acceleration styles for better performance across browsers
 */
export function getHardwareAccelerationStyles(): Record<string, string> {
  return getPrefixedStyles({
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px'
  });
}

/**
 * Gets responsive video container styles that work across all browsers
 */
export function getResponsiveVideoStyles(): Record<string, string> {
  return {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    ...getHardwareAccelerationStyles()
  };
}

/**
 * Gets responsive container styles for different viewport sizes
 */
export function getResponsiveContainerStyles(): Record<string, string> {
  return {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    ...getHardwareAccelerationStyles()
  };
}

/**
 * Gets loading spinner styles that work consistently across browsers
 */
export function getLoadingSpinnerStyles(): Record<string, string> {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '10',
    ...getHardwareAccelerationStyles()
  };
}

/**
 * Gets button styles with proper touch support for mobile browsers
 */
export function getTouchButtonStyles(): Record<string, string> {
  return {
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    ...getHardwareAccelerationStyles()
  };
}

/**
 * Gets text styles that are consistent across browsers
 */
export function getConsistentTextStyles(): Record<string, string> {
  return {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility'
  };
}

/**
 * Gets overlay styles with proper stacking context
 */
export function getOverlayStyles(zIndex: string): Record<string, string> {
  return {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex,
    ...getHardwareAccelerationStyles()
  };
}

/**
 * Gets video element attributes for cross-browser compatibility
 */
export function getVideoAttributes(): Record<string, string | boolean> {
  return {
    crossOrigin: 'anonymous',
    preload: 'auto',
    playsInline: true,
    'webkit-playsinline': 'true',
    'x-webkit-playsinline': 'true',
    'x-webkit-airplay': 'deny',
    'data-keepplaying': 'true',
    disablePictureInPicture: true
  };
}

/**
 * Gets responsive breakpoints for different screen sizes
 */
export const responsiveBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px'
};

/**
 * Gets media queries for responsive design
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${responsiveBreakpoints.mobile})`,
  tablet: `@media (max-width: ${responsiveBreakpoints.tablet})`,
  desktop: `@media (max-width: ${responsiveBreakpoints.desktop})`,
  wide: `@media (max-width: ${responsiveBreakpoints.wide})`,
  
  mobileOnly: `@media (max-width: ${responsiveBreakpoints.mobile})`,
  tabletOnly: `@media (min-width: ${responsiveBreakpoints.mobile}) and (max-width: ${responsiveBreakpoints.tablet})`,
  desktopOnly: `@media (min-width: ${responsiveBreakpoints.tablet}) and (max-width: ${responsiveBreakpoints.desktop})`,
  wideOnly: `@media (min-width: ${responsiveBreakpoints.desktop})`,
  
  touch: '@media (hover: none) and (pointer: coarse)',
  mouse: '@media (hover: hover) and (pointer: fine)',
  
  highDPI: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx)'
};

/**
 * Gets viewport units that work across browsers
 */
export function getViewportUnits(): {
  vw: string;
  vh: string;
  vmin: string;
  vmax: string;
} {
  return {
    vw: '100vw',
    vh: '100vh',
    vmin: '100vmin',
    vmax: '100vmax'
  };
}

/**
 * Gets safe area insets for mobile devices (notch support)
 */
export function getSafeAreaInsets(): Record<string, string> {
  return {
    paddingTop: 'env(safe-area-inset-top, 0)',
    paddingRight: 'env(safe-area-inset-right, 0)',
    paddingBottom: 'env(safe-area-inset-bottom, 0)',
    paddingLeft: 'env(safe-area-inset-left, 0)'
  };
}

/**
 * Gets flexbox styles with fallbacks for older browsers
 */
export function getFlexboxStyles(
  direction: 'row' | 'column' = 'row',
  justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' = 'center',
  align: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 'center',
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse' = 'nowrap'
): Record<string, string> {
  const styles: Record<string, string> = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap
  };
  
  // Add fallbacks for older browsers
  styles.display = '-webkit-box';
  styles.WebkitBoxOrient = direction === 'column' ? 'vertical' : 'horizontal';
  styles.WebkitBoxDirection = 'normal';
  styles.WebkitBoxPack = justify === 'center' ? 'center' : 
                         justify === 'flex-end' ? 'end' : 
                         justify === 'space-between' ? 'justify' : 'start';
  styles.WebkitBoxAlign = align === 'center' ? 'center' : 
                          align === 'flex-end' ? 'end' : 
                          align === 'stretch' ? 'stretch' : 'start';
  
  // Override with modern flexbox if supported
  if (CSS.supports('display', 'flex')) {
    styles.display = 'flex';
  }
  
  return getPrefixedStyles(styles);
}