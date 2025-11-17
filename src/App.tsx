import { useState } from "react";
import { Hero } from "./components/ui/animated-hero";
import { VideoSequence } from "./components/ui/video-sequence";

function App() {
  const [showVideoSequence, setShowVideoSequence] = useState(true);

  const handleVideoSequenceComplete = () => {
    setShowVideoSequence(false);
  };

  return (
    <div className="App relative">
      {/* Video Sequence with Intro → Looping Video */}
      {showVideoSequence ? (
        <VideoSequence
          introVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
          bullVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
          loopingVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
          onTransitionComplete={handleVideoSequenceComplete}
        />
      ) : (
        /* Main Content */
        <div className="transition-opacity duration-1000 opacity-100">
          <Hero />
        </div>
      )}
    </div>
  );
}

export default App;