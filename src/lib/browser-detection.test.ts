/**
 * Tests for browser detection utilities
 * These tests verify cross-browser compatibility and feature detection
 */

// Mock navigator for testing
const mockNavigator = (userAgent: string, vendor?: string) => {
  Object.defineProperty(window, 'navigator', {
    writable: true,
    value: {
      userAgent,
      vendor: vendor || '',
      connection: null
    }
  });
};

// Mock CSS.supports for testing
const mockCSSSupports = (property: string, value: string) => {
  // Simulate different browser support levels
  const supportedFeatures = [
    'display: grid',
    'display: flex',
    'transform: translateZ(0)',
    'transition: opacity 0.3s'
  ];
  
  return supportedFeatures.includes(`${property}: ${value}`);
};

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
      isDesktop: true,
      version: '91'
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
      isDesktop: true,
      version: '89'
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
      isDesktop: true,
      version: '14'
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
      isDesktop: true,
      version: '91'
    }
  },
  {
    name: 'Internet Explorer',
    userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
    vendor: '',
    expected: {
      isChrome: false,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isIE: true,
      isMobile: false,
      isDesktop: true,
      version: '10'
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
      isDesktop: false,
      version: '14'
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
      isDesktop: false,
      version: '91'
    }
  }
];

// Video format support test cases
const videoFormatTestCases = [
  {
    format: 'webm' as const,
    canPlayTypeReturnValue: 'probably',
    expected: true
  },
  {
    format: 'webm' as const,
    canPlayTypeReturnValue: 'maybe',
    expected: true
  },
  {
    format: 'webm' as const,
    canPlayTypeReturnValue: '',
    expected: false
  },
  {
    format: 'mp4' as const,
    canPlayTypeReturnValue: 'probably',
    expected: true
  },
  {
    format: 'mp4' as const,
    canPlayTypeReturnValue: 'maybe',
    expected: true
  },
  {
    format: 'mp4' as const,
    canPlayTypeReturnValue: '',
    expected: false
  },
  {
    format: 'ogg' as const,
    canPlayTypeReturnValue: 'probably',
    expected: true
  },
  {
    format: 'ogg' as const,
    canPlayTypeReturnValue: 'maybe',
    expected: true
  },
  {
    format: 'ogg' as const,
    canPlayTypeReturnValue: '',
    expected: false
  }
];

/**
 * Test runner for browser detection utilities
 */
class BrowserDetectionTests {
  private testResults: Array<{
    testName: string;
    passed: boolean;
    error?: string;
    details?: unknown;
  }> = [];

  private async runTest(testName: string, testFunction: () => void | Promise<void>): Promise<void> {
    try {
      await testFunction();
      this.testResults.push({
        testName,
        passed: true
      });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`❌ ${testName} - FAILED: ${error}`);
    }
  }

  async testBrowserDetection(): Promise<void> {
    // Import the function to test
    const { detectBrowser } = await import('./browser-detection');

    for (const testCase of browserTestCases) {
      await this.runTest(`Browser Detection - ${testCase.name}`, () => {
        // Mock navigator
        mockNavigator(testCase.userAgent, testCase.vendor);
        
        // Test detection
        const result = detectBrowser();
        
        // Verify results
        Object.keys(testCase.expected).forEach(key => {
          const expectedValue = testCase.expected[key as keyof typeof testCase.expected];
          const actualValue = result[key as keyof typeof result];
          
          if (actualValue !== expectedValue) {
            throw new Error(
              `Browser detection failed for ${testCase.name}: ` +
              `Expected ${key} to be ${expectedValue}, got ${actualValue}`
            );
          }
        });
      });
    }
  }

  async testVideoFormatSupport(): Promise<void> {
    const { supportsVideoFormat } = await import('./browser-detection');

    for (const testCase of videoFormatTestCases) {
      await this.runTest(`Video Format Support - ${testCase.format} (${testCase.canPlayTypeReturnValue})`, () => {
        // Mock video element
        const mockVideo = {
          canPlayType: jest.fn().mockReturnValue(testCase.canPlayTypeReturnValue)
        } as HTMLVideoElement;
        
        // Mock document.createElement
        const originalCreateElement = document.createElement;
        document.createElement = jest.fn().mockReturnValue(mockVideo) as jest.MockedFunction<typeof document.createElement>;
        
        try {
          const result = supportsVideoFormat(testCase.format);
          
          if (result !== testCase.expected) {
            throw new Error(
              `Video format support test failed: ` +
              `Expected ${testCase.format} support to be ${testCase.expected}, got ${result}`
            );
          }
        } finally {
          // Restore original
          document.createElement = originalCreateElement;
        }
      });
    }
  }

  async testOptimalVideoFormat(): Promise<void> {
    const { getOptimalVideoFormat } = await import('./browser-detection');

    await this.runTest('Optimal Video Format - WebM preferred', () => {
      // Mock video element that supports all formats
      const mockVideo = {
        canPlayType: jest.fn()
          .mockReturnValueOnce('probably') // webm
          .mockReturnValueOnce('probably') // mp4
          .mockReturnValueOnce('probably') // ogg
      } as HTMLVideoElement;
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockReturnValue(mockVideo) as jest.MockedFunction<typeof document.createElement>;
      
      try {
        const result = getOptimalVideoFormat();
        
        if (result !== 'webm') {
          throw new Error(
            `Optimal video format test failed: ` +
            `Expected 'webm' when all formats are supported, got '${result}'`
          );
        }
      } finally {
        document.createElement = originalCreateElement;
      }
    });

    await this.runTest('Optimal Video Format - MP4 fallback', () => {
      // Mock video element that only supports MP4
      const mockVideo = {
        canPlayType: jest.fn()
          .mockReturnValueOnce('') // webm not supported
          .mockReturnValueOnce('probably') // mp4 supported
          .mockReturnValueOnce('') // ogg not supported
      } as HTMLVideoElement;
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockReturnValue(mockVideo) as jest.MockedFunction<typeof document.createElement>;
      
      try {
        const result = getOptimalVideoFormat();
        
        if (result !== 'mp4') {
          throw new Error(
            `Optimal video format test failed: ` +
            `Expected 'mp4' when only MP4 is supported, got '${result}'`
          );
        }
      } finally {
        document.createElement = originalCreateElement;
      }
    });
  }

  async testUserInteractionDetection(): Promise<void> {
    const { requiresUserInteractionForAutoplay } = await import('./browser-detection');

    await this.runTest('User Interaction Detection - Safari requires interaction', () => {
      mockNavigator(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Apple Computer, Inc.'
      );
      
      const result = requiresUserInteractionForAutoplay();
      
      if (!result) {
        throw new Error('Safari should require user interaction for autoplay');
      }
    });

    await this.runTest('User Interaction Detection - Mobile requires interaction', () => {
      mockNavigator(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        'Apple Computer, Inc.'
      );
      
      const result = requiresUserInteractionForAutoplay();
      
      if (!result) {
        throw new Error('Mobile browsers should require user interaction for autoplay');
      }
    });

    await this.runTest('User Interaction Detection - Modern Chrome does not require interaction', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Google Inc.'
      );
      
      const result = requiresUserInteractionForAutoplay();
      
      if (result) {
        throw new Error('Modern Chrome should not require user interaction for autoplay');
      }
    });
  }

  async testVendorPrefixes(): Promise<void> {
    const { getVendorPrefixes } = await import('./browser-detection');

    await this.runTest('Vendor Prefixes - Modern browsers', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Google Inc.'
      );
      
      const prefixes = getVendorPrefixes();
      
      // Modern browsers should use standard properties
      if (prefixes.transform !== 'transform') {
        throw new Error('Modern Chrome should use standard transform property');
      }
    });

    await this.runTest('Vendor Prefixes - Older Safari', () => {
      mockNavigator(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Apple Computer, Inc.'
      );
      
      const prefixes = getVendorPrefixes();
      
      // Safari might use webkit prefixes
      if (!prefixes.transform.includes('transform')) {
        throw new Error('Safari should support transform property');
      }
    });
  }

  async testPassiveEventSupport(): Promise<void> {
    const { supportsPassiveEvents } = await import('./browser-detection');

    await this.runTest('Passive Events Support Detection', () => {
      // Mock addEventListener to test passive support
      const originalAddEventListener = window.addEventListener;
      let supportsPassive = false;
      
      window.addEventListener = jest.fn((event, listener, options) => {
        if (typeof options === 'object' && options.passive === true) {
          supportsPassive = true;
        }
      }) as jest.MockedFunction<typeof window.addEventListener>;
      
      try {
        const result = supportsPassiveEvents();
        
        // The function should detect passive event support
        if (typeof result !== 'boolean') {
          throw new Error('supportsPassiveEvents should return a boolean');
        }
      } finally {
        window.addEventListener = originalAddEventListener;
      }
    });
  }

  async testCSSSupport(): Promise<void> {
    const { supportsCSSGrid, supportsCSSFlexbox } = await import('./browser-detection');

    // Mock CSS.supports
    const originalCSSSupports = CSS.supports;
    CSS.supports = jest.fn(mockCSSSupports);

    try {
      await this.runTest('CSS Grid Support Detection', () => {
        const result = supportsCSSGrid();
        
        if (typeof result !== 'boolean') {
          throw new Error('supportsCSSGrid should return a boolean');
        }
      });

      await this.runTest('CSS Flexbox Support Detection', () => {
        const result = supportsCSSFlexbox();
        
        if (typeof result !== 'boolean') {
          throw new Error('supportsCSSFlexbox should return a boolean');
        }
      });
    } finally {
      CSS.supports = originalCSSSupports;
    }
  }

  async testSafeZIndex(): Promise<void> {
    const { getSafeZIndex } = await import('./browser-detection');

    await this.runTest('Safe Z-Index - Modern browsers', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Google Inc.'
      );
      
      const zIndex = getSafeZIndex();
      
      if (zIndex !== '999999') {
        throw new Error(`Modern browsers should use high z-index, got ${zIndex}`);
      }
    });

    await this.runTest('Safe Z-Index - IE fallback', () => {
      mockNavigator('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)');
      
      const zIndex = getSafeZIndex();
      
      if (zIndex !== '9999') {
        throw new Error(`IE should use lower z-index, got ${zIndex}`);
      }
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Browser Detection Tests...');
    
    await this.testBrowserDetection();
    await this.testVideoFormatSupport();
    await this.testOptimalVideoFormat();
    await this.testUserInteractionDetection();
    await this.testVendorPrefixes();
    await this.testPassiveEventSupport();
    await this.testCSSSupport();
    await this.testSafeZIndex();
    
    this.generateReport();
  }

  generateReport(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n📊 Browser Detection Test Report');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.testName}: ${result.error}`);
      });
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new BrowserDetectionTests();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { BrowserDetectionTests };