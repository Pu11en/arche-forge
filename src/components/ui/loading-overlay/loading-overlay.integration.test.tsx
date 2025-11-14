import React, { useState, useEffect } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { Button } from "../button.tsx";
import { Hero } from "../animated-hero.tsx";

/**
 * Integration Test Component for Loading Overlay
 * This component tests the complete integration between the loading overlay and the hero component
 */
const LoadingOverlayIntegrationTest = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [testScenario, setTestScenario] = useState<'normal' | 'error' | 'slow' | 'mobile'>('normal');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleVideoLoaded = () => {
    addTestResult("✅ Video loaded successfully");
  };

  const handleVideoError = (error?: Error) => {
    addTestResult(`❌ Video loading failed: ${error?.message || 'Unknown error'}`);
  };

  const handleTransitionComplete = () => {
    addTestResult("✅ Transition completed successfully");
    setShowLoadingOverlay(false);
  };

  const runAutomatedTests = async () => {
    setIsTestRunning(true);
    setTestResults([]);
    addTestResult("🚀 Starting automated integration tests...");

    // Test 1: Normal loading flow
    addTestResult("📋 Test 1: Normal loading flow");
    setShowLoadingOverlay(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Error handling
    addTestResult("📋 Test 2: Error handling simulation");
    setTestScenario('error');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Slow connection
    addTestResult("📋 Test 3: Slow connection simulation");
    setTestScenario('slow');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Mobile simulation
    addTestResult("📋 Test 4: Mobile device simulation");
    setTestScenario('mobile');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset to normal
    setTestScenario('normal');
    addTestResult("🏁 Automated tests completed");
    setIsTestRunning(false);
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
      case 'mobile':
        return {
          videoUrl: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
          videoUrls: {}
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

  const videoConfig = getVideoConfig();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        videoUrl={videoConfig.videoUrl}
        videoUrls={videoConfig.videoUrls}
        onVideoLoaded={handleVideoLoaded}
        onVideoError={handleVideoError}
        onTransitionComplete={handleTransitionComplete}
        attemptAutoplay={testScenario !== 'mobile'}
        showPlayButton={testScenario === 'mobile'}
        playButtonText="Tap to Continue"
      />

      {/* Main Content (Hero) */}
      <div className={`transition-opacity duration-1000 ${showLoadingOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <Hero />
      </div>

      {/* Test Controls Overlay */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Integration Test Controls</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Test Scenario:</label>
            <select 
              value={testScenario} 
              onChange={(e) => setTestScenario(e.target.value as 'normal' | 'error' | 'slow' | 'mobile')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
            >
              <option value="normal">Normal Flow</option>
              <option value="error">Error Handling</option>
              <option value="slow">Slow Connection</option>
              <option value="mobile">Mobile Device</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowLoadingOverlay(!showLoadingOverlay)}
              disabled={isTestRunning}
              className="flex-1"
            >
              {showLoadingOverlay ? "Hide" : "Show"} Overlay
            </Button>
            
            <Button
              onClick={runAutomatedTests}
              disabled={isTestRunning}
              variant="outline"
              className="flex-1"
            >
              {isTestRunning ? "Running..." : "Run Tests"}
            </Button>
          </div>

          <Button
            onClick={() => setTestResults([])}
            variant="outline"
            className="w-full"
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Test Results:</h4>
            <div className="bg-gray-50 rounded p-2 max-h-40 overflow-y-auto text-xs font-mono">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Instructions */}
      <div className="fixed bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md">
        <h4 className="text-sm font-semibold mb-2">Test Instructions:</h4>
        <ul className="text-xs space-y-1 text-gray-600">
          <li>• Select different test scenarios from the dropdown</li>
          <li>• Click "Run Tests" for automated testing</li>
          <li>• Manually show/hide the overlay to test transitions</li>
          <li>• Check browser console for detailed logs</li>
          <li>• Test responsive behavior by resizing the window</li>
          <li>• Verify smooth transition from overlay to hero content</li>
        </ul>
      </div>
    </div>
  );
};

export { LoadingOverlayIntegrationTest };