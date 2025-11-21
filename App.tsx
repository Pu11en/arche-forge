import React from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { IntroOverlay } from './components/IntroOverlay';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Layer 1: Background Video (The Bull) - Z-Index 0 */}
      <BackgroundVideo />

      {/* Layer 2: Main Hero Content (Includes Trademarks) - Z-Index 20 */}
      <HeroSection />

      {/* Layer 3: Footer - Z-Index 30 */}
      <Footer />

      {/* Layer 4: Intro Overlay (Flash) - Z-Index 50 */}
      <IntroOverlay />
    </main>
  );
};

export default App;