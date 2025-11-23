import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HeroHeaderBlock: React.FC = () => {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.5, 0.2]);

    return (
        <section
            ref={ref}
            aria-label="Archetypal Partners Introduction"
            className="relative w-full bg-black text-white py-16 flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Parallax Grain Overlay */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    y,
                    opacity,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat',
                }}
            />

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-cinzel text-5xl md:text-7xl font-bold tracking-widest mb-6 text-white"
                >
                    ARCHETYPAL PARTNERS
                </motion.h2>

                {/* Complex Orange Pulse */}
                <div className="relative h-[2px] w-32 md:w-64 mx-auto mb-8">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 1.0, delay: 0.2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.7)]"
                    />
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-orange-400/90 blur-[2px]"
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-inter text-lg md:text-2xl text-zinc-400 font-light tracking-wide mb-2"
                >
                    "The human minds behind the machine that remembers."
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="font-inter text-xs md:text-sm text-orange-500 uppercase tracking-[0.2em]"
                >
                    Powered entirely by SoulPrintEngine.ai™
                </motion.p>
            </div>
        </section>
    );
};
