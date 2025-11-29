import React, { useState } from "react";
import { motion } from "framer-motion";

// All brands with consistent data
const BRANDS = [
    { id: 1, title: "SoulPrint™", subtitle: "The identity engine", logo: "/soulprint-logo.png", isFeatured: true },
    { id: 2, title: "HalfSalt™ / FullBurn™", subtitle: "Threaded with intent", logo: "/brands/half-salt.png", isFeatured: false },
    { id: 9, title: "CC's Candy", subtitle: "Too sweet to stay silent", logo: "/CC%20candy%20Baltimore%20(4).png", isFeatured: false },
    { id: 5, title: "Sammi Sambar", subtitle: "She's not built for roads anymore", logo: "/image%201.png", isFeatured: false },
    { id: 8, title: "Deius Round", subtitle: "Its not a course, its canon", logo: "/brands/deius-round.png", isFeatured: false },
    { id: 7, title: "Compliance Arcade™", subtitle: "Measuring what you mismanage", logo: "/brands/compliance-arcade.png", isFeatured: false },
    { id: 6, title: "Residence Bureau", subtitle: "Signal over noise, presence over posture", logo: "/brands/residence-bureau.png", isFeatured: false },
    { id: 4, title: "Cynic and Prophet", subtitle: "Re roast the truth before it roast us", logo: "/brands/cynic-prophet.png", isFeatured: false },
    { id: 3, title: "The Black Docket™", subtitle: "We don't practice law. We preach accountability.", logo: "/brands/black-docket.png", isFeatured: false },
];

export const BrandCardGallery: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
        <section className="w-full bg-black py-20 md:py-32 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Subtle background texture */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)`,
                }}
            />

            {/* Section Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16 text-center px-4"
            >
                <h2 className="font-cinzel text-3xl md:text-5xl text-white tracking-widest mb-4">ARCHETYPAL BRANDS</h2>
                <div className="w-24 h-1 bg-orange-500/50 mx-auto rounded-full" />
            </motion.div>

            {/* Featured Card - SoulPrint with Lava Glow */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12 px-4 w-full flex justify-center"
            >
                <motion.div
                    className="relative w-full max-w-md cursor-pointer"
                    onMouseEnter={() => setHoveredCard(1)}
                    onMouseLeave={() => setHoveredCard(null)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {/* Lava glow effect behind card */}
                    <motion.div
                        className="absolute -inset-1 rounded-2xl blur-xl"
                        style={{
                            background: "linear-gradient(45deg, #f97316, #ef4444, #f97316, #ea580c)",
                            backgroundSize: "400% 400%",
                        }}
                        animate={{
                            backgroundPosition: hoveredCard === 1 ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%",
                            opacity: hoveredCard === 1 ? 0.8 : 0.4,
                        }}
                        transition={{
                            backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                            opacity: { duration: 0.3 },
                        }}
                    />
                    
                    {/* Card */}
                    <div className="relative bg-black rounded-2xl border border-orange-500/30 p-8 text-center">
                        <img
                            src="/soulprint-logo.png"
                            alt="SoulPrint Logo"
                            className="w-20 h-20 mx-auto mb-6 object-contain"
                        />
                        <h3 className="font-cinzel text-2xl text-white tracking-widest uppercase mb-3">
                            SoulPrint™
                        </h3>
                        <p className="font-inter text-sm text-zinc-400 tracking-wide">
                            The identity engine
                        </p>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mt-6" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Brand Grid - Clean layout */}
            <div className="w-full max-w-6xl px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BRANDS.filter(b => !b.isFeatured).map((brand, index) => (
                        <motion.div
                            key={brand.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative cursor-pointer group"
                            onMouseEnter={() => setHoveredCard(brand.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Card */}
                            <motion.div
                                className="relative bg-black rounded-xl border border-zinc-800 p-6 text-center h-full min-h-[280px] flex flex-col items-center justify-center"
                                whileHover={{ 
                                    borderColor: "rgba(249, 115, 22, 0.5)",
                                    y: -4,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Subtle hover glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                />
                                
                                {/* Logo */}
                                <div className="relative z-10 mb-4">
                                    <img
                                        src={brand.logo}
                                        alt={`${brand.title} Logo`}
                                        className="w-16 h-16 mx-auto object-contain"
                                    />
                                </div>
                                
                                {/* Title */}
                                <h3 className="relative z-10 font-cinzel text-base text-white tracking-wider uppercase mb-2 px-2">
                                    {brand.title}
                                </h3>
                                
                                {/* Subtitle */}
                                <p className="relative z-10 font-inter text-xs text-zinc-500 tracking-wide px-2 leading-relaxed">
                                    {brand.subtitle}
                                </p>
                                
                                {/* Bottom accent */}
                                <motion.div
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 h-px bg-orange-500/50"
                                    initial={{ width: 0 }}
                                    animate={{ width: hoveredCard === brand.id ? 60 : 30 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
