import { useState, useEffect, useRef } from "react";
import { TrademarkPhraseOverlay } from "./trademark-phrase-overlay";
import { TRADEMARK_PHRASES } from "../../data/trademark-phrases";
import { SocialMediaIcons } from "./social-media-icons";

interface LandingPageProps {
  onEnterForge?: () => void;
}

/**
 * Archetypal Landing Page
 * 
 * Layer structure (bottom to top):
 * 1. Background video (bull breathing loop) - full bleed, continuous, with sound
 * 2. TM Loop overlay - rotating phrases, low opacity
 * 3. Intro overlay - logo flash with anvil sound, fades out
 * 4. Hero copy - floating text
 * 5. CTA button - "ENTER THE FORGE →" with time tracking
 * 6. Footer - social media icons
 */
export const LandingPage = ({ onEnterForge }: LandingPageProps) => {
  // State management
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [startTime] = useState(() => performance.now());
  
  // Refs
  const bullVideoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);

  // Handle intro video completion
  useEffect(() => {
    const introVideo = introVideoRef.current;
    if (!introVideo) return;

    const handleEnded = () => {
      console.log("[LandingPage] Intro video ended");
      setShowIntro(false);
      setShowContent(true);
    };

    const handleCanPlay = () => {
      console.log("[LandingPage] Intro video can play");
      introVideo.play().catch((error) => {
        console.warn("[LandingPage] Intro video autoplay failed:", error);
      });
    };

    introVideo.addEventListener("ended", handleEnded);
    introVideo.addEventListener("canplay", handleCanPlay);
    
    return () => {
      introVideo.removeEventListener("ended", handleEnded);
      introVideo.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Start playing bull video immediately (muted first, then unmute after intro)
  useEffect(() => {
    const bullVideo = bullVideoRef.current;
    if (bullVideo) {
      // Start muted to comply with autoplay policies
      bullVideo.muted = true;
      bullVideo.play().catch((error) => {
        console.warn("[LandingPage] Bull video autoplay failed:", error);
      });
    }
  }, []);

  // Unmute bull video after intro completes
  useEffect(() => {
    if (showContent && !showIntro) {
      const bullVideo = bullVideoRef.current;
      if (bullVideo) {
        // Unmute the bull video after intro
        bullVideo.muted = false;
      }
    }
  }, [showContent, showIntro]);

  // Handle CTA click with time tracking
  const handleCTAClick = () => {
    const timeSpentMs = performance.now() - startTime;
    console.log("Time spent on landing:", timeSpentMs / 1000, "seconds");

    // Send to analytics if available
    if (window.gtag) {
      window.gtag("event", "time_to_enter_forge", {
        value: Math.round(timeSpentMs / 1000)
      });
    }

    // Callback for navigation
    if (onEnterForge) {
      onEnterForge();
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Layer 1: Background Video - Bull Breathing Loop */}
      <div className="absolute inset-0 z-0">
        <video
          ref={bullVideoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
          loop
          muted
          playsInline
          autoPlay
          preload="auto"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Layer 2: TM Loop Overlay - Always visible after intro */}
      {showContent && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <TrademarkPhraseOverlay
            isVisible={true}
            phrases={TRADEMARK_PHRASES}
          />
        </div>
      )}

      {/* Layer 3: Intro Overlay - Logo flash with anvil sound */}
      {showIntro && (
        <div
          className="absolute inset-0 z-20 bg-black transition-opacity duration-700"
          style={{
            opacity: showIntro ? 1 : 0
          }}
        >
          <video
            ref={introVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
            muted={false}
            playsInline
            autoPlay
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Layer 4: Hero Copy - Floating above everything */}
      {showContent && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1
              className="text-white font-medium leading-tight mb-2"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.02), 0 4px 12px rgba(0, 0, 0, 0.9)',
                fontWeight: '500',
                lineHeight: 1.3,
                letterSpacing: '0.02em'
              }}
            >
              Today's AI answers. We remember.
            </h1>
            <p
              className="text-white font-medium"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.02), 0 4px 12px rgba(0, 0, 0, 0.9)',
                fontWeight: '400',
                lineHeight: 1.4,
                letterSpacing: '0.01em'
              }}
            >
              SoulPrint makes AI feel less like a tool and more like you.
            </p>
          </div>
        </div>
      )}

      {/* Layer 5: CTA Button - Centered below hero */}
      {showContent && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="absolute bottom-[20vh]">
            <button
              id="enterForgeBtn"
              onClick={handleCTAClick}
              className="group relative px-8 py-4 bg-transparent text-white font-medium tracking-wider uppercase border-2 border-white transition-all duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30 pointer-events-auto"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                letterSpacing: '0.1em',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label="Enter the Forge"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                ENTER THE FORGE
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Layer 6: Footer - Social Media Icons */}
      {showContent && (
        <div
          className="absolute bottom-0 left-0 right-0 z-50"
          style={{
            height: '70px',
            background: 'linear-gradient(to top, rgba(192, 192, 192, 0.1), transparent)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="flex items-center justify-center h-full">
            <SocialMediaIcons />
          </div>
        </div>
      )}
    </div>
  );
};

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params: any) => void;
  }
}
