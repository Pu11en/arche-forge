const SIGNATURE_DOMAIN = "https://archeforge.com";

const signatureAssets = [
  { file: "BenWoodard.png", label: "Ben Woodard" },
  { file: "DrewPullen.png", label: "Drew Pullen" },
  { file: "GlennLuther.png", label: "Glenn Luther" },
  { file: "JimmyBlackbird.png", label: "Jimmy Blackbird" },
  { file: "LisaQ.png", label: "Lisa Q" },
  { file: "NickH.png", label: "Nick H" },
  { file: "SammiSandbar.png", label: "Sammi Sandbar" },
  { file: "ZackF.png", label: "Zack F" },
];

const getSignatureUrl = (fileName: string) =>
  `${SIGNATURE_DOMAIN}/signatures/${encodeURIComponent(fileName)}`;

const SignatureGallery = () => {
  return (
    <section className="w-full px-4 py-10 lg:py-16">
      <div className="max-w-5xl mx-auto text-center space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-600">
          Authentic Approval
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
          Real humans sign off on every build
        </h2>
        <p className="text-base sm:text-lg text-zinc-700">
          Each signature links back to archeforge.com, pairing a human touch with the
          experience you are about to ship.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {signatureAssets.map(({ file, label }) => {
          const imgUrl = getSignatureUrl(file);

          return (
            <a
              key={file}
              href={SIGNATURE_DOMAIN}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3"
              aria-label={`Visit Arche Forge via ${label}'s signature`}
            >
              <div className="w-full rounded-lg border border-zinc-100 bg-white/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 group-hover:shadow-[0_15px_45px_rgba(0,0,0,0.15)]">
                <img
                  src={imgUrl}
                  alt={`${label} signature`}
                  loading="lazy"
                  className="mx-auto max-h-20 w-full object-contain"
                />
              </div>
              <span className="text-sm font-medium text-zinc-600">{label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export { SignatureGallery };
