import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { INTRO_VIDEO_URL } from '../constants';

export const IntroOverlay: React.FC = () => {
  const [opacity, setOpacity] = useState(100);
  const [visible, setVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted per request
  const videoRef = useRef<HTMLVideoElement>(null);
  const sequenceStarted = useRef(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startFadeSequence = () => {
      if (sequenceStarted.current) return;
      sequenceStarted.current = true;

      // Fade out immediately upon video completion
      const fadeDuration = 700; 
      setOpacity(0);

      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, fadeDuration);
    };

    // Changed from 'play' to 'ended' to ensure the video plays all the way through
    video.addEventListener('ended', startFadeSequence);

    // Playback Logic: Start muted to ensure autoplay works
    video.muted = true; 
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Intro video autoplay failed even with mute.", error);
        // Fallback: if it fails entirely, we still remove the overlay so the site isn't blocked
        startFadeSequence();
      });
    }

    // Safety Fallback: If video takes too long to load or stalls (15s), force exit.
    // Increased duration to ensure we don't cut off a longer intro video.
    const safetyTimer = setTimeout(() => {
      if (!sequenceStarted.current) {
        console.warn("Intro video timed out. Forcing removal.");
        startFadeSequence();
      }
    }, 15000);

    return () => {
      video.removeEventListener('ended', startFadeSequence);
      clearTimeout(safetyTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity ease-out duration-[700ms]`}
      style={{ opacity: opacity / 100 }}
    >
      <video
        ref={videoRef}
        src={INTRO_VIDEO_URL}
        className="w-full h-full object-cover pointer-events-none"
        playsInline
        preload="auto"
        muted={isMuted}
      />

      {/* Mute/Unmute Toggle - Top Right Corner */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-50 p-3 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full transition-all duration-300"
        aria-label={isMuted ? "Unmute Intro" : "Mute Intro"}
      >
        {isMuted ? (
          <MicOff className="w-5 h-5" strokeWidth={1.5} />
        ) : (
          <Mic className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
};