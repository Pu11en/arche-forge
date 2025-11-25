import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TM_PHRASES } from '../constants';
import { cn } from '../lib/utils';

interface HeroSectionProps {
  onEnter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onEnter }) => {
  // Time tracking logic
  const startTime = useRef<number>(performance.now());

  // Trademark rotation logic
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
      }, 800);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleEnterClick = () => {
    const endTime = performance.now();
    const timeSpentMs = endTime - startTime.current;

    console.log("Time spent on landing:", timeSpentMs / 1000, "seconds");

    // Analytics event if gtag exists
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag("event", "time_to_enter_forge", {
        value: Math.round(timeSpentMs / 1000)
      });
    }

    console.log("User entering the forge...");
    onEnter();
  };

  return (
    <div
      className="relative h-screen w-full flex flex-col items-center justify-center text-center pointer-events-none z-20"
    >
      <div
        className="flex flex-col items-center justify-center w-full max-w-7xl px-4"
      >

        {/* Top Line: Inter - Increased size */}
        <h2
          className="font-inter text-white text-2xl md:text-5xl lg:text-6xl font-bold tracking-wide leading-none mb-3 opacity-90 z-10"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}
        >
          Today’s AI answers. We remember.
        </h2>

        {/* Middle: Rotating Trademarks (Koulen) - Reduced size */}
        {/* Adjusted height for wrapping on mobile */}
        <div className="h-20 md:h-20 lg:h-24 flex items-center justify-center overflow-visible w-full relative z-0 px-4">
          <span
            className={`
               font-koulen text-orange-500
               text-3xl md:text-6xl lg:text-7xl
               tracking-wider uppercase
               transition-opacity duration-[800ms] ease-in-out
               leading-tight md:leading-none
               text-center
               ${fade ? 'opacity-100' : 'opacity-0'}
             `}
            style={{
              textShadow: '0 0 30px rgba(249, 115, 22, 0.4)',
              whiteSpace: 'normal',
              maxWidth: '90%'
            }}
          >
            {TM_PHRASES[index]}
          </span>
        </div>

        {/* Bottom Line: Inter - Increased size */}
        <p
          className="font-inter text-white/80 text-lg md:text-3xl font-light tracking-wide mb-12 max-w-5xl leading-tight z-10 mt-3"
        >
          SoulPrint makes AI feel less like a tool and more like you.
        </p>

        {/* CTA Button - Pointer events re-enabled */}
        <button
          id="enterForgeBtn"
          onClick={handleEnterClick}
          className="group pointer-events-auto flex items-center gap-3 px-10 py-4 text-white border border-white/20 bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all duration-300 ease-out hover:scale-105"
        >
          <span className="font-inter text-sm md:text-base tracking-[0.2em] uppercase font-semibold">Enter The Forge</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

      </div>
    </div>
  );
};
