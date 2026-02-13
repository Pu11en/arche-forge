import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignatureModal } from './SignatureModal';

interface Partner {
    name: string;
    role: string;
    tone: string;
    signatureUrl: string;
    slug?: string;
    linkedinUrl?: string;
}

const PARTNERS: Partner[] = [
    { name: "Ben", role: "ace", tone: "the rhythm keeper, the architect, the fire.", signatureUrl: "/signatures/BenWoodard.png", slug: "ben", linkedinUrl: "https://www.linkedin.com/in/ben-woodard/" },
    { name: "Drew", role: "asset", tone: "cinematic execution, speed, chaos.", signatureUrl: "/signatures/DrewPullen.png", slug: "drew", linkedinUrl: "https://www.linkedin.com/in/drewpullen/" },
    { name: "Lisa", role: "asha", tone: "voice, pulse, brand cadence.", signatureUrl: "/signatures/LisaQ.png", slug: "lisa", linkedinUrl: "https://www.linkedin.com/in/lisa-quible-98206a397/" },
    { name: "Nick", role: "motherfucket", tone: "disruption with a smirk.", signatureUrl: "/signatures/NickH.png", slug: "nick", linkedinUrl: "https://www.linkedin.com/in/security-nick/" },
    { name: "Glenn", role: "Raven", tone: "fluid motion, futuristic UI.", signatureUrl: "/signatures/GlennLuther.png", slug: "glenn", linkedinUrl: "https://www.linkedin.com/in/glennluther/" },
    { name: "Adrian", role: "Thoth", tone: "Everywhere and nowhere at the same time", signatureUrl: "/signatures/AdrianFloyd.png", slug: "adrian", linkedinUrl: "https://www.linkedin.com/in/adrian-floyd-21a50a3/" },
    { name: "Reggie", role: "Perseus", tone: "documents, discipline, warhammer-level detail.", signatureUrl: "/signatures/ReggieAlcos.png", slug: "reggie", linkedinUrl: "https://www.linkedin.com/in/reggiealcos/" },
    { name: "David", role: "Dark Horse", tone: "goat", signatureUrl: "/signatures/DavidEydelzon.png", slug: "david", linkedinUrl: "https://www.linkedin.com/" },
    { name: "Layla", role: "Nineteen", tone: "stealth, observation, unknown.", signatureUrl: "/signatures/JimmyBlackbird.png", slug: "layla" }
];

const PartnerCard: React.FC<{ partner: Partner; index: number; onClick: () => void }> = ({ partner, index, onClick }) => {
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
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 min-h-[280px] flex flex-col items-center text-center hover:border-orange-500/50 hover:bg-zinc-900/80 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] backdrop-blur-sm cursor-pointer transition-colors duration-300"
            aria-label={`View ${partner.name}'s signature`}
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
                className="font-inter text-zinc-500 italic font-light relative z-10 group-hover:text-zinc-300 transition-colors duration-300 mb-8"
            >
                "{partner.tone}"
            </p>

            {/* Click indicator */}
            <div
                style={{ transform: "translateZ(40px)" }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-orange-500 text-xs font-inter tracking-wider uppercase z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
                Click to view signature
            </div>
        </motion.div>
    );
};

export const PartnerShrineGrid: React.FC = () => {
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check URL on mount and location changes
    useEffect(() => {
        const path = location.pathname;
        const signatureMatch = path.match(/^\/signature\/(.+)$/); // Changed to singular /signature/

        if (signatureMatch) {
            const partnerSlug = signatureMatch[1].toLowerCase();

            // Find partner by explicit slug or fallback to name matching (for backward compatibility if needed)
            const partner = PARTNERS.find(p => p.slug === partnerSlug || p.name.toLowerCase().replace(/\s+/g, '') === partnerSlug);

            if (partner) {
                setSelectedPartner(partner);
                setIsModalOpen(true);
            }
        }
    }, [location.pathname]);

    const handlePartnerClick = (partner: Partner) => {
        // Use explicit slug if available, otherwise fallback to name
        const slug = partner.slug || partner.name.toLowerCase().replace(/\s+/g, '');
        navigate(`/signature/${slug}`);
        setSelectedPartner(partner);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate('/');
        setTimeout(() => setSelectedPartner(null), 300); // Clear after animation
    };

    return (
        <>
            <section className="relative w-full bg-black py-20 px-4 md:px-8 lg:px-16" aria-label="Partner Shrine Grid">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
                        {PARTNERS.map((partner, index) => (
                            <PartnerCard
                                key={index}
                                partner={partner}
                                index={index}
                                onClick={() => handlePartnerClick(partner)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Signature Modal */}
            <SignatureModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                partner={selectedPartner}
            />
        </>
    );
};
