import React from 'react';

export const SteelFooter: React.FC = () => {
    return (
        <footer className="w-full bg-[#050505] py-8 px-8 border-t border-zinc-900 flex items-center justify-end">
            <div className="text-right">
                <p className="font-inter text-xs md:text-sm text-zinc-500 tracking-wide">
                    <span className="text-white font-semibold">ArcheForge™</span> — Built on <span className="text-orange-500">SoulPrintEngine.ai™</span>
                </p>
            </div>
        </footer>
    );
};
