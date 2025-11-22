import React from 'react';

export const ContentSection: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-zinc-900 flex items-center justify-center text-white">
            <div className="max-w-4xl p-8 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-6">Welcome to The Forge</h2>
                <p className="text-xl text-gray-400">
                    This is the content revealed after entering.
                    More sections will be added here.
                </p>
            </div>
        </div>
    );
};
