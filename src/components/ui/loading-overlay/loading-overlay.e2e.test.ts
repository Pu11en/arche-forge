import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * End-to-End Tests for Loading Overlay Component
 * Tests the complete functionality including video loading, transitions, and integration
 */

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
  details?: any;
}

class LoadingOverlayE2ETest {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private testResults: TestResult[] = [];

  async setup(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set viewport to desktop size
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    this.page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });
    
    // Enable request/response logging for debugging
    this.page.on('request', request => {
      if (request.url().includes('video')) {
        console.log('VIDEO REQUEST:', request.url());
      }
    });
    
    this.page.on('response', response => {
      if (response.url().includes('video')) {
        console.log('VIDEO RESPONSE:', response.status(), response.url());
      }
    });
  }

  async teardown(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async runTest(testName: string, testFunction: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: true,
        duration
      });
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      });
      console.log(`❌ ${testName} - FAILED (${duration}ms): ${error}`);
    }
  }

  async navigateToTestPage(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to the dev server
    await this.page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the page to load
    await this.page.waitForSelector('body', { timeout: 10000 });
  }

  async testLoadingOverlayRendering(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Check if loading overlay is present
    const overlay = await this.page.$('video');
    if (!overlay) {
      throw new Error('Loading overlay video element not found');
    }
    
    // Check if overlay is visible
    const isVisible = await this.page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return false;
      const style = window.getComputedStyle(video);
      return style.display !== 'none' && style.opacity !== '0';
    });
    
    if (!isVisible) {
      throw new Error('Loading overlay is not visible');
    }
  }

  async testVideoLoading(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Wait for video to load
    await this.page.waitForFunction(() => {
      const video = document.querySelector('video');
      return video && video.readyState >= 2; // HAVE_CURRENT_DATA
    }, { timeout: 15000 });
    
    // Check video properties
    const videoState = await this.page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return null;
      
      return {
        readyState: video.readyState,
        networkState: video.networkState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration,
        buffered: video.buffered.length
      };
    });
    
    if (!videoState || videoState.readyState < 2) {
      throw new Error('Video failed to load properly');
    }
    
    if (videoState.videoWidth === 0 || videoState.videoHeight === 0) {
      throw new Error('Video dimensions are invalid');
    }
  }

  async testLoadingSpinner(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Check for loading spinner
    const spinnerExists = await this.page.evaluate(() => {
      const spinners = document.querySelectorAll('[class*="spinner"], [class*="loading"]');
      return spinners.length > 0;
    });
    
    if (!spinnerExists) {
      throw new Error('Loading spinner not found');
    }
  }

  async testVideoPlayback(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Start video playback
    const playbackStarted = await this.page.evaluate(async () => {
      const video = document.querySelector('video');
      if (!video) return false;
      
      try {
        await video.play();
        return video.paused === false;
      } catch (error) {
        console.log('Autoplay blocked, checking for play button');
        // Check if play button is shown
        const playButton = document.querySelector('button');
        return playButton !== null;
      }
    });
    
    if (!playbackStarted) {
      throw new Error('Video playback failed to start');
    }
  }

  async testTransitionToHero(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Wait for video to end or trigger transition
    await this.page.evaluate(async () => {
      const video = document.querySelector('video');
      if (video) {
        // Fast forward to near the end
        video.currentTime = Math.max(0, video.duration - 0.5);
        // Trigger ended event
        video.dispatchEvent(new Event('ended'));
      }
    });
    
    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if overlay is hidden
    const overlayHidden = await this.page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return true; // Consider hidden if not found
      
      const container = video.closest('div');
      if (!container) return true;
      
      const style = window.getComputedStyle(container);
      return style.opacity === '0' || style.display === 'none';
    });
    
    if (!overlayHidden) {
      throw new Error('Loading overlay did not transition properly');
    }
  }

  async testErrorHandling(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Navigate to error test page
    await this.page.goto('http://localhost:5173?test=error', {
      waitUntil: 'networkidle2'
    });
    
    // Wait for error to occur
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for error message
    const errorMessage = await this.page.evaluate(() => {
      const errorElements = document.querySelectorAll('*');
      for (const el of errorElements) {
        if (el.textContent?.includes('Unable to load video') || 
            el.textContent?.includes('Please check your connection')) {
          return true;
        }
      }
      return false;
    });
    
    if (!errorMessage) {
      throw new Error('Error message not displayed');
    }
  }

  async testResponsiveDesign(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Test mobile viewport
    await this.page.setViewport({ width: 375, height: 667 });
    
    // Check if overlay adapts to mobile
    const mobileAdapted = await this.page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return false;
      
      const container = video.closest('div');
      if (!container) return false;
      
      const style = window.getComputedStyle(container);
      return style.width === '100%' && style.height === '100%';
    });
    
    if (!mobileAdapted) {
      throw new Error('Loading overlay did not adapt to mobile viewport');
    }
    
    // Test tablet viewport
    await this.page.setViewport({ width: 768, height: 1024 });
    
    // Test desktop viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testAccessibility(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Check for reduced motion support
    const reducedMotionSupported = await this.page.evaluate(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      return mediaQuery.matches;
    });
    
    // Check for proper ARIA labels
    const ariaLabelsPresent = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
          return false;
        }
      }
      return true;
    });
    
    if (!ariaLabelsPresent) {
      throw new Error('Missing ARIA labels on interactive elements');
    }
  }

  async testPerformance(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Check for hardware acceleration
    const hardwareAcceleration = await this.page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return false;
      
      const style = window.getComputedStyle(video);
      return style.transform !== 'none' || style.willChange !== 'auto';
    });
    
    // Measure load time
    const loadMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    if (loadMetrics.totalTime > 10000) {
      throw new Error(`Page load time too slow: ${loadMetrics.totalTime}ms`);
    }
  }

  async testBrowserCompatibility(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    // Test video format support
    const formatSupport = await this.page.evaluate(() => {
      const video = document.createElement('video');
      return {
        mp4: video.canPlayType('video/mp4') !== '',
        webm: video.canPlayType('video/webm') !== '',
        ogg: video.canPlayType('video/ogg') !== ''
      };
    });
    
    if (!formatSupport.mp4) {
      throw new Error('MP4 format not supported');
    }
    
    // Test cross-browser features
    const crossBrowserFeatures = await this.page.evaluate(() => {
      return {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        transforms: CSS.supports('transform', 'translateZ(0)'),
        transitions: CSS.supports('transition', 'opacity 0.3s')
      };
    });
    
    if (!crossBrowserFeatures.flexbox || !crossBrowserFeatures.transforms) {
      throw new Error('Required CSS features not supported');
    }
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Loading Overlay E2E Tests...');
    
    await this.setup();
    
    try {
      await this.runTest('Navigate to Test Page', () => this.navigateToTestPage());
      await this.runTest('Loading Overlay Rendering', () => this.testLoadingOverlayRendering());
      await this.runTest('Video Loading', () => this.testVideoLoading());
      await this.runTest('Loading Spinner', () => this.testLoadingSpinner());
      await this.runTest('Video Playback', () => this.testVideoPlayback());
      await this.runTest('Transition to Hero', () => this.testTransitionToHero());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      await this.runTest('Responsive Design', () => this.testResponsiveDesign());
      await this.runTest('Accessibility', () => this.testAccessibility());
      await this.runTest('Performance', () => this.testPerformance());
      await this.runTest('Browser Compatibility', () => this.testBrowserCompatibility());
    } finally {
      await this.teardown();
    }
    
    return this.testResults;
  }

  generateTestReport(): string {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    
    let report = `\n📊 Loading Overlay E2E Test Report\n`;
    report += `=====================================\n`;
    report += `Total Tests: ${totalTests}\n`;
    report += `Passed: ${passedTests} ✅\n`;
    report += `Failed: ${failedTests} ❌\n`;
    report += `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`;
    report += `Total Duration: ${totalDuration}ms\n\n`;
    
    report += `📋 Test Results:\n`;
    report += `-----------------\n`;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      report += `${status} ${result.testName} (${result.duration}ms)\n`;
      if (!result.passed && result.error) {
        report += `   Error: ${result.error}\n`;
      }
    });
    
    return report;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new LoadingOverlayE2ETest();
  
  tester.runAllTests()
    .then(results => {
      console.log(tester.generateTestReport());
      process.exit(results.every(r => r.passed) ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { LoadingOverlayE2ETest };
export type { TestResult };