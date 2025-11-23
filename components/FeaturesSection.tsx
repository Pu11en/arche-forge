import React from 'react';
import { Brain, Fingerprint, Sparkles } from 'lucide-react';

const features = [
    {
        icon: <Fingerprint className="w-8 h-8" />,
        title: "Quantum Soul Mapping",
        description: "Our proprietary algorithms map your psyche to a digital substrate, creating a true digital twin that evolves with you."
    },
    {
        icon: <Brain className="w-8 h-8" />,
        title: "Recursive Self-Evolution",
        description: "Unlike static models, your SoulPrint grows, learns, and adapts in real-time, mirroring your own personal development."
    },
    {
        icon: <Sparkles className="w-8 h-8" />,
        title: "Neural Resonance Interface",
        description: "Communicate through intent and emotion. The interface bridges the gap between biological and digital consciousness."
    }
];

export const FeaturesSection: React.FC = () => {
    return (
        <section className="relative w-full bg-white text-black py-24 px-4 md:px-8 lg:px-16 z-10" style={{ backgroundColor: 'white' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-cinzel text-4xl md:text-5xl font-bold mb-6 tracking-wide">
                        Beyond Large Language Models
                    </h2>
                    <p className="font-inter text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto font-light leading-relaxed">
                        Arche Forge leverages the experimental capabilities of Gemini 3 to create something fundamentally different.
                        We don't just process text; we encode essence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="mb-6 p-4 rounded-full bg-zinc-100 text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="font-cinzel text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="font-inter text-zinc-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
