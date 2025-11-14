// Landing Page Test Runner
// This script will systematically test the landing page functionality

import puppeteer from 'puppeteer';

async function runTests() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Test results container
  const testResults = {
    coreFunctionality: {},
    errorHandling: {},
    mobileResponsiveness: {},
    accessibility: {},
    performance: {}
  };

  try {
    // Navigate to the landing page
    await page.goto('http://localhost:3000');
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('=== Landing Page Testing Started ===');
    
    // 1. Test Core Functionality
    console.log('\n--- Testing Core Functionality ---');
    
    // Check if video element exists
    const videoElement = await page.$('video');
    testResults.coreFunctionality.videoElementExists = videoElement !== null;
    console.log(`Video element exists: ${testResults.coreFunctionality.videoElementExists}`);
    
    // Check if hero section exists
    const heroSection = await page.$('.relative.z-20');
    testResults.coreFunctionality.heroSectionExists = heroSection !== null;
    console.log(`Hero section exists: ${testResults.coreFunctionality.heroSectionExists}`);
    
    // Check if CTA button exists
    const ctaButton = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (let button of buttons) {
        if (button.textContent.includes('ZTA') || button.getAttribute('aria-label')?.includes('ZTA')) {
          return true;
        }
      }
      return false;
    });
    testResults.coreFunctionality.ctaButtonExists = ctaButton;
    console.log(`CTA button exists: ${testResults.coreFunctionality.ctaButtonExists}`);
    
    // Test video autoplay
    const videoState = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return null;
      return {
        paused: video.paused,
        muted: video.muted,
        readyState: video.readyState,
        currentTime: video.currentTime
      };
    });
    
    if (videoState) {
      testResults.coreFunctionality.videoAutoplay = !videoState.paused;
      testResults.coreFunctionality.videoMuted = videoState.muted;
      console.log(`Video autoplaying: ${testResults.coreFunctionality.videoAutoplay}`);
      console.log(`Video muted: ${testResults.coreFunctionality.videoMuted}`);
    }
    
    // Wait for video to complete (simulate by checking if hero becomes visible)
    await page.waitForTimeout(5000); // Wait 5 seconds
    
    // Check if hero is visible after video
    const heroVisible = await page.evaluate(() => {
      const hero = document.querySelector('.relative.z-20');
      if (!hero) return false;
      const styles = window.getComputedStyle(hero);
      return styles.opacity !== '0' && styles.display !== 'none';
    });
    
    testResults.coreFunctionality.heroVisibleAfterVideo = heroVisible;
    console.log(`Hero visible after video: ${testResults.coreFunctionality.heroVisibleAfterVideo}`);
    
    // 2. Test Error Handling
    console.log('\n--- Testing Error Handling ---');
    
    // Test with invalid video URL
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      // Simulate video error by setting invalid src
      const video = document.querySelector('video');
      if (video) {
        video.src = 'invalid-video-url.mp4';
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Check if error handling works
    const errorHandling = await page.evaluate(() => {
      const video = document.querySelector('video');
      const hero = document.querySelector('.relative.z-20');
      return {
        videoError: video ? video.error !== null : false,
        heroVisible: hero ? window.getComputedStyle(hero).opacity !== '0' : false
      };
    });
    
    testResults.errorHandling.videoErrorHandled = errorHandling.videoError;
    testResults.errorHandling.heroVisibleOnError = errorHandling.heroVisible;
    console.log(`Video error handled: ${testResults.errorHandling.videoErrorHandled}`);
    console.log(`Hero visible on error: ${testResults.errorHandling.heroVisibleOnError}`);
    
    // 3. Test Mobile Responsiveness
    console.log('\n--- Testing Mobile Responsiveness ---');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    const mobileLayout = await page.evaluate(() => {
      const video = document.querySelector('video');
      const hero = document.querySelector('.relative.z-20');
      const cta = document.querySelector('button');
      
      return {
        videoResponsive: video ? video.style.width === '100%' : false,
        heroResponsive: hero ? window.getComputedStyle(hero).display === 'flex' : false,
        ctaAccessible: cta ? {
          width: window.getComputedStyle(cta).width,
          height: window.getComputedStyle(cta).height
        } : null
      };
    });
    
    testResults.mobileResponsiveness.mobileLayoutCorrect = mobileLayout.videoResponsive && mobileLayout.heroResponsive;
    testResults.mobileResponsiveness.ctaTouchTargetSize = mobileLayout.ctaAccessible && 
      (parseInt(mobileLayout.ctaAccessible.width) >= 44 && parseInt(mobileLayout.ctaAccessible.height) >= 44);
    
    console.log(`Mobile layout correct: ${testResults.mobileResponsiveness.mobileLayoutCorrect}`);
    console.log(`CTA touch target size adequate: ${testResults.mobileResponsiveness.ctaTouchTargetSize}`);
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    const tabletLayout = await page.evaluate(() => {
      const hero = document.querySelector('.relative.z-20');
      return hero ? window.getComputedStyle(hero).display === 'flex' : false;
    });
    
    testResults.mobileResponsiveness.tabletLayoutCorrect = tabletLayout;
    console.log(`Tablet layout correct: ${testResults.mobileResponsiveness.tabletLayoutCorrect}`);
    
    // 4. Test Accessibility
    console.log('\n--- Testing Accessibility ---');
    
    // Test reduced motion preference
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    const reducedMotion = await page.evaluate(() => {
      const video = document.querySelector('video');
      const hero = document.querySelector('.relative.z-20');
      
      return {
        animationsDisabled: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        videoTransitionsReduced: video ? video.style.transition.includes('0s') : false,
        heroTransitionsReduced: hero ? hero.style.transition.includes('0s') : false
      };
    });
    
    testResults.accessibility.reducedMotionRespected = reducedMotion.animationsDisabled;
    console.log(`Reduced motion respected: ${testResults.accessibility.reducedMotionRespected}`);
    
    // Test keyboard navigation
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    const keyboardNavigation = await page.evaluate(() => {
      const focusedElement = document.activeElement;
      return {
        hasFocus: focusedElement !== null,
        isFocusable: focusedElement ? focusedElement.tabIndex >= 0 : false,
        hasVisibleFocus: focusedElement ? window.getComputedStyle(focusedElement).outline !== 'none' : false
      };
    });
    
    testResults.accessibility.keyboardNavigationWorks = keyboardNavigation.hasFocus && keyboardNavigation.isFocusable;
    console.log(`Keyboard navigation works: ${testResults.accessibility.keyboardNavigationWorks}`);
    
    // Test ARIA labels
    const ariaLabels = await page.evaluate(() => {
      const video = document.querySelector('video');
      const cta = document.querySelector('button');
      
      return {
        videoHasLabel: video ? video.getAttribute('aria-label') !== null : false,
        ctaHasLabel: cta ? cta.getAttribute('aria-label') !== null : false
      };
    });
    
    testResults.accessibility.ariaLabelsPresent = ariaLabels.videoHasLabel && ariaLabels.ctaHasLabel;
    console.log(`ARIA labels present: ${testResults.accessibility.ariaLabelsPresent}`);
    
    // 5. Test Performance
    console.log('\n--- Testing Performance ---');
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(5000);
    
    testResults.performance.consoleErrors = consoleErrors.length === 0;
    console.log(`No console errors: ${testResults.performance.consoleErrors}`);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    
    // Check loading performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    testResults.performance.loadingTime = performanceMetrics.totalTime < 5000; // Less than 5 seconds
    console.log(`Loading time acceptable: ${testResults.performance.loadingTime} (${performanceMetrics.totalTime}ms)`);
    
    // Check animation smoothness
    const animationSmoothness = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        let lastTime = performance.now();
        
        function countFrames() {
          frames++;
          const currentTime = performance.now();
          
          if (currentTime - lastTime >= 1000) {
            resolve(frames >= 30); // At least 30 FPS
            return;
          }
          
          requestAnimationFrame(countFrames);
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    testResults.performance.animationsSmooth = animationSmoothness;
    console.log(`Animations smooth: ${testResults.performance.animationsSmooth}`);
    
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await browser.close();
    
    // Generate test report
    console.log('\n=== Test Results Summary ===');
    console.log('\nCore Functionality:');
    Object.entries(testResults.coreFunctionality).forEach(([test, result]) => {
      console.log(`  ${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('\nError Handling:');
    Object.entries(testResults.errorHandling).forEach(([test, result]) => {
      console.log(`  ${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('\nMobile Responsiveness:');
    Object.entries(testResults.mobileResponsiveness).forEach(([test, result]) => {
      console.log(`  ${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('\nAccessibility:');
    Object.entries(testResults.accessibility).forEach(([test, result]) => {
      console.log(`  ${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('\nPerformance:');
    Object.entries(testResults.performance).forEach(([test, result]) => {
      console.log(`  ${test}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    // Calculate overall score
    const allTests = Object.values(testResults).flatMap(category => Object.values(category));
    const passedTests = allTests.filter(result => result).length;
    const totalTests = allTests.length;
    const passRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log(`\nOverall Test Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    
    return testResults;
  }
}

// Run the tests
runTests().catch(console.error);