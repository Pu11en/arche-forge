import { SocialMediaIcons } from "./social-media-icons";
import { SignatureGallery } from "./signature-gallery";

/**
 * Hero component that displays the main content after the loading overlay
 */
const Hero = () => {
  return (
    <div className="relative z-20 container mx-auto py-20 lg:py-32 flex items-center justify-center flex-col gap-3 min-h-screen">
      {/* Logo */}
      <div className="text-center max-w-5xl mx-auto px-4">
        <div className="flex justify-center mb-4">
          <img
            src="https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.png"
            alt="ARCHE FORGE"
            className="max-w-full h-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{
              width: 'clamp(200px, 50vw, 400px)',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
        
        {/* Description */}
        <div className="max-w-3xl mx-auto mt-4">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed tracking-tight text-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]" style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '500' }}>
            Today's AI interactions lack soul.<br className="hidden sm:block" />
            Ditch the robotic scripts that break the connection. Our goal is to mirror<br className="hidden sm:block" />
            your identity, making AI feel less like a tool and more like you.
          </p>
        </div>
      </div>
      
      {/* Social Media Icons */}
      <div className="mt-4 mb-4">
        <SocialMediaIcons />
      </div>

      {/* Signature gallery linking back to archaforge.com */}
      <SignatureGallery />
    </div>
  );
};

export { Hero };