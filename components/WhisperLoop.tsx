import React, { useEffect, useState } from 'react';
import { TM_PHRASES } from '../constants';

export const WhisperLoop: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Step 1: Fade out
      setFade(false);

      // Step 2: Change text after fade out is mostly done
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % TM_PHRASES.length);
        // Step 3: Fade in
        setFade(true);
      }, 1000); // Wait 1s for fade out (or substantial part of it)
    }, 3000); // Total cycle time ~3s (2s hold + 1s transition approx)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      <h2 
        className={`
          text-4xl md:text-6xl lg:text-8xl font-bold text-white 
          tracking-tighter uppercase text-center px-4
          transition-opacity duration-[1000ms] ease-in-out
          ${fade ? 'opacity-20' : 'opacity-0'}
        `}
        style={{ 
          textShadow: '0 0 20px rgba(255,255,255,0.3)',
          maxWidth: '90%'
        }}
      >
        {TM_PHRASES[index]}
      </h2>
    </div>
  );
};