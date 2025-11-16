import { useState, useEffect } from "react";
import { Hero } from "../animated-hero";
import { LoadingOverlay } from "./loading-overlay";

/**
 * Test component demonstrating the integration of LoadingOverlay with App.tsx
 * This shows how the loading overlay should be integrated with the existing hero component
 */
const AppIntegrationTest = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Handle video loading completion
  const handleVideoLoaded = () => {
    console.log("✅ Integration Test: Video loaded successfully");
  };

  // Handle video loading errors
  const handleVideoError = (error?: Error) => {
    console.error("❌ Integration Test: Video loading failed:", error);
    // In production, you might want to show a fallback or retry mechanism
  };

  // Handle transition completion
  const handleTransitionComplete = () => {
    console.log("✅ Integration Test: Transition completed");
    setLoadingComplete(true);
    setShowLoadingOverlay(false);
  };

  // Simulate initial loading state
  useEffect(() => {
    // In a real app, you might determine this based on:
    // - First-time visit
    // - User preference
    // - Marketing campaign requirements
    // - A/B testing
    const shouldShowLoadingOverlay = true; // Always show for testing
    
    setShowLoadingOverlay(shouldShowLoadingOverlay);
  }, []);

  return (
    <div className="App">
      {/* Loading Overlay - Integrates with Hero Component */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
        videoUrls={{
          webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
          ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
        }}
        fallbackBgColor="bg-black"
        onVideoLoaded={handleVideoLoaded}
        onVideoError={handleVideoError}
        onTransitionComplete={handleTransitionComplete}
        className=""
        attemptAutoplay={true}
        showPlayButton={true}
        playButtonText="Play to Continue"
      />

      {/* Main Content - Hero Component */}
      <div className={`transition-opacity duration-1000 ${showLoadingOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <Hero />
      </div>

      {/* Test Controls - Only visible in development/testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold mb-2">Integration Test Controls</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Loading Overlay:</span>
              <span className={`font-medium ${showLoadingOverlay ? 'text-green-600' : 'text-red-600'}`}>
                {showLoadingOverlay ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Loading Complete:</span>
              <span className={`font-medium ${loadingComplete ? 'text-green-600' : 'text-gray-600'}`}>
                {loadingComplete ? 'Yes' : 'No'}
              </span>
            </div>
            <button
              onClick={() => setShowLoadingOverlay(!showLoadingOverlay)}
              className="w-full mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              {showLoadingOverlay ? 'Hide' : 'Show'} Overlay
            </button>
            <button
              onClick={() => {
                setLoadingComplete(false);
                setShowLoadingOverlay(true);
              }}
              className="w-full mt-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            >
              Reset Test
            </button>
          </div>
        </div>
      )}

      {/* Test Instructions */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md">
          <h4 className="text-sm font-semibold mb-2">Integration Test Instructions:</h4>
          <ul className="text-xs space-y-1 text-gray-600">
            <li>• Watch for smooth video loading with spinner</li>
            <li>• Verify smooth transition from overlay to hero</li>
            <li>• Test with different network conditions</li>
            <li>• Check console for integration logs</li>
            <li>• Test responsive behavior by resizing</li>
            <li>• Verify error handling with invalid URLs</li>
            <li>• Test reduced motion accessibility</li>
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * This is the recommended App.tsx structure for production:
 * 
 * import { useState, useEffect } from "react";
 * import { Hero } from "./components/ui/animated-hero";
 * import { LoadingOverlay } from "./components/ui/loading-overlay";
 * 
 * function App() {
 *   const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
 *   
 *   const handleTransitionComplete = () => {
 *     setShowLoadingOverlay(false);
 *   };
 *   
 *   return (
 *     <div className="App">
 *       <LoadingOverlay
 *         isVisible={showLoadingOverlay}
 *         onTransitionComplete={handleTransitionComplete}
 *         // ... other props
 *       />
 *       <div className={`transition-opacity duration-1000 ${showLoadingOverlay ? 'opacity-0' : 'opacity-100'}`}>
 *         <Hero />
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * export default App;
 */

export { AppIntegrationTest };