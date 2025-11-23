import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Flame, Shirt, Gem, FileText, Gamepad2, Circle } from 'lucide-react';

interface Division {
    name: string;
    description: string;
    icon: React.ReactNode;
    link: string;
}

const DIVISIONS: Division[] = [
    { name: "SoulPrint™", description: "The identity engine", icon: <Fingerprint className="w-8 h-8" />, link: "#" },
    { name: "FullBurn™", description: "Performance-art division", icon: <Flame className="w-8 h-8" />, link: "#" },
    { name: "HalfSalt Clothiers™", description: "Fashion from spite + salt", icon: <Shirt className="w-8 h-8" />, link: "#" },
    { name: "Charm City Candy Syndicate™", description: "NotMelted.com", icon: <Gem className="w-8 h-8" />, link: "#" },
    { name: "The Black Docket™", description: "KrugerNotKruger.com", icon: <FileText className="w-8 h-8" />, link: "#" },
    { name: "The Compliance Arcade™", description: "Pumps-R-Us.com", icon: <Gamepad2 className="w-8 h-8" />, link: "#" },
    { name: "Deius Round™", description: "Intelligent séance", icon: <Circle className="w-8 h-8" />, link: "#" }
];

const DivisionCard: React.FC<{ division: Division; index: number }> = ({ division, index }) => {
    return (
        <motion.a
            href={division.link}
            aria-label={`${division.name} - ${division.description}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover="hover"
            className="group relative bg-[#101010] border border-zinc-800 p-8 flex flex-col items-center justify-center text-center aspect-square transition-all duration-500 cursor-pointer overflow-hidden"
        >
            {/* Cinematic Background Glow */}
            <motion.div
                variants={{
                    hover: { opacity: 0.2, scale: 1.5 }
                }}
                initial={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-purple-900/30 blur-xl pointer-events-none"
            />

            <motion.div
                variants={{
                    hover: { scale: 1.2, color: '#f97316', rotate: 5 }
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative z-10 text-zinc-500 mb-4"
            >
                {division.icon}
            </motion.div>

            <motion.h3
                variants={{
                    hover: { y: -5, color: '#f97316' }
                }}
                className="relative z-10 font-cinzel text-xl text-white mb-2 transition-colors duration-300"
            >
                {division.name}
            </motion.h3>

            <motion.p
                variants={{
                    hover: { opacity: 1, y: 0 }
                }}
                initial={{ opacity: 0.7, y: 0 }}
                className="relative z-10 font-inter text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300"
            >
                {division.description}
            </motion.p>

            {/* Border Pulse */}
            <motion.div
                variants={{
                    hover: { opacity: 1 }
                }}
                initial={{ opacity: 0 }}
                className="absolute inset-0 border border-amber-500/50 pointer-events-none"
            />
        </motion.a>
    );
};

export const DivisionGrid3x3: React.FC = () => {
    return (
        <section className="relative w-full bg-black py-24 px-4 md:px-8 lg:px-16 flex flex-col items-center" aria-label="ArcheForge Divisions">
            <div className="max-w-6xl w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                    {DIVISIONS.map((division, index) => (
                        <DivisionCard key={index} division={division} index={index} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1.0, delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <p className="font-inter text-sm text-zinc-600 uppercase tracking-[0.2em]">
                        All Powered by SoulPrintEngine.ai™
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
