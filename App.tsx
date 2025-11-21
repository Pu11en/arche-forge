import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BackgroundVideo } from './components/BackgroundVideo';
import { IntroOverlay } from './components/IntroOverlay';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';
import { ForgePage } from './pages/ForgePage';

const LandingPage = () => (
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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forge" element={<ForgePage />} />
      </Routes>
    </Router>
  );
};

export default App;