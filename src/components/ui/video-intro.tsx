import React, { useEffect, useRef, useState } from "react";
import { logger } from "../../lib/logger";

export interface VideoIntroProps {
  onVideoEnd: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showContinueOverlay, setShowContinueOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    logger.debug('VideoIntro: Component mounted, video element:', video);

    if (video) {
      // Set up the event listener for when the video ends
      const handleVideoEnd = () => {
        logger.debug('VideoIntro: Video ended naturally');
        onVideoEnd();
      };

      // Set up error handling for video loading failures
      const handleVideoError = (e: Event) => {
        const error = (e.target as HTMLVideoElement).error;
        logger.error('VideoIntro: Video failed to load:', {
          errorCode: error?.code,
          errorMessage: error?.message,
          videoSrc: video.src,
          readyState: video.readyState,
          networkState: video.networkState
        });
        setVideoError(true);
        setIsLoading(false);
        // Show continue overlay as fallback
        setShowContinueOverlay(true);
      };

      // Set up load start handling
      const handleLoadStart = () => {
        logger.debug('VideoIntro: Load started');
      };

      // Set up can play handling
      const handleCanPlay = () => {
        logger.debug('VideoIntro: Video can play', {
          duration: video.duration,
          readyState: video.readyState,
          currentTime: video.currentTime
        });
        setIsLoading(false);
        setLoadingProgress(100);
      };

      // Handle loading progress
      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          if (duration > 0) {
            setLoadingProgress((bufferedEnd / duration) * 100);
          }
        }
      };

      // Set up play handling
      const handlePlay = () => {
        logger.debug('VideoIntro: Video started playing');
      };

      // Set up play failure handling
      const handlePlayFailure = (e: Event) => {
        logger.error('VideoIntro: Video play failed:', e);
        setShowContinueOverlay(true);
      };

      // Attempt to play video and handle autoplay blocking
      const attemptPlay = async () => {
        try {
          await video.play();
        } catch (error) {
          logger.warn('VideoIntro: Autoplay blocked, showing continue overlay:', error);
          setShowContinueOverlay(true);
        }
      };

      // Show continue overlay after a delay as a fallback for autoplay blocking
      const overlayTimer = setTimeout(() => {
        logger.warn('VideoIntro: Autoplay fallback triggered - showing continue overlay');
        setShowContinueOverlay(true);
      }, 2000); // Show after 2 seconds

      // Show skip button immediately if video takes too long to load
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          setShowContinueOverlay(true);
        }
      }, 1500); // Show skip option after 1.5 seconds of loading

      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('error', handleVideoError);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('loadeddata', handleCanPlay);
      video.addEventListener('play', handlePlay);
      video.addEventListener('play', handlePlayFailure, { once: true });

      // Try to play when metadata is loaded
      video.addEventListener('loadedmetadata', attemptPlay);

      // Attempt to play the video and catch any autoplay issues
      // Add a small delay to ensure video is ready
      setTimeout(() => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            logger.error('VideoIntro: Autoplay failed:', error);
            setShowContinueOverlay(true);
          });
        }
      }, 100);

      // Clean up the event listener when the component unmounts
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('loadeddata', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('loadedmetadata', attemptPlay);
        clearTimeout(overlayTimer);
        clearTimeout(loadingTimeout);
      };
    } else {
      logger.error('VideoIntro: No video element found');
    }
  }, [onVideoEnd, isLoading]);

  const handleContinueClick = () => {
    onVideoEnd();
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Loading spinner and progress */}
      {isLoading && !videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black">
          <div className="relative">
            {/* Spinning loader */}
            <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white mt-4 text-lg">Loading...</p>
          {/* Progress bar */}
          <div className="w-64 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        src="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
      />

      {/* Error message */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-center px-4">
            <p className="text-white text-xl mb-4">Unable to load video</p>
            <p className="text-gray-400 text-sm mb-6">Click below to continue to the site</p>
          </div>
        </div>
      )}

      {/* Click to continue overlay */}
      {showContinueOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer z-20"
          onClick={handleContinueClick}
        >
          <div className="text-center px-4">
            <p className="text-white text-xl mb-4">
              {videoError ? 'Continue to site' : 'Click to continue'}
            </p>
            <button
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-lg"
              onClick={handleContinueClick}
            >
              {videoError ? 'Enter Site' : 'Skip Intro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { VideoIntro };
