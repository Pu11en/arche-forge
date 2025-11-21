import React from 'react';
import { Twitter, Instagram, Linkedin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer 
      className="fixed bottom-0 left-0 z-30 w-full h-[70px] flex items-center justify-center pointer-events-auto"
    >
      {/* Brushed steel background layer */}
      <div className="absolute inset-0 opacity-10 brushed-steel pointer-events-none" />
      
      {/* Icons Container */}
      <div className="relative z-10 flex items-center space-x-8 opacity-80">
        {/* Using Lucide icons as black silhouettes per spec */}
        <a href="#" className="text-black hover:text-white transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          <Twitter fill="currentColor" className="w-6 h-6" strokeWidth={0} />
        </a>
        <a href="#" className="text-black hover:text-white transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          <Instagram className="w-6 h-6" strokeWidth={2} />
        </a>
        <a href="#" className="text-black hover:text-white transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          <Linkedin fill="currentColor" className="w-6 h-6" strokeWidth={0} />
        </a>
        <a href="#" className="text-black hover:text-white transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          <Globe className="w-6 h-6" strokeWidth={2} />
        </a>
      </div>
    </footer>
  );
};