import React, { useEffect, useRef } from 'react';
import { BACKGROUND_VIDEO_URL } from '../constants';

export const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Ensure playback settings are enforced
      videoRef.current.playbackRate = 1.0;
      // Browsers often block unmuted autoplay. We try to play with sound if allowed,
      // but fallback to muted if needed to ensure the visual loop works.
      // The spec asks for sound.
      videoRef.current.muted = false;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay with sound prevented by browser. Fallback to muted.", error);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      }
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-black pointer-events-none select-none">
      <video
        ref={videoRef}
        src={BACKGROUND_VIDEO_URL}
        className="w-full h-full object-cover"
        autoPlay
        loop
        playsInline
      // Note: We attempt unmuted via JS, but the attribute below acts as a fallback for some engines
      // However, 'muted' attribute presence forces mute. We omit it to try for sound, handled in JS.
      />
      {/* Optional overlay to ensure text contrast if video gets too bright, though spec implies full bleed/no dimming. 
          The spec says "no dimming", so we leave it raw. */}
    </div>
  );
};