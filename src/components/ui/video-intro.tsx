import React, { useEffect, useRef } from "react";

export interface VideoIntroProps {
  onVideoEnd: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    
    if (video) {
      // Set up the event listener for when the video ends
      const handleVideoEnd = () => {
        onVideoEnd();
      };
      
      video.addEventListener('ended', handleVideoEnd);
      
      // Clean up the event listener when the component unmounts
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [onVideoEnd]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        src="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
      />
    </div>
  );
};

export { VideoIntro };