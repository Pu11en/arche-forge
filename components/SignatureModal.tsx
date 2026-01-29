import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Linkedin } from 'lucide-react';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    partner: {
        name: string;
        role: string;
        signatureUrl: string;
        linkedinUrl?: string;
    } | null;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, partner }) => {
    // Close modal on Escape key press
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    if (!partner) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-8 md:p-12 lg:p-16"
                        onClick={onClose}
                    >
                        <div
                            className="relative w-full max-w-3xl flex flex-col gap-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Buttons Row - Above Card */}
                            <div className="flex items-center justify-between gap-4">
                                {/* Back Button */}
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.05, x: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 text-orange-500 font-inter font-semibold text-sm rounded-lg transition-all duration-300 group"
                                    aria-label="Back to Partners"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                                    Back to Partners
                                </motion.button>

                                {/* Close Button */}
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 bg-zinc-900/80 hover:bg-orange-500/20 border border-zinc-800 hover:border-orange-500/50 text-zinc-400 hover:text-orange-500 rounded-lg transition-all duration-300"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Signature Card */}
                            <motion.div
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="relative bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl" />
                                </div>

                                {/* Partner Info Header */}
                                <div className="relative z-10 p-6 border-b border-zinc-800 bg-black/40 backdrop-blur-sm">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <motion.h2
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="font-cinzel text-2xl md:text-3xl text-white tracking-wider mb-1"
                                            >
                                                {partner.name}
                                            </motion.h2>
                                            <motion.p
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.25 }}
                                                className="font-inter text-orange-500 uppercase tracking-widest text-xs font-semibold"
                                            >
                                                {partner.role}
                                            </motion.p>
                                        </div>

                                        {/* LinkedIn Button */}
                                        {partner.linkedinUrl && (
                                            <motion.a
                                                href={partner.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white rounded-lg transition-all duration-300"
                                                aria-label={`${partner.name} on LinkedIn`}
                                            >
                                                <span className="text-sm font-inter">LinkedIn</span>
                                            </motion.a>
                                        )}
                                    </div>
                                </div>

                                {/* Signature Image */}
                                <div className="relative z-10 p-6 md:p-8 flex items-center justify-center bg-black/20">
                                    <motion.img
                                        src={partner.signatureUrl}
                                        alt={`${partner.name}'s signature`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="w-full max-w-xl h-auto object-contain drop-shadow-2xl"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Decorative Corner Accents */}
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-orange-500/30" />
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-orange-500/30" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-orange-500/30" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-orange-500/30" />
                            </motion.div>

                            {/* Helper Text */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center text-zinc-600 text-xs font-inter"
                            >
                                Press <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 font-mono text-xs">ESC</kbd> or click outside to close
                            </motion.p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
