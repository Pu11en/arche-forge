import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrademarkPhrase, PHRASE_DISPLAY_DURATION, PHRASE_OPACITY } from "../../data/trademark-phrases";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface TrademarkPhraseOverlayProps {
  isVisible: boolean;
  phrases: TrademarkPhrase[];
  className?: string;
}

/**
 * Overlay component that rotates through trademark phrases with fade animations
 */
export const TrademarkPhraseOverlay = ({
  isVisible,
  phrases,
  className = ""
}: TrademarkPhraseOverlayProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  // Rotate through phrases
  useEffect(() => {
    if (!isVisible || phrases.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, PHRASE_DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, [isVisible, phrases.length]);

  // Get current phrase
  const currentPhrase = phrases[currentPhraseIndex] || phrases[0];

  // Animation variants
  const phraseVariants = {
    hidden: { 
      opacity: 0,
      scale: reducedMotion ? 1 : 0.95
    },
    visible: { 
      opacity: PHRASE_OPACITY,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0 : 0.3,
        ease: "easeInOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: reducedMotion ? 1 : 1.05,
      transition: {
        duration: reducedMotion ? 0 : 0.2,
        ease: "easeInOut"
      }
    }
  };

  if (!isVisible || !currentPhrase) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center pointer-events-none ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhraseIndex}
          variants={phraseVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="text-center max-w-4xl mx-auto px-4 w-full flex items-center justify-center"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <p
            className="text-white font-medium tracking-wide w-full"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.4,
              fontWeight: '600',
              letterSpacing: '0.06em',
              whiteSpace: 'pre-wrap',
              textAlign: 'center'
            }}
          >
            {currentPhrase.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};