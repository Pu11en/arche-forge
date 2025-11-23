import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Partner {
    name: string;
    role: string;
    tone: string;
}

const PARTNERS: Partner[] = [
    { name: "Ben Woodard", role: "Founder / Imprint Architect", tone: "the rhythm keeper, the architect, the fire." },
    { name: "Vicki Clary", role: "Creative Director / Resonance Anchor", tone: "precision, empathy, elegance." },
    { name: "Zachary", role: "Director of Regulatory Accountability", tone: "documents, discipline, warhammer-level detail." },
    { name: "Glenn (Lynx)", role: "AI Experience Designer", tone: "fluid motion, futuristic UI." },
    { name: "Drew (Asset)", role: "Video Engine Architect", tone: "cinematic execution, speed, chaos." },
    { name: "Nick (Motherfucket)", role: "Comedy Division Lead", tone: "disruption with a smirk." },
    { name: "Lisa (Asha)", role: "Social Resonance Director", tone: "voice, pulse, brand cadence." },
    { name: "Sammi", role: "Autonomous Persona", tone: "AI spirit animal, van soul, cult mascot." }
];

const PartnerCard: React.FC<{ partner: Partner; index: number }> = ({ partner, index }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            role="listitem"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-amber-500/30 hover:bg-zinc-900/80 backdrop-blur-sm cursor-pointer"
        >
            <div
                style={{ transform: "translateZ(75px)" }}
                className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none rounded-lg"
            />

            <h3
                style={{ transform: "translateZ(50px)" }}
                className="font-cinzel text-2xl text-white mb-2 group-hover:text-orange-500 transition-colors duration-300 relative z-10"
            >
                {partner.name}
            </h3>

            <div
                style={{ transform: "translateZ(25px)" }}
                className="h-[1px] w-12 bg-zinc-700 my-4 group-hover:bg-orange-500/50 transition-colors duration-300 relative z-10"
            />

            <p
                style={{ transform: "translateZ(30px)" }}
                className="font-inter text-sm text-zinc-400 uppercase tracking-wider mb-4 font-semibold relative z-10"
            >
                {partner.role}
            </p>

            <p
                style={{ transform: "translateZ(20px)" }}
                className="font-inter text-zinc-500 italic font-light relative z-10 group-hover:text-zinc-300 transition-colors duration-300"
            >
                "{partner.tone}"
            </p>
        </motion.div>
    );
};

export const PartnerShrineGrid: React.FC = () => {
    return (
        <section className="relative w-full bg-black py-20 px-4 md:px-8 lg:px-16" aria-label="Partner Shrine Grid">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
                    {PARTNERS.map((partner, index) => (
                        <PartnerCard key={index} partner={partner} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
