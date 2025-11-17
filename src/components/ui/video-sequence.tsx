import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface VideoSequenceProps {
  introVideoUrl: string;
  loopVideoUrl: string;
}

const VideoSequence = ({ introVideoUrl, loopVideoUrl }: VideoSequenceProps) => {
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const [introVideoLoaded, setIntroVideoLoaded] = useState(false);
  const [loopVideoLoaded, setLoopVideoLoaded] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [showLoopVideo, setShowLoopVideo] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const reducedMotion = useReducedMotion();

  // Check network connection speed
  useEffect(() => {
    const checkConnection = () => {
      const connection = (navigator as any).connection ||
                        (navigator as any).mozConnection ||
                        (navigator as any).webkitConnection;
      
      if (connection) {
        const isSlow = connection.saveData ||
                       (connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType));
        setIsSlowConnection(isSlow);
      }
    };

    checkConnection();
    
    // Listen for connection changes
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', checkConnection);
      return () => connection.removeEventListener('change', checkConnection);
    }
  }, []);

  // Handle intro video events
  const handleIntroVideoCanPlay = useCallback(() => {
    console.log('[VideoSequence] Intro video can play');
    setIntroVideoLoaded(true);
  }, []);

  const handleIntroVideoError = useCallback(() => {
    console.log('[VideoSequence] Intro video error');
    setVideoError(true);
  }, []);

  const handleIntroVideoEnded = useCallback(() => {
    console.log('[VideoSequence] Intro video ended, transitioning to loop video');
    setIsIntroPlaying(false);
    
    // Start the loop video
    if (loopVideoRef.current && loopVideoLoaded) {
      loopVideoRef.current.play().catch(error => {
        console.error('[VideoSequence] Error playing loop video:', error);
      });
    }
    
    // Show the loop video after a brief delay to ensure smooth transition
    setTimeout(() => {
      setShowLoopVideo(true);
    }, reducedMotion ? 0 : 100);
  }, [loopVideoLoaded, reducedMotion]);

  // Handle loop video events
  const handleLoopVideoCanPlay = useCallback(() => {
    console.log('[VideoSequence] Loop video can play');
    setLoopVideoLoaded(true);
  }, []);

  const handleLoopVideoError = useCallback(() => {
    console.log('[VideoSequence] Loop video error');
    setVideoError(true);
  }, []);

  // Preload and start intro video
  useEffect(() => {
    if (introVideoRef.current) {
      introVideoRef.current.load();
      introVideoRef.current.play().catch(error => {
        console.error('[VideoSequence] Error playing intro video:', error);
        // If autoplay fails, try to play after user interaction
        const handleUserInteraction = () => {
          if (introVideoRef.current) {
            introVideoRef.current.play().catch(e => {
              console.error('[VideoSequence] Still failed to play intro video after user interaction:', e);
            });
          }
          document.removeEventListener('click', handleUserInteraction);
          document.removeEventListener('touchstart', handleUserInteraction);
        };
        
        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('touchstart', handleUserInteraction, { once: true });
      });
    }
  }, []);

  // Preload loop video
  useEffect(() => {
    if (loopVideoRef.current) {
      loopVideoRef.current.load();
    }
  }, []);

  // Determine if video should be shown based on device and connection
  const shouldShowVideo = !isSlowConnection && !videoError;

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Fallback background while videos load or if videos are disabled */}
      <div className={`absolute top-0 left-0 w-full h-full bg-gray-100 z-0 ${reducedMotion ? '' : 'transition-opacity duration-1000'} ${introVideoLoaded || loopVideoLoaded ? 'opacity-0' : 'opacity-100'}`}></div>
      
      {/* Intro Video */}
      {shouldShowVideo && (
        <video
          ref={introVideoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 ${reducedMotion ? '' : 'transition-opacity duration-500'} ${introVideoLoaded && isIntroPlaying ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          playsInline
          preload="auto"
          onCanPlay={handleIntroVideoCanPlay}
          onError={handleIntroVideoError}
          onEnded={handleIntroVideoEnded}
          disablePictureInPicture
          controls={false}
          x-webkit-airplay="deny"
        >
          <source src={introVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Loop Video */}
      {shouldShowVideo && (
        <video
          ref={loopVideoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 ${reducedMotion ? '' : 'transition-opacity duration-500'} ${showLoopVideo && loopVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay={false}
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={handleLoopVideoCanPlay}
          onError={handleLoopVideoError}
          disablePictureInPicture
          controls={false}
          x-webkit-airplay="deny"
        >
          <source src={loopVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Loading indicator for videos */}
      {shouldShowVideo && (!introVideoLoaded || !loopVideoLoaded) && !videoError && (
        <div className={`absolute top-1/2 left-1/2 z-20 ${reducedMotion ? '' : 'transform -translate-x-1/2 -translate-y-1/2'}`}>
          <div className={`w-12 h-12 border-4 border-black/30 border-t-black rounded-full ${reducedMotion ? '' : 'animate-spin'}`}></div>
        </div>
      )}
      
      {/* Error state */}
      {videoError && (
        <div className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-black text-xl mb-2">Unable to load videos</p>
          <p className="text-black opacity-75">Please check your connection</p>
        </div>
      )}
    </div>
  );
};

export { VideoSequence };