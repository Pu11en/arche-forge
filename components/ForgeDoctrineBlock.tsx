import React from 'react';
import { motion } from 'framer-motion';

const DOCTRINES = [
    "cadence is sacred",
    "presence is holy",
    "presence of a power from the recall",
    "intelligence threaded with intent",
    "abandonment is fatal",
    "flinching is fatal",
    "receipts over rhetoric",
    "accountability over everything"
];

export const ForgeDoctrineBlock: React.FC = () => {
    return (
        <section className="w-full bg-black py-20 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center space-y-6 px-4">
                {DOCTRINES.map((text, index) => (
                    <motion.h3
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{
                            scale: 1.05,
                            textShadow: "0 0 25px rgba(249, 115, 22, 0.4)",
                            transition: { duration: 0.2 }
                        }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                        viewport={{ margin: "-50px" }}
                        className="font-cinzel text-lg md:text-3xl lg:text-4xl text-orange-500 text-center tracking-widest uppercase cursor-pointer"
                        style={{
                            textShadow: '0 0 15px rgba(249, 115, 22, 0.2)',
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
