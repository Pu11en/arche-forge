import React, { useEffect, useRef, useState } from "react";

export interface VideoIntroProps {
  onVideoEnd: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showContinueOverlay, setShowContinueOverlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    
    if (video) {
      // Set up the event listener for when the video ends
      const handleVideoEnd = () => {
        onVideoEnd();
      };
      
      // Set up error handling for video loading failures
      const handleVideoError = () => {
        console.error('Video intro failed to load');
        // Show continue overlay as fallback
        setShowContinueOverlay(true);
      };
      
      // Show continue overlay after a delay as a fallback for autoplay blocking
      const overlayTimer = setTimeout(() => {
        setShowContinueOverlay(true);
      }, 3000); // Show after 3 seconds
      
      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('error', handleVideoError);
      
      // Clean up the event listener when the component unmounts
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('error', handleVideoError);
        clearTimeout(overlayTimer);
      };
    }
  }, [onVideoEnd]);

  const handleContinueClick = () => {
    onVideoEnd();
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        src="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
      />
      
      {/* Click to continue overlay */}
      {showContinueOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-20"
          onClick={handleContinueClick}
        >
          <div className="text-center">
            <p className="text-white text-xl mb-4">Click to continue</p>
            <button
              className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={handleContinueClick}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { VideoIntro };