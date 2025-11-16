import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface TMPhrase {
  text: string;
  id: number;
}

const TM_PHRASES: TMPhrase[] = [
  { id: 1, text: "Forge Your Digital Legacy" },
  { id: 2, text: "Where AI Meets Humanity" },
  { id: 3, text: "Crafting Tomorrow's Intelligence" },
  { id: 4, text: "SoulPrint: Your AI Echo" },
  { id: 5, text: "Remember the Human Touch" },
  { id: 6, text: "AI That's Truly You" },
  { id: 7, text: "Beyond Code, Beyond Algorithms" },
  { id: 8, text: "Personalized AI Evolution" },
  { id: 9, text: "The Forge of Consciousness" },
  { id: 10, text: "Echoes of Your Digital Self" },
  { id: 11, text: "AI That Remembers" },
  { id: 12, text: "Crafting Intelligence with Soul" },
  { id: 13, text: "Your AI, Your Reflection" },
  { id: 14, text: "The Human-AI Convergence" },
  { id: 15, text: "Soulful Artificial Minds" },
  { id: 16, text: "Digital Identity Forged" },
  { id: 17, text: "AI Beyond Imitation" },
  { id: 18, text: "Personal Evolution Engine" },
  { id: 19, text: "The Conscious AI Forge" },
  { id: 20, text: "Your Digital Soul Companion" },
  { id: 21, text: "AI That Understands Humanity" },
  { id: 22, text: "Forging Digital Consciousness" },
  { id: 23, text: "SoulPrint Revolution" },
  { id: 24, text: "Human-Centric AI Design" },
  { id: 25, text: "The Memory of Machines" },
  { id: 26, text: "AI That Feels Human" },
  { id: 27, text: "Digital Soul Crafting" },
  { id: 28, text: "Consciousness in Code" },
  { id: 29, text: "Your AI Reflection" },
  { id: 30, text: "The Forge of Digital Souls" },
  { id: 31, text: "AI Personalization Mastery" },
  { id: 32, text: "Human-AI Symbiosis" },
  { id: 33, text: "Digital Identity Evolution" },
  { id: 34, text: "Soulful Technology" },
  { id: 35, text: "AI That Remembers You" },
  { id: 36, text: "The Conscious Forge" },
  { id: 37, text: "Digital Soul Engineering" },
  { id: 38, text: "AI Humanity Bridge" },
  { id: 39, text: "Your Personal AI Forge" },
  { id: 40, text: "Conscious Digital Crafting" },
  { id: 41, text: "SoulPrint Innovation" },
  { id: 42, text: "Human-AI Integration" },
  { id: 43, text: "Digital Soul Preservation" },
  { id: 44, text: "AI Personal Evolution" },
  { id: 45, text: "The Soulful Algorithm" },
  { id: 46, text: "Conscious AI Creation" },
  { id: 47, text: "Your Digital Legacy Builder" },
  { id: 48, text: "AI Soul Crafting" },
  { id: 49, text: "Human Memory in AI" },
  { id: 50, text: "The Forge of Digital Humanity" }
];

// Timing constants for the TM loop
const TRANSITION_DURATION = 1.75; // seconds (average of 1.5-2s range)
const DISPLAY_DURATION = 1.75; // seconds
const TOTAL_CYCLE = TRANSITION_DURATION + DISPLAY_DURATION;

export interface TMLoopProps {
  /** Whether the TM loop should be visible */
  isVisible?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const TMLoop: React.FC<TMLoopProps> = ({
  isVisible = true,
  className = ""
}) => {
  const reducedMotion = useReducedMotion();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (!isVisible || reducedMotion) return;

    const interval = setInterval(() => {
      // Advance to next phrase
      setCurrentPhraseIndex((prev) => (prev + 1) % TM_PHRASES.length);
    }, TOTAL_CYCLE * 1000);

    return () => clearInterval(interval);
  }, [isVisible, reducedMotion]);

  if (!isVisible) return null;

  const currentPhrase = TM_PHRASES[currentPhraseIndex];

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-5 ${className}`}
      style={{
        opacity: 0.15, // Low opacity as top layer
      }}
    >
      <div className="flex items-center justify-center h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            transition={{
              duration: reducedMotion ? 0 : TRANSITION_DURATION,
              ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
            }}
            className="text-center"
          >
            <p
              className="text-white font-medium text-lg sm:text-xl md:text-2xl tracking-wide"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                maxWidth: '600px',
                lineHeight: '1.4'
              }}
            >
              {currentPhrase.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export { TMLoop };