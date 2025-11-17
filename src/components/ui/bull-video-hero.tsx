import React, { useCallback, useRef, useState, useEffect } from "react";
import { detectBrowser } from "../../lib/browser-detection";
import { logger } from "../../lib/logger";

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
  const [forceShowContent, setForceShowContent] = useState(false);

  // Determine video URL based on device
  const videoUrl = useState(() => {
    const browser = detectBrowser();
    return browser.isMobile ? mobileVideoUrl : desktopVideoUrl;
  })[0];

  // Handle video events
  const handleVideoCanPlay = useCallback(() => {
    logger.videoDebug('BullVideoHero: Video can play');
    const video = videoRef.current;

    if (video) {
      logger.videoDebug('BullVideoHero: Video details:', {
        duration: video.duration,
        readyState: video.readyState,
        currentTime: video.currentTime,
        paused: video.paused,
        src: video.src,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });

      // Attempt to ensure video is playing
      if (video.paused && video.readyState >= 2) {
        video.play().catch(error => {
          logger.error('BullVideoHero: Autoplay failed after canplay:', {
            error: error.message,
            name: error.name,
            videoSrc: video.src,
            readyState: video.readyState
          });
        });
      }
    }

    setVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = event.currentTarget;
    const errorCode = videoElement.error?.code || 'Unknown';
    const errorMessage = videoElement.error?.message || 'No error message available';

    logger.error('BullVideoHero: Video failed to load:', {
      errorCode,
      errorMessage,
      videoSrc: videoElement.src,
      readyState: videoElement.readyState,
      networkState: videoElement.networkState,
      currentSrc: videoElement.currentSrc,
      browserInfo: detectBrowser()
    });
    setVideoError(true);
  }, []);

  const handleVideoPlay = useCallback(() => {
    logger.videoDebug('BullVideoHero: Video started playing');
  }, []);

  const handleVideoWaiting = useCallback(() => {
    logger.videoDebug('BullVideoHero: Video waiting (buffering)');
  }, []);

  const handleVideoPlaying = useCallback(() => {
    logger.videoDebug('BullVideoHero: Video playing');
  }, []);

  const handleVideoLoadStart = useCallback(() => {
    logger.videoDebug('BullVideoHero: Load started');
  }, []);

  const handleVideoStalled = useCallback(() => {
    logger.warn('BullVideoHero: Video stalled');
  }, []);

  // Force content to show after 5 seconds regardless of video state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!videoLoaded && !videoError) {
        logger.warn('BullVideoHero: 5-second timeout reached, forcing content display');
        setForceShowContent(true);
      }
    }, 5000); // 5 seconds maximum wait

    return () => clearTimeout(timeout);
  }, [videoLoaded, videoError]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)' // Gradient background instead of pure black
      }}
    >
      {/* Loading indicator - only show if not forced to display content */}
      {!videoLoaded && !videoError && !forceShowContent && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)'
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-white mt-4 text-base font-medium">Loading background...</p>
          </div>
        </div>
      )}

      {/* Fallback gradient background (visible while video loads, on error, or after timeout) */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${videoLoaded && !videoError && !forceShowContent ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)'
        }}
      />

      {/* Looping Bull Video - hide if forced to show content without video */}
      {!videoError && !forceShowContent && (
        <video
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onWaiting={handleVideoWaiting}
          onPlaying={handleVideoPlaying}
          onLoadStart={handleVideoLoadStart}
          onStalled={handleVideoStalled}
          poster="/bull2.png"
          style={{
            objectFit: 'cover',
            width: '100vw',
            height: '100vh'
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Poster image fallback when video fails */}
      {videoError && (
        <div
          className="absolute inset-0 w-full h-full z-10"
          style={{
            backgroundImage: 'url(/bull2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
    </div>
  );
};

export { BullVideoHero };
