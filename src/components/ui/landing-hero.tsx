import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { TMLoop } from "./tm-loop";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export interface LandingHeroProps {
  /** Whether the hero section should be initially hidden and revealed after video */
  initialVisibility?: boolean;
  /** Optional className for additional styling */
  className?: string;
  /** Optional callback when the CTA button is clicked */
  onCTAClick?: () => void;
  /** Optional style prop for additional styling */
  style?: React.CSSProperties;
}

const LandingHero: React.FC<LandingHeroProps> = ({
  initialVisibility = false,
  className = "",
  onCTAClick,
  style
}) => {
  const reducedMotion = useReducedMotion();

  // Time tracking script
  useEffect(() => {
    const startTime = performance.now();

    const button = document.getElementById("enterForgeBtn");
    if (button) {
      const handleClick = () => {
        const timeSpentMs = performance.now() - startTime;
        console.log("Time spent on landing:", timeSpentMs / 1000, "seconds");

        // Optional: send to analytics
        if ((window as any).gtag) {
          (window as any).gtag("event", "time_to_enter_forge", {
            value: Math.round(timeSpentMs / 1000)
          });
        }
      };

      button.addEventListener("click", handleClick);

      return () => {
        button.removeEventListener("click", handleClick);
      };
    }
  }, []);

  // Animation variants for the hero section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0 : 0.8,
        staggerChildren: reducedMotion ? 0 : 0.2,
        delayChildren: reducedMotion ? 0 : 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={`relative w-full h-screen overflow-hidden flex items-center justify-center ${className}`}
      initial={reducedMotion ? { opacity: 1 } : "hidden"}
      animate={reducedMotion ? { opacity: 1 } : (initialVisibility ? "visible" : "hidden")}
      variants={reducedMotion ? undefined : containerVariants}
      transition={reducedMotion ? { duration: 0 } : { duration: 1.0, ease: "easeOut" }}
      style={{
        ...style,
        backgroundColor: '#000000' // Ensure black background to prevent white flash
      }}
    >
      {/* Background gradient - subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-0"></div>
      
      {/* TM Loop - Positioned at bottom with trademark styling */}
      <TMLoop isVisible={initialVisibility} className="z-5" />
      
      {/* Content container */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full text-center">
        {/* Logo */}
        <motion.div
          variants={reducedMotion ? undefined : itemVariants}
          initial={reducedMotion ? { opacity: 1 } : undefined}
          animate={reducedMotion ? { opacity: 1 } : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="mb-6 sm:mb-8"
        >
          <img
            src="https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png"
            alt="ARCHE FORGE"
            className="max-w-full h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            style={{
              width: 'clamp(180px, 40vw, 320px)',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </motion.div>
        
        {/* Primary heading */}
        <motion.h1
          variants={reducedMotion ? undefined : itemVariants}
          initial={reducedMotion ? { opacity: 1 } : undefined}
          animate={reducedMotion ? { opacity: 1 } : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="text-white mb-4 leading-tight"
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 600,
            textShadow: '0 0 8px rgba(255,255,255,0.02)',
            maxWidth: '90%'
          }}
        >
          Today's AI answers. We remember.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={reducedMotion ? undefined : itemVariants}
          initial={reducedMotion ? { opacity: 1 } : undefined}
          animate={reducedMotion ? { opacity: 1 } : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="text-white mb-8 max-w-3xl mx-auto"
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 400,
            textShadow: '0 0 8px rgba(255,255,255,0.02)',
            maxWidth: '90%'
          }}
        >
          SoulPrint makes AI feel less like a tool and more like you.
        </motion.p>
        
        {/* CTA Button */}
        <motion.div
          variants={reducedMotion ? undefined : itemVariants}
          initial={reducedMotion ? { opacity: 1 } : undefined}
          animate={reducedMotion ? { opacity: 1 } : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="mt-4"
        >
          <button
            id="enterForgeBtn"
            onClick={onCTAClick}
            className="min-h-[44px] min-w-[44px] transition-all duration-300 group"
            style={{
              position: 'relative',
              padding: '18px 36px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              zIndex: 3
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
              const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
              if (arrow) {
                arrow.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
              const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
              if (arrow) {
                arrow.style.transform = 'translateX(0px)';
              }
            }}
            aria-label="Enter the Forge"
          >
            ENTER THE FORGE <span className="arrow inline-block transition-transform duration-300">→</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { LandingHero };