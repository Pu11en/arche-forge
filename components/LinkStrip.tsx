import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Flame, Shirt, Gem, FileText, Gamepad2, Circle, Bot } from 'lucide-react';

const LINKS = [
    { name: "SoulPrint", icon: <Fingerprint className="w-5 h-5" /> },
    { name: "FullBurn", icon: <Flame className="w-5 h-5" /> },
    { name: "HalfSalt", icon: <Shirt className="w-5 h-5" /> },
    { name: "Candy Syndicate", icon: <Gem className="w-5 h-5" /> },
    { name: "Black Docket", icon: <FileText className="w-5 h-5" /> },
    { name: "Compliance Arcade", icon: <Gamepad2 className="w-5 h-5" /> },
    { name: "Deius Round", icon: <Circle className="w-5 h-5" /> },
    { name: "Sammi", icon: <Bot className="w-5 h-5" /> },
];

export const LinkStrip: React.FC = () => {
    return (
        <nav className="w-full bg-[#050505] py-16 border-y border-zinc-900" aria-label="Brand Links">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 lg:gap-20">
                    {LINKS.map((link, index) => (
                        <motion.a
                            key={index}
                            href="#"
                            aria-label={link.name}
                            whileHover={{ scale: 1.1, color: '#f97322' }}
                            className="flex flex-col items-center space-y-3 text-zinc-600 cursor-pointer transition-colors duration-300 min-w-[100px] group relative"
                        >
                            <div className="p-4 rounded-full border border-transparent group-hover:border-orange-500/20 transition-all duration-300">
                                <div className="w-8 h-8">
                                    {React.cloneElement(link.icon, { className: 'w-8 h-8' })}
                                </div>
                            </div>
                            <span className="text-xs uppercase tracking-wider font-inter opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-zinc-400 group-hover:text-orange-500">
                                {link.name}
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </nav>
    );
};
