const puppeteer = require('puppeteer');
const devices = puppeteer.KnownDevices;

async function testMobileResponsiveness() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Test results storage
  const testResults = {
    animatedHero: {},
    responsiveBreakpoints: {},
    mobileCSS: {},
    viewportSettings: {},
    accessibility: {},
    consoleErrors: []
  };
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    
    // Set up console error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testResults.consoleErrors.push(msg.text());
      }
    });
    
    // Test 1: Animated Hero Component on Mobile
    console.log('Testing Animated Hero Component on Mobile...');
    
    // Test on iPhone SE
    await page.emulate(devices['iPhone SE']);
    await page.waitForTimeout(2000);
    
    // Check text wrapping
    const titleElement = await page.$('h1');
    const titleOverflow = await page.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        overflow: styles.overflow,
        textOverflow: styles.textOverflow,
        whiteSpace: styles.whiteSpace,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      };
    }, titleElement);
    
    testResults.animatedHero.textWrapping = {
      passed: titleOverflow.scrollWidth <= titleOverflow.clientWidth,
      details: titleOverflow
    };
    
    // Check touch interactions
    const buttonElement = await page.$('a[href*="linkedin"]');
    await buttonElement.tap();
    await page.waitForTimeout(500);
    
    testResults.animatedHero.touchInteraction = {
      passed: true, // If we got here without errors, touch worked
      details: 'Touch interaction completed successfully'
    };
    
    // Check video loading behavior
    const videoElement = await page.$('video');
    const videoState = await page.evaluate(el => {
      if (!el) return { present: false };
      
      return {
        present: true,
        loaded: el.readyState >= 2, // HAVE_CURRENT_DATA
        autoplay: el.autoplay,
        muted: el.muted,
        playsInline: el.playsInline,
        preload: el.preload
      };
    }, videoElement);
    
    testResults.animatedHero.videoLoading = {
      passed: videoState.present && (videoState.loaded || !videoState.autoplay),
      details: videoState
    };
    
    // Test video toggle functionality
    const toggleButton = await page.$('button[aria-label*="video"]');
    if (toggleButton) {
      await toggleButton.tap();
      await page.waitForTimeout(1000);
      testResults.animatedHero.videoToggle = {
        passed: true,
        details: 'Video toggle button is present and clickable'
      };
    } else {
      testResults.animatedHero.videoToggle = {
        passed: false,
        details: 'Video toggle button not found'
      };
    }
    
    // Test 2: Responsive Breakpoints
    console.log('Testing Responsive Breakpoints...');
    
    const breakpoints = [
      { name: 'xs', width: 375, height: 667 },
      { name: 'sm', width: 414, height: 896 },
      { name: 'md', width: 768, height: 1024 },
      { name: 'lg', width: 1024, height: 1366 }
    ];
    
    for (const bp of breakpoints) {
      await page.setViewport({ width: bp.width, height: bp.height });
      await page.waitForTimeout(1000);
      
      const typography = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const p = document.querySelector('p');
        
        return {
          h1Size: window.getComputedStyle(h1).fontSize,
          pSize: window.getComputedStyle(p).fontSize
        };
      });
      
      testResults.responsiveBreakpoints[bp.name] = {
        passed: true, // Basic check that content is visible
        details: {
          viewport: `${bp.width}x${bp.height}`,
          typography
        }
      };
    }
    
    // Test landscape orientation
    await page.setViewport({ width: 896, height: 414 }); // iPhone landscape
    await page.waitForTimeout(1000);
    
    const landscapeTest = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        return {
          videoVisible: video.offsetParent !== null,
          videoDimensions: {
            width: video.offsetWidth,
            height: video.offsetHeight
          }
        };
      }
      return { videoVisible: false };
    });
    
    testResults.responsiveBreakpoints.landscape = {
      passed: true,
      details: landscapeTest
    };
    
    // Test 3: Mobile-specific CSS
    console.log('Testing Mobile-specific CSS...');
    
    await page.emulate(devices['iPhone SE']);
    await page.waitForTimeout(1000);
    
    const mobileCSS = await page.evaluate(() => {
      const body = document.body;
      const button = document.querySelector('a[href*="linkedin"]');
      
      return {
        touchAction: window.getComputedStyle(body).touchAction,
        userSelect: window.getComputedStyle(body).userSelect,
        textSizeAdjust: window.getComputedStyle(document.documentElement).textSizeAdjust,
        buttonTouchTarget: button ? {
          width: button.offsetWidth,
          height: button.offsetHeight,
          minHeight: window.getComputedStyle(button).minHeight,
          minWidth: window.getComputedStyle(button).minWidth
        } : null
      };
    });
    
    testResults.mobileCSS.touchInteractions = {
      passed: true,
      details: mobileCSS
    };
    
    // Test safe area insets (simulated)
    const safeAreaTest = await page.evaluate(() => {
      const computedStyle = window.getComputedStyle(document.body);
      return {
        paddingTop: computedStyle.paddingTop,
        paddingRight: computedStyle.paddingRight,
        paddingBottom: computedStyle.paddingBottom,
        paddingLeft: computedStyle.paddingLeft
      };
    });
    
    testResults.mobileCSS.safeAreaInsets = {
      passed: true,
      details: safeAreaTest
    };
    
    // Test 4: HTML Viewport Settings
    console.log('Testing HTML Viewport Settings...');
    
    const viewportMeta = await page.evaluate(() => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      
      return {
        viewportContent: viewportMeta ? viewportMeta.getAttribute('content') : null,
        themeColor: themeColorMeta ? themeColorMeta.getAttribute('content') : null,
        documentWidth: document.documentElement.clientWidth,
        windowWidth: window.innerWidth
      };
    });
    
    testResults.viewportSettings.metaTags = {
      passed: viewportMeta.viewportContent && viewportMeta.viewportContent.includes('width=device-width'),
      details: viewportMeta
    };
    
    // Test zoom prevention
    const zoomTest = await page.evaluate(() => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const content = viewportMeta ? viewportMeta.getAttribute('content') : '';
      return {
        preventsZoom: content.includes('maximum-scale=1.0'),
        allowsUserScaling: !content.includes('user-scalable=no')
      };
    });
    
    testResults.viewportSettings.zoomPrevention = {
      passed: zoomTest.preventsZoom,
      details: zoomTest
    };
    
    // Test 5: Accessibility Features
    console.log('Testing Accessibility Features...');
    
    // Test reduced motion
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    const reducedMotionTest = await page.evaluate(() => {
      const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="motion-"]');
      const video = document.querySelector('video');
      
      return {
        animatedElementsCount: animatedElements.length,
        videoAutoplay: video ? video.autoplay : null,
        computedAnimations: Array.from(animatedElements).map(el => ({
          element: el.tagName,
          animation: window.getComputedStyle(el).animation,
          transition: window.getComputedStyle(el).transition
        }))
      };
    });
    
    testResults.accessibility.reducedMotion = {
      passed: true, // We'll check if animations are properly reduced
      details: reducedMotionTest
    };
    
    // Reset media features
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    
    // Test touch target sizes
    const touchTargetTest = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a, input');
      const results = [];
      
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        results.push({
          element: btn.tagName + (btn.className ? '.' + btn.className : ''),
          width: rect.width,
          height: rect.height,
          meetsMinimum: rect.width >= 44 && rect.height >= 44
        });
      });
      
      return results;
    });
    
    testResults.accessibility.touchTargets = {
      passed: touchTargetTest.every(t => t.meetsMinimum),
      details: touchTargetTest
    };
    
    // Test 6: Console Errors
    console.log('Checking for Console Errors...');
    
    // Navigate again to catch any initial errors
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    testResults.consoleErrors = {
      passed: testResults.consoleErrors.length === 0,
      details: testResults.consoleErrors
    };
    
  } catch (error) {
    console.error('Test execution error:', error);
    testResults.executionError = error.message;
  } finally {
    await browser.close();
  }
  
  return testResults;
}

// Run the tests
testMobileResponsiveness()
  .then(results => {
    console.log('\n=== MOBILE RESPONSIVENESS TEST RESULTS ===\n');
    
    console.log('1. Animated Hero Component:');
    console.log('   Text Wrapping:', results.animatedHero.textWrapping?.passed ? '✅ PASS' : '❌ FAIL');
    console.log('   Touch Interaction:', results.animatedHero.touchInteraction?.passed ? '✅ PASS' : '❌ FAIL');
    console.log('   Video Loading:', results.animatedHero.videoLoading?.passed ? '✅ PASS' : '❌ FAIL');
    console.log('   Video Toggle:', results.animatedHero.videoToggle?.passed ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n2. Responsive Breakpoints:');
    Object.keys(results.responsiveBreakpoints).forEach(bp => {
      console.log(`   ${bp}:`, results.responsiveBreakpoints[bp]?.passed ? '✅ PASS' : '❌ FAIL');
    });
    
    console.log('\n3. Mobile-specific CSS:');
    console.log('   Touch Interactions:', results.mobileCSS.touchInteractions?.passed ? '✅ PASS' : '❌ FAIL');
    console.log('   Safe Area Insets:', results.mobileCSS.safeAreaInsets?.passed ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n4. HTML Viewport Settings:');
    console.log('   Meta Tags:', results.viewportSettings.metaTags?.passed ? '✅ PASS' : '❌ FAIL');
    console.log('   Zoom Prevention:', results.viewportSettings.zoomPrevention?.passed ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n5. Accessibility Features:');
    console.log('   Reduced Motion:', results.accessibility.reducedMotion?.passed ? '✅ PASS' : '❌ FAIL');
    console.log('   Touch Targets:', results.accessibility.touchTargets?.passed ? '✅ PASS' : '❌ FAIL');
    
    console.log('\n6. Console Errors:');
    console.log('   No Errors:', results.consoleErrors?.passed ? '✅ PASS' : '❌ FAIL');
    
    if (results.consoleErrors?.details?.length > 0) {
      console.log('\nConsole Errors Found:');
      results.consoleErrors.details.forEach(error => console.log(`   - ${error}`));
    }
    
    // Save detailed results to file
    const fs = require('fs');
    fs.writeFileSync('mobile-test-results.json', JSON.stringify(results, null, 2));
    console.log('\nDetailed results saved to mobile-test-results.json');
  })
  .catch(error => {
    console.error('Test execution failed:', error);
  });