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
        <nav className="w-full bg-[#050505] py-8 border-y border-zinc-900 overflow-hidden" aria-label="Brand Links">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center space-x-8 md:space-x-16 overflow-x-auto no-scrollbar py-2 mask-linear-fade">
                    {LINKS.map((link, index) => (
                        <motion.a
                            key={index}
                            href="#"
                            aria-label={link.name}
                            whileHover={{ scale: 1.1, color: '#d4af37' }}
                            className="flex flex-col items-center space-y-2 text-zinc-600 cursor-pointer transition-colors duration-300 min-w-[80px] group"
                        >
                            <div className="p-2 rounded-full border border-transparent group-hover:border-[#d4af37]/20 transition-all duration-300">
                                {link.icon}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-inter opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-4 whitespace-nowrap">
                                {link.name}
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </nav>
    );
};
