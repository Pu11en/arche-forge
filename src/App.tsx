import { useState } from "react";
import { Hero } from "./components/ui/animated-hero";
import { LoadingOverlay } from "./components/ui/loading-overlay";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showHero, setShowHero] = useState(false);

  // Handle the completion of the loading overlay transition
  const handleTransitionComplete = () => {
    setIsLoading(false);
    // Delay hero appearance slightly for a smoother transition
    setTimeout(() => {
      setShowHero(true);
    }, 300);
  };

  return (
    <div className="App relative">
      {/* Loading Overlay - appears on top */}
      <LoadingOverlay
        isVisible={isLoading}
        onTransitionComplete={handleTransitionComplete}
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4"
        attemptAutoplay={true}
        showPlayButton={true}
        playButtonText="Enter ArcheForge"
      />
      
      {/* Main Content - only show after intro completes */}
      {showHero && <Hero />}
    </div>
  );
}

export default App;