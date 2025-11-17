import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export interface HeroTextProps {
  /** Whether the hero text should be visible */
  isVisible?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const HeroText: React.FC<HeroTextProps> = ({
  isVisible = false,
  className = ""
}) => {
  const reducedMotion = useReducedMotion();
  const [showText, setShowText] = useState(false);

  // Delay showing text for 1-2 seconds after visibility changes
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowText(true);
      }, reducedMotion ? 0 : 1500); // 1.5 second delay as specified
      
      return () => clearTimeout(timer);
    } else {
      setShowText(false);
    }
  }, [isVisible, reducedMotion]);

  // Animation variants for the text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0 : 1.0,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: reducedMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.8,
        ease: "easeOut"
      }
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 ${className}`}
      style={{
        backgroundColor: 'transparent' // Transparent background
      }}
      initial="hidden"
      animate={showText ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Text container with no background */}
      <div className="text-center px-4">
        <motion.h1
          variants={textVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tight"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.3)',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' // Subtle glow effect
          }}
        >
          Today's AI answers. We remember.
        </motion.h1>

        <motion.p
          variants={textVariants}
          transition={{
            delay: reducedMotion ? 0 : 0.3
          }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white leading-relaxed"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: '500',
            textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.25)',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' // Subtle glow effect
          }}
        >
          SoulPrint makes AI feel less like a tool and more like you.
        </motion.p>
      </div>
    </motion.div>
  );
};

export { HeroText };