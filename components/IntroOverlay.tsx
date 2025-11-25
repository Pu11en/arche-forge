import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
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
    aria - label={ isMuted ? "Unmute Intro" : "Mute Intro" }
      >
      {
        isMuted?(
          <MicOff className = "w-5 h-5" strokeWidth = { 1.5} />
        ): (
            <Mic className = "w-5 h-5" strokeWidth = { 1.5 } />
        )}
      </button >
    </div >
  );
};