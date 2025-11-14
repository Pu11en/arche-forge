/**
 * Manual Browser Detection Tests
 * These tests can be run in the browser console to verify browser detection functionality
 */

// Test data for different browsers
const browserTestCases = [
  {
    name: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    vendor: 'Google Inc.',
    expected: {
      isChrome: true,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isIE: false,
      isMobile: false,
      isDesktop: true
    }
  },
  {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    vendor: '',
    expected: {
      isChrome: false,
      isFirefox: true,
      isSafari: false,
      isEdge: false,
      isIE: false,
      isMobile: false,
      isDesktop: true
    }
  },
  {
    name: 'Safari',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    vendor: 'Apple Computer, Inc.',
    expected: {
      isChrome: false,
      isFirefox: false,
      isSafari: true,
      isEdge: false,
      isIE: false,
      isMobile: false,
      isDesktop: true
    }
  },
  {
    name: 'Edge',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    vendor: 'Microsoft Corporation',
    expected: {
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isEdge: true,
      isIE: false,
      isMobile: false,
      isDesktop: true
    }
  },
  {
    name: 'iPhone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
    vendor: 'Apple Computer, Inc.',
    expected: {
      isChrome: false,
      isFirefox: false,
      isSafari: true,
      isEdge: false,
      isIE: false,
      isMobile: true,
      isDesktop: false
    }
  },
  {
    name: 'Android Chrome',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    vendor: 'Google Inc.',
    expected: {
      isChrome: true,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isIE: false,
      isMobile: true,
      isDesktop: false
    }
  }
];

/**
 * Manual test runner for browser detection
 */
class BrowserDetectionManualTests {
  private results: Array<{
    testName: string;
    passed: boolean;
    error?: string;
    details?: unknown;
  }> = [];

  private runTest(testName: string, testFunction: () => boolean): void {
    try {
      const passed = testFunction();
      this.results.push({
        testName,
        passed
      });
      
      if (passed) {
        console.log(`✅ ${testName} - PASSED`);
      } else {
        console.log(`❌ ${testName} - FAILED`);
      }
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`❌ ${testName} - ERROR: ${error}`);
    }
  }

  testCurrentBrowser(): void {
    console.log('🔍 Testing Current Browser Detection...');
    
    // Import and test current browser
    import('./browser-detection').then(({ detectBrowser }) => {
      const browserInfo = detectBrowser();
      
      console.log('Current Browser Info:', browserInfo);
      
      // Basic validation
      this.runTest('Browser detection returns object', () => {
        return typeof browserInfo === 'object' && browserInfo !== null;
      });
      
      this.runTest('Browser detection has required properties', () => {
        const requiredProps = ['isChrome', 'isFirefox', 'isSafari', 'isEdge', 'isIE', 'isMobile', 'isDesktop'];
        return requiredProps.every(prop => prop in browserInfo);
      });
      
      this.runTest('Browser detection has exactly one browser true', () => {
        const browserProps = ['isChrome', 'isFirefox', 'isSafari', 'isEdge', 'isIE'];
        const trueCount = browserProps.filter(prop => browserInfo[prop]).length;
        return trueCount === 1;
      });
      
      this.runTest('Mobile and desktop are mutually exclusive', () => {
        return (browserInfo.isMobile && !browserInfo.isDesktop) || 
               (!browserInfo.isMobile && browserInfo.isDesktop);
      });
    });
  }

  testVideoFormatSupport(): void {
    console.log('🎥 Testing Video Format Support...');
    
    import('./browser-detection').then(({ supportsVideoFormat, getOptimalVideoFormat }) => {
      // Test each format
      this.runTest('MP4 format support detection', () => {
        return typeof supportsVideoFormat('mp4') === 'boolean';
      });
      
      this.runTest('WebM format support detection', () => {
        return typeof supportsVideoFormat('webm') === 'boolean';
      });
      
      this.runTest('OGG format support detection', () => {
        return typeof supportsVideoFormat('ogg') === 'boolean';
      });
      
      this.runTest('Optimal format selection', () => {
        const optimalFormat = getOptimalVideoFormat();
        return ['mp4', 'webm', 'ogg'].includes(optimalFormat);
      });
      
      // Test actual format support
      const videoElement = document.createElement('video');
      const actualSupport = {
        mp4: videoElement.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '',
        webm: videoElement.canPlayType('video/webm; codecs="vp8, vorbis"') !== '',
        ogg: videoElement.canPlayType('video/ogg; codecs="theora, vorbis"') !== ''
      };
      
      console.log('Actual Video Format Support:', actualSupport);
      
      this.runTest('Detected MP4 support matches actual', () => {
        return supportsVideoFormat('mp4') === actualSupport.mp4;
      });
      
      this.runTest('Detected WebM support matches actual', () => {
        return supportsVideoFormat('webm') === actualSupport.webm;
      });
      
      this.runTest('Detected OGG support matches actual', () => {
        return supportsVideoFormat('ogg') === actualSupport.ogg;
      });
    });
  }

  testUserInteractionRequirements(): void {
    console.log('👆 Testing User Interaction Requirements...');
    
    import('./browser-detection').then(({ requiresUserInteractionForAutoplay }) => {
      const requiresInteraction = requiresUserInteractionForAutoplay();
      
      console.log('Requires user interaction for autoplay:', requiresInteraction);
      
      this.runTest('User interaction detection returns boolean', () => {
        return typeof requiresInteraction === 'boolean';
      });
      
      // Test with current browser
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
      
      this.runTest('Safari requires user interaction', () => {
        return isSafari ? requiresInteraction : true; // Only fail if Safari doesn't require interaction
      });
      
      this.runTest('Mobile requires user interaction', () => {
        return isMobile ? requiresInteraction : true; // Only fail if mobile doesn't require interaction
      });
    });
  }

  testCSSSupport(): void {
    console.log('🎨 Testing CSS Support Detection...');
    
    import('./browser-detection').then(({ supportsCSSGrid, supportsCSSFlexbox }) => {
      const gridSupport = supportsCSSGrid();
      const flexboxSupport = supportsCSSFlexbox();
      
      console.log('CSS Grid Support:', gridSupport);
      console.log('CSS Flexbox Support:', flexboxSupport);
      
      this.runTest('CSS Grid support detection', () => {
        return typeof gridSupport === 'boolean';
      });
      
      this.runTest('CSS Flexbox support detection', () => {
        return typeof flexboxSupport === 'boolean';
      });
      
      // Verify against actual CSS support
      this.runTest('CSS Grid support matches actual', () => {
        return gridSupport === CSS.supports('display', 'grid');
      });
      
      this.runTest('CSS Flexbox support matches actual', () => {
        return flexboxSupport === CSS.supports('display', 'flex');
      });
    });
  }

  testVendorPrefixes(): void {
    console.log('🏷️ Testing Vendor Prefix Detection...');
    
    import('./browser-detection').then(({ getVendorPrefixes }) => {
      const prefixes = getVendorPrefixes();
      
      console.log('Vendor Prefixes:', prefixes);
      
      this.runTest('Vendor prefixes returns object', () => {
        return typeof prefixes === 'object' && prefixes !== null;
      });
      
      this.runTest('Vendor prefixes has required properties', () => {
        const requiredProps = ['transform', 'transition', 'animation', 'keyframes'];
        return requiredProps.every(prop => prop in prefixes);
      });
      
      this.runTest('Transform prefix is valid', () => {
        return typeof prefixes.transform === 'string' && prefixes.transform.length > 0;
      });
      
      this.runTest('Transition prefix is valid', () => {
        return typeof prefixes.transition === 'string' && prefixes.transition.length > 0;
      });
    });
  }

  testPassiveEventSupport(): void {
    console.log('👂 Testing Passive Event Support...');
    
    import('./browser-detection').then(({ supportsPassiveEvents }) => {
      const passiveSupported = supportsPassiveEvents();
      
      console.log('Passive Events Supported:', passiveSupported);
      
      this.runTest('Passive event support detection', () => {
        return typeof passiveSupported === 'boolean';
      });
      
      // Test actual passive event support
      let actualPassiveSupport = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: () => {
            actualPassiveSupport = true;
            return true;
          }
        });
        
        window.addEventListener('test', () => {}, opts);
        window.removeEventListener('test', () => {}, opts);
      } catch (e) {
        // Ignore errors
      }
      
      this.runTest('Detected passive support matches actual', () => {
        return passiveSupported === actualPassiveSupport;
      });
    });
  }

  testSafeZIndex(): void {
    console.log('📊 Testing Safe Z-Index...');
    
    import('./browser-detection').then(({ getSafeZIndex }) => {
      const safeZIndex = getSafeZIndex();
      
      console.log('Safe Z-Index:', safeZIndex);
      
      this.runTest('Safe z-index returns string', () => {
        return typeof safeZIndex === 'string';
      });
      
      this.runTest('Safe z-index is numeric string', () => {
        return /^\d+$/.test(safeZIndex);
      });
      
      // Test IE detection
      const isIE = /MSIE|Trident/.test(navigator.userAgent);
      const expectedZIndex = isIE ? '9999' : '999999';
      
      this.runTest('IE uses lower z-index', () => {
        return isIE ? safeZIndex === '9999' : true;
      });
      
      this.runTest('Modern browsers use high z-index', () => {
        return !isIE ? safeZIndex === '999999' : true;
      });
    });
  }

  testSimulatedBrowsers(): void {
    console.log('🌐 Testing Simulated Browser Detection...');
    
    // Store original navigator
    const originalUserAgent = navigator.userAgent;
    const originalVendor = navigator.vendor;
    
    browserTestCases.forEach(testCase => {
      this.runTest(`Simulated ${testCase.name} detection`, () => {
        // Temporarily override navigator
        Object.defineProperty(navigator, 'userAgent', {
          writable: true,
          value: testCase.userAgent
        });
        
        Object.defineProperty(navigator, 'vendor', {
          writable: true,
          value: testCase.vendor || ''
        });
        
        // Import and test detection
        return import('./browser-detection').then(({ detectBrowser }) => {
          const detected = detectBrowser();
          
          // Check each expected property
          const allMatch = Object.keys(testCase.expected).every(key => {
            const expected = testCase.expected[key as keyof typeof testCase.expected];
            const actual = detected[key as keyof typeof detected];
            return expected === actual;
          });
          
          if (!allMatch) {
            console.log(`Expected for ${testCase.name}:`, testCase.expected);
            console.log(`Actual for ${testCase.name}:`, {
              isChrome: detected.isChrome,
              isFirefox: detected.isFirefox,
              isSafari: detected.isSafari,
              isEdge: detected.isEdge,
              isIE: detected.isIE,
              isMobile: detected.isMobile,
              isDesktop: detected.isDesktop
            });
          }
          
          return allMatch;
        });
      });
    });
    
    // Restore original navigator
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: originalUserAgent
    });
    
    Object.defineProperty(navigator, 'vendor', {
      writable: true,
      value: originalVendor
    });
  }

  runAllTests(): void {
    console.log('🚀 Starting Manual Browser Detection Tests...');
    console.log('==========================================\n');
    
    this.testCurrentBrowser();
    this.testVideoFormatSupport();
    this.testUserInteractionRequirements();
    this.testCSSSupport();
    this.testVendorPrefixes();
    this.testPassiveEventSupport();
    this.testSafeZIndex();
    this.testSimulatedBrowsers();
    
    // Generate report after a short delay to allow async tests to complete
    setTimeout(() => {
      this.generateReport();
    }, 2000);
  }

  generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n📊 Browser Detection Test Report');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.testName}: ${result.error || 'Test failed'}`);
      });
    }
    
    console.log('\n🎯 Browser Detection Testing Complete!');
  }
}

// Auto-run tests when loaded in browser
if (typeof window !== 'undefined') {
  // Make the test runner available globally
  (window as Window & { browserDetectionTests?: BrowserDetectionManualTests }).browserDetectionTests = new BrowserDetectionManualTests();
  
  // Auto-run after a short delay
  setTimeout(() => {
    console.log('🔧 To run browser detection tests manually, use: browserDetectionTests.runAllTests()');
  }, 1000);
}

export { BrowserDetectionManualTests };