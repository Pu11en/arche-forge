import React, { useEffect, useRef, useState } from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { IntroOverlay } from './components/IntroOverlay';
import { HeroSection } from './components/HeroSection';
import { HeroHeaderBlock } from './components/HeroHeaderBlock';
import { PartnerShrineGrid } from './components/PartnerShrineGrid';
import { DivisionGrid3x3 } from './components/DivisionGrid3x3';
import { LinkStrip } from './components/LinkStrip';
import { ForgeDoctrineBlock } from './components/ForgeDoctrineBlock';
import { SteelFooter } from './components/SteelFooter';
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

            {/* Layer 1 & 2: Hero Container - Scrolls with page */}
            <div className="relative h-screen w-full overflow-hidden">
                <BackgroundVideo />
                <HeroSection onEnter={handleEnterForge} />
            </div>

            {/* Layer 3: Content Section - Relative Flow */}
            <div ref={contentRef} className="relative z-50 w-full bg-black" style={{ backgroundColor: 'black' }}>
                <HeroHeaderBlock />
                <PartnerShrineGrid />
                <DivisionGrid3x3 />
                <LinkStrip />
                <ForgeDoctrineBlock />
                <SteelFooter />
            </div>
        </main>
    );
};

export default App;
