import React, { useEffect, useRef, useState } from "react";

export interface BackgroundVideoProps {
  /** Whether the background video should be visible */
  isVisible?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  isVisible = false,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    // Detect device type and set appropriate video
    const isMobile = window.innerWidth < 768;
    const src = isMobile
      ? 'https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4'
      : 'https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4';
    
    setVideoSrc(src);
  }, []);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      // Handle video error
      const handleError = () => {
        if (videoRef.current) {
          videoRef.current.style.display = 'none';
          console.error('Background video failed to load');
        }
      };

      videoRef.current.addEventListener('error', handleError);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [videoSrc]);

  if (!videoSrc) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
};

export { BackgroundVideo };