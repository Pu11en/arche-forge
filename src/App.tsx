import { useState, useEffect } from "react";
import { Hero } from "./components/ui/animated-hero";
import { LoadingOverlay } from "./components/ui/loading-overlay";

function App() {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  const handleTransitionComplete = () => {
    setShowLoadingOverlay(false);
  };

  const handleVideoError = (error?: Error) => {
    console.error("Video loading failed:", error);
    // Still hide the overlay after a delay even if video fails
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, 3000);
  };

  return (
    <div className="App relative">
      {/* Loading Overlay with Intro Video */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
        onTransitionComplete={handleTransitionComplete}
        onVideoError={handleVideoError}
        attemptAutoplay={true}
        showPlayButton={true}
        playButtonText="Play to Enter"
      />
      
      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${showLoadingOverlay ? 'opacity-0' : 'opacity-100'}`}>
        <Hero />
      </div>
    </div>
  );
}

export default App;