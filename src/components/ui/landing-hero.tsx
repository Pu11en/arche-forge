import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
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
      initial={reducedMotion ? { opacity: 1 } : "hidden"} // Start hidden to prevent flash
      animate={reducedMotion ? { opacity: 1 } : (initialVisibility ? "visible" : "hidden")}
      variants={reducedMotion ? undefined : containerVariants}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
      style={style}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-0"></div>
      
      {/* Overlay for improved text readability */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      
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
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}
        >
          Forge Your Legacy
        </motion.h1>
        
        {/* Subheading */}
        <motion.p
          variants={reducedMotion ? undefined : itemVariants}
          initial={reducedMotion ? { opacity: 1 } : undefined}
          animate={reducedMotion ? { opacity: 1 } : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: '500',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          Today's AI interactions lack soul. Ditch the robotic scripts that break the connection. 
          Our goal is to mirror your identity, making AI feel less like a tool and more like you.
        </motion.p>
        
        {/* CTA Button */}
        <motion.div
          variants={reducedMotion ? undefined : itemVariants}
          initial={reducedMotion ? { opacity: 1 } : undefined}
          animate={reducedMotion ? { opacity: 1 } : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          className="mt-4"
        >
          <Button
            size="xl"
            variant="linkedin"
            onClick={onCTAClick}
            className="min-h-[44px] min-w-[44px] text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4"
            aria-label="Get started with ZTA"
          >
            ZTA
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { LandingHero };