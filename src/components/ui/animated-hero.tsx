import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useReducedMotion, useMotionProps } from "../../hooks/useReducedMotion";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [userPrefersNoVideo, setUserPrefersNoVideo] = useState(false);
  // @ts-ignore - videoCanPlay is set but not used, kept for future implementation
  const [_videoCanPlay, setVideoCanPlay] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use our custom hook for reduced motion detection
  const reducedMotion = useReducedMotion();
  // @ts-ignore - motionProps is kept for future implementation
  const _motionProps = useMotionProps();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Check user's video preference (stored in localStorage)
  useEffect(() => {
    const savedPreference = localStorage.getItem('disableVideoOnMobile');
    if (savedPreference !== null) {
      setUserPrefersNoVideo(savedPreference === 'true');
    }
  }, []);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      // Small delay to ensure the orientation change is complete
      setTimeout(() => {
        if (videoRef.current) {
          // Force video to resize properly after orientation change
          videoRef.current.load();
        }
      }, 500);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  // Handle video events
  const handleVideoCanPlay = useCallback(() => {
    setVideoCanPlay(true);
    setVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setVideoLoaded(false);
  }, []);

  // Toggle video preference for mobile users
  const toggleVideoPreference = useCallback(() => {
    const newPreference = !userPrefersNoVideo;
    setUserPrefersNoVideo(newPreference);
    localStorage.setItem('disableVideoOnMobile', newPreference.toString());
  }, [userPrefersNoVideo]);

  // Determine if video should be shown
  const shouldShowVideo = useMemo(() => {
    // Don't show video if user prefers no video on mobile
    if (isMobile && userPrefersNoVideo) return false;
    
    // Don't show video on slow connections
    if (isSlowConnection) return false;
    
    // Don't show video if there was an error
    if (videoError) return false;
    
    // Don't show video if not intersecting (for lazy loading)
    if (!isIntersecting) return false;
    
    return true;
  }, [isMobile, userPrefersNoVideo, isSlowConnection, videoError, isIntersecting]);

  // Determine video source based on device
  const videoSource = useMemo(() => {
    if (isMobile) {
      // Use a lower resolution video for mobile
      return "https://res.cloudinary.com/djg0pqts6/video/upload/v1762222741/1103_1_zdmn3a.mp4";
    } else {
      // Use the original high resolution video for desktop
      return "https://res.cloudinary.com/djg0pqts6/video/upload/v1762222741/1103_1_zdmn3a.mp4";
    }
  }, [isMobile]);
  const titles = useMemo(
    () => [
      "Bye-Bye Bitches™",
      "YFKI™",
      "Let the Tags Testify™",
      "Presence over Polish™",
      "Awwwwwthentic™",
      "parallel parenting isnt parenting™",
      "fire doesnt dim it consumes™",
      "Spite Clothiers™",
      "Patent Pending™",
      "Silence Speaks Louder Than Noise™",
      "Support Encouraged Advice Admonished™",
      "HalfSalt™",
      "Rhythm over Recall™",
      "The Drop That Started It All™",
      "FullBurn™",
      "Sewn with Intent™",
      "Legacy Bleeds Into Memory™",
      "you are the backup plan™",
      "Thread That Threatens™",
      "legacy isnt optional™",
      "Legacy Transfered™",
      "Trademarked™",
      "Thread Counts as Evidence™",
      "Legacy Isnt Data Its Resonance™",
      "Soft Cotton Hard Truth™",
      "Guilty of Spite™",
      "AD105MF™",
      "Admit Nothing Wear Everything™",
      "This Fabric Remembers™",
      "Drip That Prints™",
      "Emotionally Elite™",
      "Step closer™",
      "Flinching is fatal™",
      "You Wear the Words You'll Regret™",
      "Silence was the loudest answer™",
      "Pain Is the Brand™",
      "Truth over Pressure™",
      "Press is Back On™",
      "Mirrors are free™",
      "We Print the Truth™",
      "Born for the Burn™",
      "made you smile?™",
      "made me grin™",
      "TM™",
      "Truth Doesnt Flinch™",
      "Automation is empty without a soul™",
      "Mark It Fucking Zero™",
      "is this your homework",
      "im not your assistant™",
      "IM YOUR DIGITAL ALTER EGO™",
      "Slow Your Roll™",
      "This Wasnt a Meeting It Was a Warning.™",
      "Proof of Spite™",
      "Lipstick and Liability™",
      "The future wont wait™",
      "Truth burns™",
      "Dripped for Vengeance™",
      "Emotion over Automation™",
      "Silence was the point™",
      "Ink That Hurts™",
      "Legacy isnt theirs its yours™",
      "Corporate karma doesnt cool off™",
      "You so strong™",
      "Legacy wont wait for you™",
      "Fullburn™",
      "Abandonment is fatal™",
      "not melted reforged™",
      "SpitePrints Fast™",
      "SoulPrints Last™",
      "The edge isnt safe its necessary™",
      "Fabric Soaked in Fuck You™",
      "In for a dime in for a dollar™",
      "Touché™",
      "The forge burns hotter than fear™",
      "Legacy isnt stored its forged™",
      "Endings arent quiet in the forge™",
      "Fuck with the bull get the horns™",
      "You Wear the Words You Regret™",
      "Born for the Burn™",
      "Guilty of Spite™",
      "Presence over polish. Rhythm over recall.™",
      "No Mercy in Cotton™",
      "Adios, Motherfucker™"
    ]
      .filter(title => title.includes("™"))
      // Filter out overly long phrases that won't fit well on one line
      .filter(title => title.length <= 40),
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 700); // Changed to 0.7s cycle for faster animation
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      {shouldShowVideo && (
        <video
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 ${reducedMotion ? '' : 'transition-opacity duration-1000'} ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay={!isMobile || !isSlowConnection}
          loop
          muted
          playsInline
          preload={isMobile ? "none" : "metadata"}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          disablePictureInPicture
          controls={false}
          x-webkit-airplay="deny"
        >
          <source src={videoSource} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Fallback background while video loads or if video is disabled */}
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-black z-0 ${reducedMotion ? '' : 'transition-opacity duration-1000'} ${videoLoaded && shouldShowVideo ? 'opacity-0' : 'opacity-100'}`}></div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      
      {/* Gradient overlay darker at bottom for improved text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
      
      {/* Video toggle button for mobile users */}
      {isMobile && (
        <button
          onClick={toggleVideoPreference}
          className={`absolute top-4 right-4 z-30 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full text-xs ${reducedMotion ? '' : 'hover:bg-white/30 transition-colors'}`}
          aria-label={userPrefersNoVideo ? "Enable video" : "Disable video"}
        >
          {userPrefersNoVideo ? "Enable Video" : "Disable Video"}
        </button>
      )}
      
      {/* Loading indicator for video */}
      {shouldShowVideo && !videoLoaded && !videoError && (
        <div className={`absolute top-1/2 left-1/2 z-20 ${reducedMotion ? '' : 'transform -translate-x-1/2 -translate-y-1/2'}`}>
          <div className={`w-12 h-12 border-4 border-white/30 border-t-white rounded-full ${reducedMotion ? '' : 'animate-spin'}`}></div>
        </div>
      )}
      
      <div className="relative z-20 container mx-auto px-4 flex items-center justify-center flex-col gap-1 h-full">
        {/* Combined heading and summary with consistent spacing */}
        <div className="text-center max-w-5xl mx-auto flex flex-col items-center justify-center flex-grow">
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-wider font-serif font-black">
            <div className="flex justify-center">
              <img
                src="https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png"
                alt="ARCHE FORGE"
                className="max-w-full h-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                style={{
                  width: 'clamp(200px, 50vw, 400px)',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div className="relative flex w-full justify-center overflow-visible h-16 md:h-20 lg:h-24">
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-black w-full text-center px-2 text-lg md:text-xl lg:text-2xl xl:text-3xl break-words hyphens-auto leading-normal"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: '600',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
                    textShadow: titleNumber === index
                      ? '0 0 10px rgba(70, 130, 180, 0.8), 0 0 20px rgba(70, 130, 180, 0.6), 0 0 30px rgba(255, 69, 0, 0.4), 0 0 40px rgba(255, 69, 0, 0.2)'
                      : 'none'
                  }}
                  initial={reducedMotion ? { opacity: 1, color: "#FFFFFF" } : { opacity: 0, color: "#FFFFFF" }}
                  transition={reducedMotion ? { duration: 0 } : {
                    duration: titleNumber === index ? 0.2 : 0.1,
                    ease: titleNumber === index ? "easeOut" : "easeIn"
                  }}
                  animate={
                    titleNumber === index
                      ? {
                          opacity: 1,
                          zIndex: 10,
                          color: "#FFFFFF"
                        }
                      : {
                          opacity: 0,
                          zIndex: 1,
                          color: "#FFFFFF"
                        }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </div>
          </h1>
          
          {/* Hero Message - Two lines of text with glow effect */}
          <div className="max-w-3xl mx-auto mb-6">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight"
               style={{
                 fontFamily: 'Orbitron, sans-serif',
                 textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.3)',
                 filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))'
               }}>
              Today's AI answers. We remember.
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed"
               style={{
                 fontFamily: 'Orbitron, sans-serif',
                 fontWeight: '500',
                 textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.25)',
                 filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
               }}>
              SoulPrint makes AI feel less like a tool and more like you.
            </p>
          </div>
        </div>
        
        
      </div>
    </div>
  );
}

export { Hero };