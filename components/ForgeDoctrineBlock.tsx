import React from 'react';
import { motion } from 'framer-motion';

const DOCTRINES = [
    "cadence is sacred",
    "presence is holy",
    "abandonment is fatal",
    "flinching is fatal",
    "receipts over rhetoric",
    "accountability over everything"
];

export const ForgeDoctrineBlock: React.FC = () => {
    return (
        <section className="w-full bg-black py-32 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat',
                }}
            />

            <div className="relative z-10 flex flex-col items-center space-y-8 md:space-y-12">
                {DOCTRINES.map((text, index) => (
                    <motion.h3
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                        viewport={{ margin: "-50px" }}
                        className="font-cinzel text-2xl md:text-4xl lg:text-5xl text-[#d4af37] text-center tracking-widest uppercase"
                        style={{
                            textShadow: '0 0 15px rgba(212, 175, 55, 0.2)',
                            opacity: 0.9
                        }}
                    >
                        {text}
                    </motion.h3>
                ))}
            </div>
        </section>
    );
};
