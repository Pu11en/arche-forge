import React, { useEffect, useRef, useState } from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { IntroOverlay } from './components/IntroOverlay';
import { HeroSection } from './components/HeroSection';
import { ContentSection } from './components/ContentSection';
import { cn } from './lib/utils';

const App: React.FC = () => {
    const [isScrollLocked, setIsScrollLocked] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    // Manage body scroll locking
    useEffect(() => {
        if (isScrollLocked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isScrollLocked]);

    const handleEnterForge = () => {
        setIsScrollLocked(false);
        // Small timeout to allow state update to propagate
        setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    return (
        <main className="relative w-full bg-black min-h-screen">
            {/* Intro Overlay (Flash) - Z-Index 50 */}
            <IntroOverlay />

            {/* Layer 1: Background Video (The Bull) - Fixed Background */}
            <div className="fixed inset-0 z-0">
                <BackgroundVideo />
            </div>

            {/* Layer 2: Main Hero Content (Includes Trademarks) - Relative Flow */}
            <HeroSection onEnter={handleEnterForge} />

            {/* Layer 3: Content Section - Relative Flow */}
            <div ref={contentRef} className="relative z-10 bg-black w-full">
                <ContentSection />
            </div>
        </main>
    );
};

export default App;
