import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface TMPhrase {
  text: string;
  id: number;
}

const TM_PHRASES: TMPhrase[] = [
  { id: 1, text: "Bye-Bye Bitches™" },
  { id: 2, text: "YFKI™" },
  { id: 3, text: "Let the Tags Testify™" },
  { id: 4, text: "Tag Your Truth™" },
  { id: 5, text: "Tag Your Trauma™" },
  { id: 6, text: "Tag Your Triumph™" },
  { id: 7, text: "Tag Your Temptation™" },
  { id: 8, text: "Tag Your Taboo™" },
  { id: 9, text: "Tag Your Transcendence™" },
  { id: 10, text: "Tag Your Transformation™" },
  { id: 11, text: "Tag Your Technology™" },
  { id: 12, text: "Tag Your Tomorrow™" },
  { id: 13, text: "Tag Your Tenacity™" },
  { id: 14, text: "Tag Your Talent™" },
  { id: 15, text: "Tag Your Target™" },
  { id: 16, text: "Tag Your Territory™" },
  { id: 17, text: "Tag Your Temerity™" },
  { id: 18, text: "Tag Your Testimony™" },
  { id: 19, text: "Tag Your Thesis™" },
  { id: 20, text: "Tag Your Theory™" },
  { id: 21, text: "Tag Your Therapy™" },
  { id: 22, text: "Tag Your Thirst™" },
  { id: 23, text: "Tag Your Thought™" },
  { id: 24, text: "Tag Your Thrill™" },
  { id: 25, text: "Tag Your Threat™" },
  { id: 26, text: "Tag Your Threshold™" },
  { id: 27, text: "Tag Your Throe™" },
  { id: 28, text: "Tag Your Time™" },
  { id: 29, text: "Tag Your Title™" },
  { id: 30, text: "Tag Your Token™" },
  { id: 31, text: "Tag Your Torment™" },
  { id: 32, text: "Tag Your Torsion™" },
  { id: 33, text: "Tag Your Totem™" },
  { id: 34, text: "Tag Your Touch™" },
  { id: 35, text: "Tag Your Traction™" },
  { id: 36, text: "Tag Your Trade™" },
  { id: 37, text: "Tag Your Tradition™" },
  { id: 38, text: "Tag Your Tragedy™" },
  { id: 39, text: "Tag Your Trail™" },
  { id: 40, text: "Tag Your Trait™" },
  { id: 41, text: "Tag Your Transaction™" },
  { id: 42, text: "Tag Your Transgression™" },
  { id: 43, text: "Tag Your Transit™" },
  { id: 44, text: "Tag Your Transition™" },
  { id: 45, text: "Tag Your Translation™" },
  { id: 46, text: "Tag Your Transmission™" },
  { id: 47, text: "Tag Your Transport™" },
  { id: 48, text: "Tag Your Trauma™" },
  { id: 49, text: "Tag Your Travel™" },
  { id: 50, text: "Tag Your Tread™" },
  { id: 51, text: "Tag Your Treatment™" },
  { id: 52, text: "Tag Your Tremor™" },
  { id: 53, text: "Tag Your Trend™" },
  { id: 54, text: "Tag Your Trial™" },
  { id: 55, text: "Tag Your Tribe™" },
  { id: 56, text: "Tag Your Truce™" },
  { id: 57, text: "Tag Your Trust™" },
  { id: 58, text: "Tag Your Truth™" },
  { id: 59, text: "Tag Your Tweak™" },
  { id: 60, text: "Tag Your Tyranny™" }
];

// Timing constants for the TM loop
const TRANSITION_DURATION = 1.0; // seconds (fade in/out)
const DISPLAY_DURATION = 1.0; // seconds (display time)
const TOTAL_CYCLE = TRANSITION_DURATION + DISPLAY_DURATION; // 2 seconds total

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
      className={`absolute top-0 left-0 right-0 pointer-events-none z-10 ${className}`}
      style={{
        paddingTop: '2rem', // Position at top of screen
        opacity: 0.15, // Low opacity as specified
      }}
    >
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : TRANSITION_DURATION,
              ease: "easeInOut"
            }}
            className="text-center"
          >
            <p
              className="text-white font-medium text-sm sm:text-base tracking-wide"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                maxWidth: '90vw',
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