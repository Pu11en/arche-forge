/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      // Custom mobile-first breakpoints
      'xs': '375px',    // iPhone SE and similar small phones
      'sm': '414px',    // iPhone Pro and similar large phones
      'md': '640px',    // Standard tablets and small laptops
      'lg': '768px',    // iPad and similar tablets
      'xl': '1024px',   // Small desktops and large tablets
      '2xl': '1280px',  // Standard desktops
      '3xl': '1536px',  // Large desktops
      
      // Landscape orientation breakpoints for mobile devices
      'landscape-xs': { 'raw': '(min-width: 375px) and (orientation: landscape)' },
      'landscape-sm': { 'raw': '(min-width: 414px) and (orientation: landscape)' },
      'landscape-md': { 'raw': '(min-width: 640px) and (orientation: landscape)' },
    },
    extend: {
      // Mobile-specific spacing values
      spacing: {
        // Tighter spacing for mobile layouts
        'mobile-xs': '0.25rem',   // 4px
        'mobile-sm': '0.5rem',    // 8px
        'mobile-md': '0.75rem',   // 12px
        'mobile-lg': '1rem',      // 16px
        'mobile-xl': '1.25rem',   // 20px
        'mobile-2xl': '1.5rem',   // 24px
        
        // Touch-friendly spacing (minimum 44px for touch targets)
        'touch': '2.75rem',       // 44px
        'touch-lg': '3rem',       // 48px
        'touch-xl': '3.5rem',     // 56px
        
        // Container padding adjustments for mobile
        'container-mobile': '1rem',  // 16px
        'container-tablet': '1.5rem', // 24px
      },
      
      // Typography optimized for mobile readability
      fontSize: {
        // Mobile-optimized font sizes
        'mobile-xs': ['0.75rem', { lineHeight: '1.2' }],      // 12px
        'mobile-sm': ['0.875rem', { lineHeight: '1.25' }],    // 14px
        'mobile-base': ['1rem', { lineHeight: '1.3' }],        // 16px
        'mobile-lg': ['1.125rem', { lineHeight: '1.35' }],     // 18px
        'mobile-xl': ['1.25rem', { lineHeight: '1.4' }],       // 20px
        'mobile-2xl': ['1.5rem', { lineHeight: '1.4' }],      // 24px
        'mobile-3xl': ['1.875rem', { lineHeight: '1.35' }],    // 30px
        'mobile-4xl': ['2.25rem', { lineHeight: '1.3' }],     // 36px
        
        // Display sizes for mobile
        'mobile-display-xs': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'mobile-display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'mobile-display-md': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
      },
      
      // Line heights optimized for mobile
      lineHeight: {
        'mobile-tight': '1.15',
        'mobile-snug': '1.25',
        'mobile-normal': '1.35',
        'mobile-relaxed': '1.5',
        'mobile-loose': '1.65',
      },
      
      // Letter spacing improvements for mobile text
      letterSpacing: {
        'mobile-tighter': '-0.05em',
        'mobile-tight': '-0.025em',
        'mobile-normal': '0em',
        'mobile-wide': '0.025em',
        'mobile-wider': '0.05em',
        'mobile-widest': '0.1em',
      },
      
      // Custom utilities for touch interactions
      touchAction: {
        'none': 'none',
        'auto': 'auto',
        'pan-x': 'pan-x',
        'pan-y': 'pan-y',
        'manipulation': 'manipulation',
      },
      
      // Minimum touch target sizes
      minWidth: {
        'touch': '2.75rem',  // 44px minimum touch target
        'touch-lg': '3rem',  // 48px larger touch target
      },
      
      minHeight: {
        'touch': '2.75rem',  // 44px minimum touch target
        'touch-lg': '3rem',  // 48px larger touch target
      },
      
      // Mobile-first container settings
      maxWidth: {
        'mobile': '100%',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
      },
      
      // Custom shadows for mobile depth
      boxShadow: {
        'mobile-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'mobile': '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'mobile-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mobile-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      
      // Border radius for mobile-friendly interfaces
      borderRadius: {
        'mobile-sm': '0.25rem',
        'mobile': '0.375rem',
        'mobile-md': '0.5rem',
        'mobile-lg': '0.75rem',
        'mobile-xl': '1rem',
        'mobile-full': '9999px',
      },
    },
  },
  plugins: [
    // Plugin for reduced motion utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.motion-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
          },
        },
        '.motion-safe': {
          '@media (prefers-reduced-motion: no-preference)': {
            // Default animations for users who prefer motion
          },
        },
        '.scroll-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            'scroll-behavior': 'auto !important',
          },
        },
        '.transform-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            'transform': 'none !important',
            'transition': 'none !important',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
  // Mobile-first configuration settings
  corePlugins: {
    // Ensure responsive variants are enabled for commonly used utilities
    float: true,
    clear: true,
    display: true,
    position: true,
    overflow: true,
    zIndex: true,
    flexbox: true,
    grid: true,
    spacing: true,
    sizing: true,
    typography: true,
    background: true,
    borders: true,
    effects: true,
    filters: true,
    interactivity: true,
    svg: true,
    transform: true,
    transition: true,
    animation: true,
  },
}