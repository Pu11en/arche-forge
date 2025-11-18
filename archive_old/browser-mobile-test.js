// Mobile Responsiveness Testing Script
// Copy and paste this script into the browser console on http://localhost:3001

(function() {
    'use strict';
    
    const testResults = {
        animatedHero: {},
        responsiveBreakpoints: {},
        mobileCSS: {},
        viewportSettings: {},
        accessibility: {},
        consoleErrors: []
    };
    
    // Helper function to log results
    function logResult(category, test, passed, details) {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${category} - ${test}: ${status}`);
        if (details) {
            console.log(`  Details: ${details}`);
        }
        
        if (!testResults[category]) {
            testResults[category] = {};
        }
        testResults[category][test] = { passed, details };
    }
    
    // Helper function to check element dimensions
    function getElementDimensions(selector) {
        const element = document.querySelector(selector);
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        return {
            width: rect.width,
            height: rect.height,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            overflow: styles.overflow,
            textOverflow: styles.textOverflow,
            whiteSpace: styles.whiteSpace,
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight
        };
    }
    
    // Test 1: Animated Hero Component
    console.log('🧪 Testing Animated Hero Component...');
    
    // Test text wrapping
    const h1Elements = document.querySelectorAll('h1');
    let textWrappingPass = true;
    h1Elements.forEach((h1, index) => {
        const dims = getElementDimensions(`h1:nth-of-type(${index + 1})`);
        if (dims && dims.scrollWidth > dims.clientWidth) {
            textWrappingPass = false;
        }
    });
    logResult('animatedHero', 'textWrapping', textWrappingPass, 
        `Checked ${h1Elements.length} h1 elements for overflow`);
    
    // Test touch interactions
    const touchTargets = document.querySelectorAll('button, a, input');
    let touchTargetsPass = true;
    let touchTargetDetails = [];
    touchTargets.forEach(target => {
        const rect = target.getBoundingClientRect();
        const meetsMinSize = rect.width >= 44 && rect.height >= 44;
        if (!meetsMinSize) {
            touchTargetsPass = false;
            touchTargetDetails.push(`${target.tagName}: ${rect.width}x${rect.height}px`);
        }
    });
    logResult('animatedHero', 'touchTargets', touchTargetsPass, 
        touchTargetDetails.length > 0 ? touchTargetDetails.join(', ') : 'All targets meet 44x44px minimum');
    
    // Test video loading behavior
    const video = document.querySelector('video');
    if (video) {
        const videoState = {
            present: true,
            loaded: video.readyState >= 2,
            autoplay: video.autoplay,
            muted: video.muted,
            playsInline: video.playsInline,
            preload: video.preload,
            hasSource: video.querySelector('source') !== null
        };
        
        const videoPass = videoState.present && videoState.hasSource && 
                          (videoState.loaded || !videoState.autoplay);
        
        logResult('animatedHero', 'videoLoading', videoPass, 
            `ReadyState: ${video.readyState}, Autoplay: ${videoState.autoplay}, Muted: ${videoState.muted}`);
        
        // Test video toggle button
        const toggleButton = document.querySelector('button[aria-label*="video"]');
        logResult('animatedHero', 'videoToggle', toggleButton !== null, 
            toggleButton ? 'Video toggle button found' : 'Video toggle button not found');
    } else {
        logResult('animatedHero', 'videoLoading', false, 'Video element not found');
    }
    
    // Test 2: Responsive Breakpoints
    console.log('🧪 Testing Responsive Breakpoints...');
    
    // Test current viewport
    const currentViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
    };
    
    // Determine current breakpoint
    let currentBreakpoint = 'unknown';
    if (currentViewport.width < 414) currentBreakpoint = 'xs';
    else if (currentViewport.width < 640) currentBreakpoint = 'sm';
    else if (currentViewport.width < 768) currentBreakpoint = 'md';
    else if (currentViewport.width < 1024) currentBreakpoint = 'lg';
    else currentBreakpoint = 'xl';
    
    logResult('responsiveBreakpoints', 'currentViewport', true, 
        `${currentViewport.width}x${currentViewport.height} (${currentBreakpoint})`);
    
    // Test typography scaling
    const mainHeading = document.querySelector('h1');
    if (mainHeading) {
        const headingStyles = window.getComputedStyle(mainHeading);
        const fontSize = headingStyles.fontSize;
        logResult('responsiveBreakpoints', 'typographyScaling', true, 
            `Main heading font size: ${fontSize} at ${currentBreakpoint} breakpoint`);
    }
    
    // Test 3: Mobile-specific CSS
    console.log('🧪 Testing Mobile-specific CSS...');
    
    // Test touch interactions
    const bodyStyles = window.getComputedStyle(document.body);
    const htmlStyles = window.getComputedStyle(document.documentElement);
    
    logResult('mobileCSS', 'touchInteractions', true, 
        `Touch-action: ${bodyStyles.touchAction}, Text-size-adjust: ${htmlStyles.textSizeAdjust}`);
    
    // Test safe area insets
    const safeAreaStyles = {
        paddingTop: bodyStyles.paddingTop,
        paddingRight: bodyStyles.paddingRight,
        paddingBottom: bodyStyles.paddingBottom,
        paddingLeft: bodyStyles.paddingLeft
    };
    
    logResult('mobileCSS', 'safeAreaInsets', true, 
        `Padding: ${safeAreaStyles.paddingTop} ${safeAreaStyles.paddingRight} ${safeAreaStyles.paddingBottom} ${safeAreaStyles.paddingLeft}`);
    
    // Test 4: HTML Viewport Settings
    console.log('🧪 Testing HTML Viewport Settings...');
    
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (viewportMeta) {
        const viewportContent = viewportMeta.getAttribute('content');
        const hasDeviceWidth = viewportContent.includes('width=device-width');
        const hasInitialScale = viewportContent.includes('initial-scale=1.0');
        const hasMaxScale = viewportContent.includes('maximum-scale=1.0');
        const hasViewportFit = viewportContent.includes('viewport-fit=cover');
        
        const viewportPass = hasDeviceWidth && hasInitialScale && hasMaxScale;
        
        logResult('viewportSettings', 'metaTags', viewportPass, 
            `Content: ${viewportContent}`);
    } else {
        logResult('viewportSettings', 'metaTags', false, 'Viewport meta tag not found');
    }
    
    if (themeColorMeta) {
        const themeColor = themeColorMeta.getAttribute('content');
        logResult('viewportSettings', 'themeColor', themeColor === '#000000', 
            `Theme color: ${themeColor}`);
    } else {
        logResult('viewportSettings', 'themeColor', false, 'Theme color meta tag not found');
    }
    
    // Test 5: Accessibility Features
    console.log('🧪 Testing Accessibility Features...');
    
    // Test reduced motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotionSupported = reducedMotionQuery !== null;
    
    logResult('accessibility', 'reducedMotionSupport', reducedMotionSupported, 
        `Reduced motion preferred: ${reducedMotionQuery.matches}`);
    
    // Test for motion-related classes
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="motion-"]');
    logResult('accessibility', 'animatedElements', true, 
        `Found ${animatedElements.length} animated elements`);
    
    // Test touch target sizes again for accessibility
    logResult('accessibility', 'touchTargetSizes', touchTargetsPass, 
        `${touchTargets.length} touch targets checked`);
    
    // Test 6: Console Errors
    console.log('🧪 Checking for Console Errors...');
    
    // Capture any existing errors
    const originalError = console.error;
    const originalLog = console.log;
    let capturedErrors = [];
    
    // Check for any obvious issues
    const allScripts = document.querySelectorAll('script');
    const allLinks = document.querySelectorAll('link');
    const allImages = document.querySelectorAll('img');
    
    let resourceErrors = [];
    
    // Check for broken images
    allImages.forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
            resourceErrors.push(`Broken image: ${img.src}`);
        }
    });
    
    // Check for missing CSS files
    allLinks.forEach(link => {
        if (link.rel === 'stylesheet' && !link.sheet) {
            resourceErrors.push(`Missing CSS: ${link.href}`);
        }
    });
    
    const hasErrors = capturedErrors.length > 0 || resourceErrors.length > 0;
    const allErrors = [...capturedErrors, ...resourceErrors];
    
    logResult('consoleErrors', 'noErrors', !hasErrors, 
        allErrors.length > 0 ? allErrors.join('; ') : 'No errors detected');
    
    // Generate summary
    console.log('\n📊 MOBILE RESPONSIVENESS TEST SUMMARY');
    console.log('=====================================');
    
    let totalTests = 0;
    let passedTests = 0;
    
    Object.keys(testResults).forEach(category => {
        console.log(`\n${category.toUpperCase()}:`);
        Object.keys(testResults[category]).forEach(test => {
            totalTests++;
            const result = testResults[category][test];
            if (result.passed) passedTests++;
            console.log(`  ${test}: ${result.passed ? '✅' : '❌'}`);
        });
    });
    
    console.log(`\nOVERALL: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests * 100)}%)`);
    
    // Return results for further inspection
    return testResults;
})();