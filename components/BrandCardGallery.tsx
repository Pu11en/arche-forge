import React, { useState } from "react";
import { motion } from "framer-motion";

// Mobile Order: SoulPrint -> HalfSalt -> CC's -> Sammi -> Rest
const MOBILE_BRANDS = [
    { id: 1, title: "SoulPrint™", subtitle: "The identity engine", gradient: "from-orange-500/20 to-red-500/20", hasLogo: true },
    { id: 2, title: "HalfSalt™ / FullBurn™", subtitle: "Threaded with intent", gradient: "from-amber-500/20 to-orange-500/20", hasLogo: true },
    { id: 9, title: "CC's Candy", subtitle: "Too sweet to stay silent", gradient: "from-pink-500/20 to-purple-500/20", hasLogo: true },
    { id: 5, title: "Sammi Sambar", subtitle: "She's not built for roads anymore", gradient: "from-yellow-500/20 to-amber-500/20", hasLogo: true },
    { id: 8, title: "Deius Round", subtitle: "Its not a course, its canon", gradient: "from-purple-500/20 to-indigo-500/20", hasLogo: true },
    { id: 7, title: "Compliance Arcade™", subtitle: "Measuring what you mismanage", gradient: "from-blue-500/20 to-cyan-500/20", hasLogo: true },
    { id: 6, title: "Residence Bureau", subtitle: "Signal Over noise, presence Over posture.", gradient: "from-teal-500/20 to-cyan-500/20", hasLogo: true },
    { id: 4, title: "Cynic and Prophet", subtitle: "Re roast the truth before it roast us", gradient: "from-red-500/20 to-pink-500/20", hasLogo: true },
    { id: 3, title: "The Black Docket™", subtitle: "We don't practice law. We preach accountability.", gradient: "from-zinc-500/20 to-slate-600/20", hasLogo: true },
];

// Desktop Order: Centered SoulPrint (Index 4) with logos flanking
const DESKTOP_BRANDS = [
    { id: 8, title: "Deius Round", subtitle: "Its not a course, its canon", gradient: "from-purple-500/20 to-indigo-500/20", hasLogo: true },
    { id: 7, title: "Compliance Arcade™", subtitle: "Measuring what you mismanage", gradient: "from-blue-500/20 to-cyan-500/20", hasLogo: true },
    { id: 5, title: "Sammi Sambar", subtitle: "She's not built for roads anymore", gradient: "from-yellow-500/20 to-amber-500/20", hasLogo: true },
    { id: 2, title: "HalfSalt™ / FullBurn™", subtitle: "Threaded with intent", gradient: "from-amber-500/20 to-orange-500/20", hasLogo: true },
    { id: 1, title: "SoulPrint™", subtitle: "The identity engine", gradient: "from-orange-500/20 to-red-500/20", hasLogo: true }, // CENTER (Index 4)
    { id: 9, title: "CC's Candy", subtitle: "Too sweet to stay silent", gradient: "from-pink-500/20 to-purple-500/20", hasLogo: true },
    { id: 6, title: "Residence Bureau", subtitle: "Signal Over noise, presence Over posture.", gradient: "from-teal-500/20 to-cyan-500/20", hasLogo: true },
    { id: 4, title: "Cynic and Prophet", subtitle: "Re roast the truth before it roast us", gradient: "from-red-500/20 to-pink-500/20", hasLogo: true },
    { id: 3, title: "The Black Docket™", subtitle: "We don't practice law. We preach accountability.", gradient: "from-zinc-500/20 to-slate-600/20", hasLogo: true },
];

export const BrandCardGallery: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
        <section className="w-full bg-black py-20 md:py-32 flex flex-col items-center justify-center relative overflow-hidden min-h-[800px]">
            {/* Enhanced Background Effects */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\\\'0 0 200 200\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cfilter id=\\\'noiseFilter\\\'%3E%3CfeTurbulence type=\\\'fractalNoise\\\' baseFrequency=\\\'0.8\\\' numOctaves=\\\'3\\\' stitchTiles=\\\'stitch\\\'/%3E%3C/filter%3E%3Crect width=\\\'100%25\\\' height=\\\'100%25\\\' filter=\\\'url(%23noiseFilter)\\\'/%3E%3C/svg%3E")',
                    backgroundRepeat: "repeat",
                }}
            />

            {/* Radial glow effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            {/* Section Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16 text-center"
            >
                <h2 className="font-cinzel text-4xl md:text-5xl text-white tracking-widest mb-4">ARCHETYPAL BRANDS</h2>
                <div className="w-24 h-1 bg-orange-500/50 mx-auto rounded-full" />
            </motion.div>

            {/* Card Container - Desktop (3D Stack) */}
            <motion.div
                className="hidden md:flex relative w-full max-w-6xl h-[500px] items-center justify-center perspective-1000"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setHoveredCard(null);
                }}
                style={{ perspective: "2000px" }}
            >
                {DESKTOP_BRANDS.map((brand, index) => {
                    const centerIndex = 4; // SoulPrint is at index 4
                    const distanceFromCenter = Math.abs(index - centerIndex);

                    // Stacked state (pyramid)
                    const stackedX = (index - centerIndex) * 12;
                    const stackedY = distanceFromCenter * 22;
                    const stackedRotate = (index - centerIndex) * 1.2;
                    const stackedScale = 1 - distanceFromCenter * 0.025;

                    // Expanded fan-out state
                    const expandedX = (index - centerIndex) * 160;
                    const expandedY = distanceFromCenter * 25;
                    const expandedRotate = (index - centerIndex) * 5;
                    const expandedScale = hoveredCard === index ? 1.05 : 1.0;

                    // Z‑index handling
                    const baseZIndex = 50 - distanceFromCenter;
                    const finalZIndex = hoveredCard === index ? 100 : baseZIndex;

                    return (
                        <motion.div
                            key={brand.id}
                            className="absolute cursor-pointer"
                            style={{ zIndex: finalZIndex }}
                            animate={{
                                x: isHovered ? expandedX : stackedX,
                                y: brand.id === 1 ? (isHovered ? -20 : stackedY) : (isHovered ? expandedY : stackedY),
                                rotate: brand.id === 1 ? 0 : (isHovered ? expandedRotate : stackedRotate),
                                rotateY: 0,
                                scale: brand.id === 1 ? (isHovered ? 1.08 : 1) : (isHovered ? expandedScale : stackedScale),
                            }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Animated gradient border */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 animate-pulse" />
                            </div>

                            {/* Noise texture */}
                            <div
                                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                                style={{
                                    backgroundImage:
                                        'url("data:image/svg+xml,%3Csvg viewBox=\\\'0 0 200 200\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cfilter id=\\\'noiseFilter\\\'%3E%3CfeTurbulence type=\\\'fractalNoise\\\' baseFrequency=\\\'0.9\\\' numOctaves=\\\'4\\\' stitchTiles=\\\'stitch\\\'/%3E%3C/filter%3E%3Crect width=\\\'100%25\\\' height=\\\'100%25\\\' filter=\\\'url(%23noiseFilter)\\\'/%3E%3C/svg%3E")',
                                }}
                            />

                            {/* Glowing orb effect on hover */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"
                                animate={{ opacity: hoveredCard === index ? 0.6 : 0, scale: hoveredCard === index ? 1.5 : 1 }}
                                transition={{ duration: 0.5 }}
                            />

                            {/* Card content */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                                {/* Logos or Coming Soon */}
                                {brand.hasLogo ? (
                                    <>
                                        {brand.id === 1 && (
                                            <motion.img
                                                src="/soulprint-logo.png"
                                                alt="SoulPrint Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 2 && (
                                            <motion.img
                                                src="/brands/half-salt.png"
                                                alt="HalfSalt / FullBurn Logo"
                                                className="w-24 h-24 mt-4 mb-2 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 5 && (
                                            <motion.img
                                                src="/image%201.png"
                                                alt="Sammi Sambar Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 9 && (
                                            <motion.img
                                                src="/CC%20candy%20Baltimore%20(4).png"
                                                alt="CC's Candy Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 8 && (
                                            <motion.img
                                                src="/brands/deius-round.png"
                                                alt="Deius Round Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 7 && (
                                            <motion.img
                                                src="/brands/compliance-arcade.png"
                                                alt="Compliance Arcade Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 6 && (
                                            <motion.img
                                                src="/brands/residence-bureau.png"
                                                alt="Residence Bureau Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 4 && (
                                            <motion.img
                                                src="/brands/cynic-prophet.png"
                                                alt="Cynic and Prophet Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                        {brand.id === 3 && (
                                            <motion.img
                                                src="/brands/black-docket.png"
                                                alt="The Black Docket Logo"
                                                className="w-24 h-24 mb-6 object-contain"
                                                animate={{ scale: hoveredCard === index ? 1.1 : 1, rotate: hoveredCard === index ? 360 : 0 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <motion.div
                                        className="mb-6 text-zinc-500 text-sm font-inter tracking-wider uppercase"
                                        animate={{
                                            opacity: hoveredCard === index ? 0.7 : 0.5,
                                            scale: hoveredCard === index ? 1.05 : 1
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        Coming Soon
                                    </motion.div>
                                )}

                                {/* Brand title */}
                                <motion.h3
                                    className="font-cinzel text-lg md:text-xl text-white tracking-widest uppercase mb-4 relative"
                                    animate={{
                                        scale: hoveredCard === index ? 1.05 : 1,
                                        textShadow: hoveredCard === index ? "0 0 20px rgba(249, 115, 22, 0.5)" : "0 0 0px rgba(249, 115, 22, 0)",
                                    }}
                                >
                                    {brand.title}
                                    {/* Animated underline */}
                                    <motion.div
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0.5 bg-orange-500"
                                        animate={{ width: hoveredCard === index ? "100%" : "0%" }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.h3>

                                {/* Subtitle */}
                                <motion.p
                                    className="font-inter text-sm text-zinc-400 tracking-wide uppercase"
                                    animate={{ opacity: hoveredCard === index ? 1 : 0.6, y: hoveredCard === index ? 0 : 4 }}
                                >
                                    {brand.subtitle}
                                </motion.p>

                                {/* Decorative bottom line */}
                                <motion.div
                                    className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent mt-8"
                                    animate={{ width: hoveredCard === index ? "120px" : "64px", opacity: hoveredCard === index ? 1 : 0.5 }}
                                />
                            </div>

                            {/* Corner accents */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-orange-500/30" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-orange-500/30" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-orange-500/30" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-orange-500/30" />
                        </motion.div>
        </motion.div>
            );
})}
        </motion.div >

    {/* Card Container - Mobile (Vertical Grid) */ }
    < div className="md:hidden w-full px-4 flex flex-col items-center gap-8" >
        {
            MOBILE_BRANDS.map((brand) => (
                <div
                    key={brand.id}
                    className="relative w-full max-w-xs h-80 rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl bg-gradient-to-br from-zinc-900 to-black backdrop-blur-sm"
                    style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)" }}
                >
                    {/* Noise texture */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'url("data:image/svg+xml,%3Csvg viewBox=\\\'0 0 200 200\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cfilter id=\\\'noiseFilter\\\'%3E%3CfeTurbulence type=\\\'fractalNoise\\\' baseFrequency=\\\'0.9\\\' numOctaves=\\\'4\\\' stitchTiles=\\\'stitch\\\'/%3E%3C/filter%3E%3Crect width=\\\'100%25\\\' height=\\\'100%25\\\' filter=\\\'url(%23noiseFilter)\\\'/%3E%3C/svg%3E")',
                        }}
                    />

                    {/* Card content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                        {brand.hasLogo ? (
                            <>
                                {brand.id === 1 && <img src="/soulprint-logo.png" alt="SoulPrint" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 2 && <img src="/brands/half-salt.png" alt="HalfSalt" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 5 && <img src="/image%201.png" alt="Sammi Sambar" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 9 && <img src="/CC%20candy%20Baltimore%20(4).png" alt="CC's Candy" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 8 && <img src="/brands/deius-round.png" alt="Deius Round" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 7 && <img src="/brands/compliance-arcade.png" alt="Compliance Arcade" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 6 && <img src="/brands/residence-bureau.png" alt="Residence Bureau" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 4 && <img src="/brands/cynic-prophet.png" alt="Cynic and Prophet" className="w-20 h-20 mb-4 object-contain" />}
                                {brand.id === 3 && <img src="/brands/black-docket.png" alt="The Black Docket" className="w-20 h-20 mb-4 object-contain" />}
                            </>
                        ) : (
                            <div className="mb-4 text-zinc-500 text-xs font-inter tracking-wider uppercase">Coming Soon</div>
                        )}

                        <h3 className="font-cinzel text-lg text-white tracking-widest uppercase mb-2">
                            {brand.title}
                        </h3>

                        <p className="font-inter text-xs text-zinc-400 tracking-wide uppercase">
                            {brand.subtitle}
                        </p>

                        <div className="w-12 h-px bg-orange-500/50 mt-6" />
                    </div>
                </div>
            ))
        }
    </div >

    {/* Hover instruction */ }
    < motion.p className="mt-16 text-zinc-500 text-sm font-inter tracking-wider uppercase" animate={{ opacity: isHovered ? 0 : 1 }}>
        Hover to explore brands
    </motion.p >
        </section >
    );
};
