import React, { useState, useEffect } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { Button } from "../button.tsx";

/**
 * Responsive Design and Accessibility Test Component
 * Tests loading overlay behavior across different viewport sizes and accessibility settings
 */
const ResponsiveAccessibilityTest = () => {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runResponsiveTests = async () => {
    setCurrentTest('Responsive Design Tests');
    addTestResult('🚀 Starting responsive design tests...');

    // Test mobile viewport
    addTestResult('📱 Testing mobile viewport (375x667)');
    setViewportSize('mobile');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mobileTest = await testMobileViewport();
    addTestResult(mobileTest);

    // Test tablet viewport
    addTestResult('📱 Testing tablet viewport (768x1024)');
    setViewportSize('tablet');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tabletTest = await testTabletViewport();
    addTestResult(tabletTest);

    // Test desktop viewport
    addTestResult('🖥️ Testing desktop viewport (1920x1080)');
    setViewportSize('desktop');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const desktopTest = await testDesktopViewport();
    addTestResult(desktopTest);

    addTestResult('✅ Responsive design tests completed');
  };

  const runAccessibilityTests = async () => {
    setCurrentTest('Accessibility Tests');
    addTestResult('🚀 Starting accessibility tests...');

    // Test reduced motion
    addTestResult('🎬 Testing reduced motion preference');
    setReducedMotion(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const motionTest = await testReducedMotion();
    addTestResult(motionTest);

    // Test normal motion
    setReducedMotion(false);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test high contrast
    addTestResult('🎨 Testing high contrast mode');
    setHighContrast(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const contrastTest = await testHighContrast();
    addTestResult(contrastTest);

    setHighContrast(false);
    await new Promise(resolve => setTimeout(resolve, 500));

    addTestResult('✅ Accessibility tests completed');
  };

  const testMobileViewport = async (): Promise<string> => {
    const tests = [];
    
    // Check if video scales properly
    const videoScales = await checkElementScaling('video');
    tests.push(`Video scaling: ${videoScales ? '✅' : '❌'}`);
    
    // Check if buttons are touch-friendly
    const buttonsTouchFriendly = await checkTouchTargets();
    tests.push(`Touch targets: ${buttonsTouchFriendly ? '✅' : '❌'}`);
    
    // Check if text is readable
    const textReadable = await checkTextReadability();
    tests.push(`Text readability: ${textReadable ? '✅' : '❌'}`);
    
    // Check if loading spinner is properly sized
    const spinnerSized = await checkSpinnerSize();
    tests.push(`Spinner size: ${spinnerSized ? '✅' : '❌'}`);
    
    return `Mobile viewport results: ${tests.join(', ')}`;
  };

  const testTabletViewport = async (): Promise<string> => {
    const tests = [];
    
    // Check layout adaptation
    const layoutAdapts = await checkLayoutAdaptation();
    tests.push(`Layout adaptation: ${layoutAdapts ? '✅' : '❌'}`);
    
    // Check button sizing
    const buttonsSized = await checkButtonSizing();
    tests.push(`Button sizing: ${buttonsSized ? '✅' : '❌'}`);
    
    return `Tablet viewport results: ${tests.join(', ')}`;
  };

  const testDesktopViewport = async (): Promise<string> => {
    const tests = [];
    
    // Check full-screen coverage
    const fullScreen = await checkFullScreenCoverage();
    tests.push(`Full-screen coverage: ${fullScreen ? '✅' : '❌'}`);
    
    // Check performance optimizations
    const performanceOptimized = await checkPerformanceOptimizations();
    tests.push(`Performance optimized: ${performanceOptimized ? '✅' : '❌'}`);
    
    return `Desktop viewport results: ${tests.join(', ')}`;
  };

  const testReducedMotion = async (): Promise<string> => {
    const tests = [];
    
    // Check if animations are disabled
    const animationsDisabled = await checkAnimationsDisabled();
    tests.push(`Animations disabled: ${animationsDisabled ? '✅' : '❌'}`);
    
    // Check if transitions are instant
    const transitionsInstant = await checkTransitionsInstant();
    tests.push(`Instant transitions: ${transitionsInstant ? '✅' : '❌'}`);
    
    return `Reduced motion results: ${tests.join(', ')}`;
  };

  const testHighContrast = async (): Promise<string> => {
    const tests = [];
    
    // Check contrast ratios
    const contrastAdequate = await checkContrastRatios();
    tests.push(`Contrast adequate: ${contrastAdequate ? '✅' : '❌'}`);
    
    // Check if fallback colors work
    const fallbackColorsWork = await checkFallbackColors();
    tests.push(`Fallback colors: ${fallbackColorsWork ? '✅' : '❌'}`);
    
    return `High contrast results: ${tests.join(', ')}`;
  };

  // Helper functions for testing
  const checkElementScaling = async (selector: string): Promise<boolean> => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Element should cover most of the viewport
    return rect.width >= viewportWidth * 0.9 && rect.height >= viewportHeight * 0.9;
  };

  const checkTouchTargets = async (): Promise<boolean> => {
    const buttons = document.querySelectorAll('button');
    if (buttons.length === 0) return true; // No buttons to test
    
    // Check if buttons meet minimum touch target size (44x44px)
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        return false;
      }
    }
    
    return true;
  };

  const checkTextReadability = async (): Promise<boolean> => {
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    if (textElements.length === 0) return true;
    
    // Check if text is large enough to be readable on mobile
    for (const element of textElements) {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      
      // Minimum font size for mobile readability
      if (fontSize < 14) {
        return false;
      }
    }
    
    return true;
  };

  const checkSpinnerSize = async (): Promise<boolean> => {
    const spinner = document.querySelector('[class*="spinner"], [class*="loading"]') as HTMLElement;
    if (!spinner) return true; // No spinner to test
    
    const rect = spinner.getBoundingClientRect();
    const minSize = viewportSize === 'mobile' ? 32 : 48; // Smaller on mobile
    
    return rect.width >= minSize && rect.height >= minSize;
  };

  const checkLayoutAdaptation = async (): Promise<boolean> => {
    const container = document.querySelector('.motion-div') as HTMLElement;
    if (!container) return true;
    
    const rect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Container should adapt to viewport width
    return rect.width >= viewportWidth * 0.8;
  };

  const checkButtonSizing = async (): Promise<boolean> => {
    const buttons = document.querySelectorAll('button');
    if (buttons.length === 0) return true;
    
    // Buttons should be appropriately sized for tablet
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      const minSize = 40; // Minimum touch target size
      
      if (rect.width < minSize || rect.height < minSize) {
        return false;
      }
    }
    
    return true;
  };

  const checkFullScreenCoverage = async (): Promise<boolean> => {
    const overlay = document.querySelector('.motion-div') as HTMLElement;
    if (!overlay) return false;
    
    const rect = overlay.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Should cover entire viewport on desktop
    return rect.width >= viewportWidth && rect.height >= viewportHeight;
  };

  const checkPerformanceOptimizations = async (): Promise<boolean> => {
    const video = document.querySelector('video') as HTMLElement;
    if (!video) return false;
    
    const styles = window.getComputedStyle(video);
    
    // Check for hardware acceleration
    const hasTransform = styles.transform !== 'none';
    const hasWillChange = styles.willChange !== 'auto';
    
    return hasTransform || hasWillChange;
  };

  const checkAnimationsDisabled = async (): Promise<boolean> => {
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="motion"]');
    
    // When reduced motion is preferred, animations should be disabled
    for (const element of animatedElements) {
      const styles = window.getComputedStyle(element);
      
      // Check if animation duration is 0 or animation is none
      if (styles.animationDuration !== '0s' && styles.animation !== 'none') {
        return false;
      }
    }
    
    return true;
  };

  const checkTransitionsInstant = async (): Promise<boolean> => {
    const elements = document.querySelectorAll('*');
    
    // Check if transitions are instant when reduced motion is preferred
    for (const element of elements) {
      const styles = window.getComputedStyle(element);
      const transitionDuration = styles.transitionDuration;
      
      if (transitionDuration && transitionDuration !== '0s' && transitionDuration !== '0ms') {
        return false;
      }
    }
    
    return true;
  };

  const checkContrastRatios = async (): Promise<boolean> => {
    // This is a simplified test - in real implementation, you'd use a contrast ratio calculator
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
    
    for (const element of textElements) {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Basic check - ensure colors are defined and not too light
      if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
        return false;
      }
    }
    
    return true;
  };

  const checkFallbackColors = async (): Promise<boolean> => {
    const overlay = document.querySelector('.motion-div') as HTMLElement;
    if (!overlay) return false;
    
    const styles = window.getComputedStyle(overlay);
    
    // Check if background color is defined
    return styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
  };

  // Apply viewport styles
  useEffect(() => {
    const applyViewportStyles = () => {
      const root = document.documentElement;
      
      switch (viewportSize) {
        case 'mobile':
          root.style.width = '375px';
          root.style.height = '667px';
          root.style.fontSize = '14px';
          break;
        case 'tablet':
          root.style.width = '768px';
          root.style.height = '1024px';
          root.style.fontSize = '16px';
          break;
        case 'desktop':
          root.style.width = '1920px';
          root.style.height = '1080px';
          root.style.fontSize = '16px';
          break;
      }
    };
    
    applyViewportStyles();
  }, [viewportSize]);

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement;
    
    if (reducedMotion) {
      root.style.setProperty('--motion-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    }
    
    if (highContrast) {
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--bg-color', '#000000');
    }
  }, [reducedMotion, highContrast]);

  const getViewportClasses = () => {
    const classes = [];
    
    switch (viewportSize) {
      case 'mobile':
        classes.push('max-w-md', 'mx-auto');
        break;
      case 'tablet':
        classes.push('max-w-2xl', 'mx-auto');
        break;
      case 'desktop':
        classes.push('w-full');
        break;
    }
    
    if (reducedMotion) {
      classes.push('motion-reduce');
    }
    
    if (highContrast) {
      classes.push('high-contrast');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${getViewportClasses()}`}>
      {/* Loading Overlay with Test Configuration */}
      <LoadingOverlay
        isVisible={true}
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4"
        videoUrls={{
          webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
          ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
        }}
        fallbackBgColor="bg-black"
        onVideoLoaded={() => addTestResult('✅ Video loaded successfully')}
        onVideoError={(error) => addTestResult(`❌ Video loading failed: ${error?.message}`)}
        onTransitionComplete={() => addTestResult('✅ Transition completed')}
        attemptAutoplay={true}
        showPlayButton={viewportSize === 'mobile'}
        playButtonText="Tap to Continue"
      />

      {/* Test Controls Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Responsive & Accessibility Tests</h3>
        
        <div className="space-y-3">
          {/* Viewport Controls */}
          <div>
            <label className="text-sm font-medium text-gray-700">Viewport Size:</label>
            <div className="flex gap-2 mt-1">
              <Button
                onClick={() => setViewportSize('mobile')}
                variant={viewportSize === 'mobile' ? 'default' : 'outline'}
                size="sm"
              >
                Mobile
              </Button>
              <Button
                onClick={() => setViewportSize('tablet')}
                variant={viewportSize === 'tablet' ? 'default' : 'outline'}
                size="sm"
              >
                Tablet
              </Button>
              <Button
                onClick={() => setViewportSize('desktop')}
                variant={viewportSize === 'desktop' ? 'default' : 'outline'}
                size="sm"
              >
                Desktop
              </Button>
            </div>
          </div>

          {/* Accessibility Controls */}
          <div>
            <label className="text-sm font-medium text-gray-700">Accessibility:</label>
            <div className="space-y-2 mt-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Reduced Motion</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">High Contrast</span>
              </label>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={runResponsiveTests}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Test Responsive
            </Button>
            <Button
              onClick={runAccessibilityTests}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Test A11y
            </Button>
          </div>

          <Button
            onClick={() => setTestResults([])}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Clear Results
          </Button>
        </div>

        {/* Current Test Status */}
        {currentTest && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
            <strong>Current Test:</strong> {currentTest}
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md max-h-64 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-2">Test Results:</h4>
          <div className="text-xs font-mono space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : 'text-gray-600'}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viewport Information */}
      <div className="fixed bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-semibold mb-2">Viewport Info:</h4>
        <div className="text-xs space-y-1">
          <div>Size: {viewportSize}</div>
          <div>Window: {window.innerWidth}x{window.innerHeight}</div>
          <div>Reduced Motion: {reducedMotion ? 'Yes' : 'No'}</div>
          <div>High Contrast: {highContrast ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export { ResponsiveAccessibilityTest };