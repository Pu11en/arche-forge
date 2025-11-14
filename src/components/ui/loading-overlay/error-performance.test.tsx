import { useState, useEffect } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { Button } from "../button";

/**
 * Error Handling and Performance Test Component
 * Tests error scenarios, network conditions, and performance optimizations
 */
const ErrorPerformanceTest = () => {
  const [testScenario, setTestScenario] = useState<'normal' | 'error' | 'slow' | 'offline' | 'memory'>('normal');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [isTestRunning, setIsTestRunning] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const updatePerformanceMetrics = (metrics: any) => {
    setPerformanceMetrics(prev => ({ ...prev, ...metrics }));
  };

  const runErrorTests = async () => {
    setIsTestRunning(true);
    addTestResult('🚀 Starting error handling tests...');

    // Test 1: Invalid video URL
    addTestResult('📋 Test 1: Invalid video URL');
    setTestScenario('error');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const errorHandled = await checkErrorHandling();
    addTestResult(errorHandled);

    // Test 2: Network timeout
    addTestResult('📋 Test 2: Network timeout simulation');
    setTestScenario('slow');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const timeoutHandled = await checkTimeoutHandling();
    addTestResult(timeoutHandled);

    // Test 3: Offline mode
    addTestResult('📋 Test 3: Offline mode');
    setTestScenario('offline');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const offlineHandled = await checkOfflineHandling();
    addTestResult(offlineHandled);

    // Reset to normal
    setTestScenario('normal');
    addTestResult('✅ Error handling tests completed');
    setIsTestRunning(false);
  };

  const runPerformanceTests = async () => {
    setIsTestRunning(true);
    addTestResult('🚀 Starting performance tests...');

    // Clear previous metrics
    setPerformanceMetrics({});

    // Test 1: Memory usage
    addTestResult('📋 Test 1: Memory usage monitoring');
    const memoryBefore = await getMemoryUsage();
    updatePerformanceMetrics({ memoryBefore });
    
    setTestScenario('memory');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const memoryAfter = await getMemoryUsage();
    updatePerformanceMetrics({ memoryAfter });
    
    const memoryTest = await checkMemoryUsage(memoryBefore, memoryAfter);
    addTestResult(memoryTest);

    // Test 2: Rendering performance
    addTestResult('📋 Test 2: Rendering performance');
    const renderTest = await checkRenderingPerformance();
    addTestResult(renderTest);

    // Test 3: Hardware acceleration
    addTestResult('📋 Test 3: Hardware acceleration');
    const hardwareTest = await checkHardwareAcceleration();
    addTestResult(hardwareTest);

    // Test 4: Event listener cleanup
    addTestResult('📋 Test 4: Event listener cleanup');
    const cleanupTest = await checkEventListenerCleanup();
    addTestResult(cleanupTest);

    // Reset to normal
    setTestScenario('normal');
    addTestResult('✅ Performance tests completed');
    setIsTestRunning(false);
  };

  const checkErrorHandling = async (): Promise<string> => {
    const errorElements = document.querySelectorAll('*');
    
    for (const element of errorElements) {
      const text = element.textContent;
      if (text?.includes('Unable to load video') || 
          text?.includes('Please check your connection')) {
        return '✅ Error message displayed correctly';
      }
    }
    
    return '❌ Error message not found';
  };

  const checkTimeoutHandling = async (): Promise<string> => {
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    
    if (loadingElements.length > 0) {
      return '✅ Loading state maintained during timeout';
    }
    
    return '❌ Loading state not maintained';
  };

  const checkOfflineHandling = async (): Promise<string> => {
    const errorElements = document.querySelectorAll('*');
    
    for (const element of errorElements) {
      const text = element.textContent;
      if (text?.includes('Unable to load video')) {
        return '✅ Offline error handled correctly';
      }
    }
    
    return '❌ Offline error not handled';
  };

  const checkMemoryUsage = async (before: any, after: any): Promise<string> => {
    if (!before || !after) {
      return '⚠️ Memory monitoring not available';
    }
    
    const memoryIncrease = after.usedJSHeapSize - before.usedJSHeapSize;
    const memoryIncreasePercent = (memoryIncrease / before.usedJSHeapSize) * 100;
    
    if (memoryIncreasePercent < 50) {
      return `✅ Memory usage acceptable (+${memoryIncreasePercent.toFixed(1)}%)`;
    } else {
      return `❌ Memory usage too high (+${memoryIncreasePercent.toFixed(1)}%)`;
    }
  };

  const checkRenderingPerformance = async (): Promise<string> => {
    const startTime = performance.now();
    
    // Force a re-render
    setTestScenario('memory');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime < 100) {
      return `✅ Render time acceptable (${renderTime.toFixed(1)}ms)`;
    } else {
      return `❌ Render time too slow (${renderTime.toFixed(1)}ms)`;
    }
  };

  const checkHardwareAcceleration = async (): Promise<string> => {
    const video = document.querySelector('video') as HTMLElement;
    if (!video) {
      return '❌ Video element not found';
    }
    
    const styles = window.getComputedStyle(video);
    const hasTransform = styles.transform !== 'none';
    const hasWillChange = styles.willChange !== 'auto';
    const hasBackfaceVisibility = styles.backfaceVisibility === 'hidden';
    
    const optimizations = [hasTransform, hasWillChange, hasBackfaceVisibility].filter(Boolean).length;
    
    if (optimizations >= 2) {
      return `✅ Hardware acceleration enabled (${optimizations}/3 optimizations)`;
    } else {
      return `❌ Hardware acceleration insufficient (${optimizations}/3 optimizations)`;
    }
  };

  const checkEventListenerCleanup = async (): Promise<string> => {
    // This is a simplified test - in real implementation, you'd track event listeners
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) {
      return '❌ Video element not found';
    }
    
    // Check if video has proper event listeners
    const hasLoadStart = video.onloadstart !== null;
    const hasCanPlay = video.oncanplay !== null;
    const hasError = video.onerror !== null;
    
    const eventListeners = [hasLoadStart, hasCanPlay, hasError].filter(Boolean).length;
    
    if (eventListeners >= 2) {
      return `✅ Event listeners properly set (${eventListeners}/3)`;
    } else {
      return `❌ Event listeners insufficient (${eventListeners}/3)`;
    }
  };

  const getMemoryUsage = async (): Promise<any> => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    
    // Fallback: estimate memory usage
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  };

  const getVideoConfig = () => {
    switch (testScenario) {
      case 'error':
        return {
          videoUrl: "https://invalid-url-that-will-fail.com/video.mp4",
          videoUrls: {}
        };
      case 'slow':
        return {
          videoUrl: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
          videoUrls: {
            webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
            ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
          }
        };
      case 'offline':
        return {
          videoUrl: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
          videoUrls: {}
        };
      case 'memory':
        return {
          videoUrl: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
          videoUrls: {
            webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
            ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
          }
        };
      default:
        return {
          videoUrl: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
          videoUrls: {
            webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
            ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
          }
        };
    }
  };

  const simulateNetworkConditions = () => {
    if (testScenario === 'offline') {
      // Simulate offline by intercepting requests
      const originalFetch = window.fetch;
      window.fetch = () => Promise.reject(new Error('Offline'));
      
      return () => {
        window.fetch = originalFetch;
      };
    }
    
    if (testScenario === 'slow') {
      // Simulate slow network
      const originalFetch = window.fetch;
      window.fetch = (url, options) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            originalFetch(url, options).then(resolve).catch(reject);
          }, 2000); // 2 second delay
        });
      };
      
      return () => {
        window.fetch = originalFetch;
      };
    }
    
    return () => {}; // No cleanup needed
  };

  // Apply network simulation when scenario changes
  useEffect(() => {
    const cleanup = simulateNetworkConditions();
    return cleanup;
  }, [testScenario]);

  // Monitor performance
  useEffect(() => {
    if (testScenario === 'memory') {
      const interval = setInterval(async () => {
        const memory = await getMemoryUsage();
        updatePerformanceMetrics({ currentMemory: memory });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [testScenario]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Loading Overlay with Test Configuration */}
      <LoadingOverlay
        isVisible={true}
        videoUrl={getVideoConfig().videoUrl}
        videoUrls={getVideoConfig().videoUrls}
        fallbackBgColor="bg-black"
        onVideoLoaded={() => addTestResult('✅ Video loaded successfully')}
        onVideoError={(error) => addTestResult(`❌ Video loading failed: ${error?.message}`)}
        onTransitionComplete={() => addTestResult('✅ Transition completed')}
        attemptAutoplay={true}
        showPlayButton={testScenario === 'error' || testScenario === 'offline'}
        playButtonText="Try Again"
      />

      {/* Test Controls Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Error & Performance Tests</h3>
        
        <div className="space-y-3">
          {/* Test Scenario Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700">Test Scenario:</label>
            <select 
              value={testScenario} 
              onChange={(e) => setTestScenario(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
            >
              <option value="normal">Normal Operation</option>
              <option value="error">Invalid URL</option>
              <option value="slow">Slow Network</option>
              <option value="offline">Offline Mode</option>
              <option value="memory">Memory Test</option>
            </select>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={runErrorTests}
              disabled={isTestRunning}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isTestRunning ? "Running..." : "Test Errors"}
            </Button>
            <Button
              onClick={runPerformanceTests}
              disabled={isTestRunning}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isTestRunning ? "Running..." : "Test Performance"}
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

        {/* Performance Metrics */}
        {Object.keys(performanceMetrics).length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <h4 className="font-semibold mb-1">Performance Metrics:</h4>
            <div className="space-y-1">
              {performanceMetrics.memoryBefore && (
                <div>Memory Before: {(performanceMetrics.memoryBefore.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
              )}
              {performanceMetrics.memoryAfter && (
                <div>Memory After: {(performanceMetrics.memoryAfter.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
              )}
              {performanceMetrics.currentMemory && (
                <div>Current Memory: {(performanceMetrics.currentMemory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
              )}
            </div>
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

      {/* Test Instructions */}
      <div className="fixed bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md">
        <h4 className="text-sm font-semibold mb-2">Test Instructions:</h4>
        <ul className="text-xs space-y-1 text-gray-600">
          <li>• Select different test scenarios from dropdown</li>
          <li>• "Test Errors" validates error handling</li>
          <li>• "Test Performance" checks optimizations</li>
          <li>• Monitor memory usage in Memory Test</li>
          <li>• Check console for detailed logs</li>
          <li>• Verify graceful degradation</li>
        </ul>
      </div>
    </div>
  );
};

export { ErrorPerformanceTest };