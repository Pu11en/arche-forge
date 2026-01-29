import React, { useEffect, useRef, useState } from 'react';
import { INTRO_VIDEO_URL } from '../constants';

export const IntroOverlay: React.FC = () => {
  const [opacity, setOpacity] = useState(100);
  const [visible, setVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted per request
  const [videoSrc, setVideoSrc] = useState(INTRO_VIDEO_URL);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sequenceStarted = useRef(false);

  useEffect(() => {
    const updateVideoSource = () => {
      if (window.matchMedia('(max-width: 768px)').matches) {
        setVideoSrc("https://res.cloudinary.com/djg0pqts6/video/upload/v1764091352/kling_20251117_Image_to_Video_The__camer_2081_1_pyvovf.mp4");
      } else {
        setVideoSrc(INTRO_VIDEO_URL);
      }
    };

    updateVideoSource();
    window.addEventListener('resize', updateVideoSource);
    return () => window.removeEventListener('resize', updateVideoSource);
  }, []);

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

    // Reset sequence state for new video source
    sequenceStarted.current = false;

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
  }, [videoSrc]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity ease-out duration-[700ms]`}
      style={{ opacity: opacity / 100 }}
    >
      <video
        key={videoSrc}
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover pointer-events-none"
        playsInline
        preload="auto"
        muted={isMuted}
      />
    </div>
  );
};