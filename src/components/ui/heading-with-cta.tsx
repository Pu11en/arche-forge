interface HeadingWithCTAProps {
  isVisible: boolean;
  onCTAClick: () => void;
  className?: string;
}

/**
 * Component that displays the main heading and CTA button with fade-in animation
 */
export const HeadingWithCTA = ({
  isVisible,
  onCTAClick,
  className = ""
}: HeadingWithCTAProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 ${className}`}>
      {/* Center-aligned vertical stack for hero elements */}
      <div className="fixed inset-0 flex flex-col items-center justify-center">
        {/* Heading and Subheading at the top */}
        <div className="absolute top-[15%] left-0 right-0 transform transition-all duration-700 opacity-100 translate-y-0">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1
              className="text-white font-medium leading-tight mb-4"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5)',
                fontWeight: '500',
                lineHeight: 1.3,
                letterSpacing: '0.02em'
              }}
            >
              Today's AI answers we remember—<br className="hidden sm:block" />
              Soul Print makes AI feel less like a tool and more like you.
            </h1>
          </div>
        </div>

        {/* Enter the Forge at the bottom */}
        <div className="absolute bottom-[15%] left-0 right-0 transform transition-all duration-700 opacity-100 translate-y-0">
          <div className="text-center">
            <button
              onClick={onCTAClick}
              className="relative px-8 py-4 bg-transparent text-white font-medium tracking-wider uppercase border-2 border-white transition-all duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30 pointer-events-auto"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                letterSpacing: '0.1em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label="Enter the Forge You"
            >
              <span className="relative z-10">Enter the Forge You</span>
              
              {/* Subtle glow effect on hover */}
              <div
                className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-10"
                style={{
                  filter: 'blur(8px)',
                  transform: 'scale(1.2)'
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};