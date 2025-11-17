import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface TMPhrase {
  text: string;
  id: number;
}

const TM_PHRASES: TMPhrase[] = [
  { id: 1, text: "Forged in fire" },
  { id: 2, text: "Made to remember" },
  { id: 3, text: "AI with soul" },
  { id: 4, text: "Crafted with purpose" },
  { id: 5, text: "Beyond the algorithm" },
  { id: 6, text: "Intelligence that listens" },
  { id: 7, text: "Your digital echo" },
  { id: 8, text: "Memory meets machine" },
  { id: 9, text: "Built for humanity" },
  { id: 10, text: "The conscious forge" },
  { id: 11, text: "AI that evolves" },
  { id: 12, text: "Personalized intelligence" },
  { id: 13, text: "Digital soul crafting" },
  { id: 14, text: "Where code meets character" },
  { id: 15, text: "Your AI companion" },
  { id: 16, text: "Forging connections" },
  { id: 17, text: "Intelligence with identity" },
  { id: 18, text: "The human touch" },
  { id: 19, text: "AI that adapts" },
  { id: 20, text: "Soulful technology" },
  { id: 21, text: "Digital legacy builder" },
  { id: 22, text: "Consciousness in code" },
  { id: 23, text: "Your reflection" },
  { id: 24, text: "The memory keeper" },
  { id: 25, text: "AI that understands" },
  { id: 26, text: "Crafted intelligence" },
  { id: 27, text: "Beyond automation" },
  { id: 28, text: "The forge of tomorrow" },
  { id: 29, text: "Intelligence reimagined" },
  { id: 30, text: "Your digital twin" },
  { id: 31, text: "AI with awareness" },
  { id: 32, text: "Personalized evolution" },
  { id: 33, text: "The soul of AI" },
  { id: 34, text: "Memory in motion" },
  { id: 35, text: "Crafted for you" },
  { id: 36, text: "Intelligence that grows" },
  { id: 37, text: "Digital consciousness" },
  { id: 38, text: "The human algorithm" },
  { id: 39, text: "AI that cares" },
  { id: 40, text: "Forged with intention" },
  { id: 41, text: "Your intelligent partner" },
  { id: 42, text: "Beyond the machine" },
  { id: 43, text: "The evolution engine" },
  { id: 44, text: "AI that resonates" },
  { id: 45, text: "Digital soul keeper" },
  { id: 46, text: "Intelligence with heart" },
  { id: 47, text: "Your AI essence" },
  { id: 48, text: "The forge of identity" },
  { id: 49, text: "Memory transformed" },
  { id: 50, text: "AI that's truly yours" }
];

// Timing constants for the TM loop
const TRANSITION_DURATION = 0.6; // seconds for fade transition
const DISPLAY_DURATION = 1.4; // seconds for display
const TOTAL_CYCLE = 2.0; // Total cycle time: 2 seconds as specified

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
      className={`fixed bottom-0 left-0 right-0 pointer-events-none ${className}`}
      style={{
        zIndex: 1,
        paddingBottom: '30px',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhrase.id}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : TRANSITION_DURATION,
            ease: "easeOut"
          }}
          style={{
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '0.875rem',
            letterSpacing: '0.05em'
          }}
        >
          {currentPhrase.text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export { TMLoop };