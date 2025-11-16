import { useState } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { Button } from "../button";

/**
 * Test component for the LoadingOverlay
 * This is only for development/testing purposes
 */
const LoadingOverlayTest = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [useSlowVideo, setUseSlowVideo] = useState(false);

  const handleVideoLoaded = () => {
    console.log("Video loaded successfully");
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
  };

  const handleTransitionComplete = () => {
    console.log("Transition completed successfully");
  };

  const videoUrl = useSlowVideo
    ? "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
    : "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4";

  return (
    <div className="relative w-full h-screen">
      <LoadingOverlay
        isVisible={isVisible}
        videoUrl={videoUrl}
        onVideoLoaded={handleVideoLoaded}
        onVideoError={handleVideoError}
        onTransitionComplete={handleTransitionComplete}
      />
      
      {/* Content behind the overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Enhanced Loading Overlay Test</h1>
        <p className="text-lg mb-8">This content is behind the loading overlay</p>
        
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? "Hide" : "Show"} Loading Overlay
          </Button>
          
          <Button
            onClick={() => setUseSlowVideo(!useSlowVideo)}
            variant="outline"
          >
            {useSlowVideo ? "Use Normal Video" : "Use Slow Video"}
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold mb-2">Enhanced Features:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Video preloading with proper buffering states</li>
            <li>Loading spinner with Lucide React icons</li>
            <li>Progress indicator during loading</li>
            <li>Buffering state detection</li>
            <li>Minimum display time (1.5s) to prevent flashing</li>
            <li>Proper event listener cleanup</li>
            <li>Enhanced error handling</li>
            <li>Network connection awareness</li>
            <li>Smooth dissolve transition after video ends</li>
            <li>Reduced motion support for accessibility</li>
            <li>Complete DOM removal after transition</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { LoadingOverlayTest };