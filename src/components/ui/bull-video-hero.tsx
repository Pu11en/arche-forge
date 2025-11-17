import React, { useState, useRef, useCallback } from "react";
import { detectBrowser } from "../../lib/browser-detection";

export interface BullVideoHeroProps {
  /** Desktop background video URL */
  desktopVideoUrl?: string;
  /** Mobile background video URL */
  mobileVideoUrl?: string;
  /** Optional className for additional styling */
  className?: string;
}

const BullVideoHero: React.FC<BullVideoHeroProps> = ({
  desktopVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4",
  mobileVideoUrl = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4",
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Determine video URL based on device
  const videoUrl = useState(() => {
    const browser = detectBrowser();
    return browser.isMobile ? mobileVideoUrl : desktopVideoUrl;
  })[0];

  // Handle video events
  const handleVideoCanPlay = useCallback(() => {
    console.log('BullVideoHero: Video can play');
    setVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback(() => {
    console.error('BullVideoHero: Video failed to load');
    setVideoError(true);
  }, []);

  // Debug logging for BullVideoHero state
  console.log('BullVideoHero render state:', {
    videoLoaded,
    videoError,
    videoUrl,
    className
  });

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{
        backgroundColor: '#000000' // Black background to prevent white flash
      }}
    >
      {/* Looping Bull Video */}
      {!videoError && (
        <video
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          style={{
            objectFit: 'cover',
            width: '100vw',
            height: '100vh'
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      
      {/* Fallback background (visible while video loads or on error) */}
      <div 
        className={`absolute inset-0 bg-black z-0 transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export { BullVideoHero };