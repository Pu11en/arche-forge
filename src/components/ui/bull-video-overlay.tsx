import { useEffect, useRef, useState } from "react";

interface BullVideoOverlayProps {
  videoUrl: string;
  isVisible: boolean;
  opacity: number;
  onVideoReady: () => void;
  onVideoError: (error: Error) => void;
  videoElement?: HTMLVideoElement | null; // Preloaded video element
}

/**
 * Bull video overlay component that renders with GPU acceleration
 * and proper z-index layering (z-25)
 */
export const BullVideoOverlay = ({
  videoUrl,
  isVisible,
  opacity,
  onVideoReady,
  onVideoError,
  videoElement
}: BullVideoOverlayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoState, setVideoState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isVideoAttached, setIsVideoAttached] = useState(false);

  // Use preloaded video element if provided, otherwise create a new one
  useEffect(() => {
    if (videoElement && containerRef.current && !isVideoAttached) {
      console.log('[BullVideoOverlay] Using preloaded video element');
      
      // Set video attributes for overlay display
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.loop = false;
      videoElement.playsInline = true;
      
      // Move video element to our container
      containerRef.current.appendChild(videoElement);
      setIsVideoAttached(true);
      
      // Set video state based on current element state
      if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
        console.log('[BullVideoOverlay] Preloaded video is ready');
        setVideoState('ready');
        onVideoReady();
      } else {
        console.log('[BullVideoOverlay] Preloaded video still loading');
        setVideoState('loading');
        
        const handleCanPlayThrough = () => {
          console.log('[BullVideoOverlay] Preloaded video can play through');
          setVideoState('ready');
          onVideoReady();
        };
        
        const handleError = (e: Event) => {
          const mediaError = (e.target as HTMLVideoElement).error;
          const error = mediaError
            ? new Error(`Bull video error: ${mediaError.message || mediaError.code}`)
            : new Error('Unknown bull video error');
          
          console.error('[BullVideoOverlay] Video error:', error);
          setVideoState('error');
          onVideoError(error);
        };
        
        videoElement.addEventListener('canplaythrough', handleCanPlayThrough);
        videoElement.addEventListener('error', handleError);
        
        return () => {
          videoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
          videoElement.removeEventListener('error', handleError);
        };
      }
    }
  }, [videoElement, onVideoReady, onVideoError, isVideoAttached]);

  // Handle play/pause based on visibility
  useEffect(() => {
    const video = videoElement;
    if (!video) return;

    if (isVisible) {
      // Try to play when video is ready
      if (videoState === 'ready') {
        video.play().catch(error => {
          console.warn('[BullVideoOverlay] Play failed:', error);
        });
      }
    } else {
      video.pause();
      // Reset video to beginning when hidden
      video.currentTime = 0;
    }
  }, [isVisible, videoState, videoElement]);
  
  // Ensure video plays when it becomes visible and ready
  useEffect(() => {
    const video = videoElement;
    if (!video || !isVisible || videoState !== 'ready') return;
    
    // Double-check video is playing
    if (video.paused) {
      console.log('[BullVideoOverlay] Attempting to play video');
      video.play().catch(error => {
        console.warn('[BullVideoOverlay] Play attempt failed:', error);
      });
    }
  }, [isVisible, videoState, videoElement]);

  // GPU accelerated styles
  const gpuAcceleratedStyles = {
    transform: 'translateZ(0)',
    willChange: 'opacity, transform',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-25"
      style={{
        opacity,
        display: isVisible ? 'block' : 'none',
        ...gpuAcceleratedStyles
      }}
    >
      {videoElement ? (
        <video
          className="w-full h-full object-cover"
          style={{
            ...gpuAcceleratedStyles,
            backgroundColor: '#000000'
          }}
          muted
          playsInline
          autoPlay
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div>Loading bull video...</div>
          </div>
        </div>
      )}
    </div>
  );
};