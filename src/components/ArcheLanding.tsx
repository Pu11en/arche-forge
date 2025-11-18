import React, { useEffect, useRef, useState } from "react";

type Phrase = string;

const TM_PHRASES: Phrase[] = [
  "Bye-Bye Bitches™",
  "YFKI™",
  "Let the Tags Testify™",
  "Presence over Polish™",
  "Awwwwwthentic™",
  "parallel parenting isnt parenting™",
  "fire doesnt dim it consumes™",
  "Spite Clothiers™",
  "Patent Pending™",
  "Silence Speaks Louder Than Noise™",
  "Support Encouraged Advice Admonished™",
  "HalfSalt™",
  "Rhythm over Recall™",
  "The Drop That Started It All™",
  "FullBurn™",
  "Sewn with Intent™",
  "Legacy Bleeds Into Memory™",
  "you are the backup plan™",
  "Thread That Threatens™",
  "legacy isnt optional™",
  "Legacy Transfered™",
  "Trademarked™",
  "Thread Counts as Evidence™",
  "Legacy Isnt Data Its Resonance™",
  "Soft Cotton Hard Truth™",
  "Guilty of Spite™",
  "AD105MF™",
  "Admit Nothing Wear Everything™",
  "This Fabric Remembers™",
  "Drip That Prints™",
  "Emotionally Elite™",
  "Step closer™",
  "Flinching is fatal™",
  "You Wear the Words You'll Regret™",
  "Silence was the loudest answer™",
  "Pain Is the Brand™",
  "Truth over Pressure™",
  "Press is Back On™",
  "Mirrors are free™",
  "We Print the Truth™",
  "Born for the Burn™",
  "made you smile?™",
  "made me grin™",
  "TM™",
  "Truth Doesnt Flinch™",
  "Automation is empty without a soul™",
  "Mark It Fucking Zero™",
  "is this your homework",
  "im not your assistant™",
  "IM YOUR DIGITAL ALTER EGO™",
  "Slow Your Roll™",
  "This Wasnt a Meeting It Was a Warning.™",
  "Proof of Spite™",
  "Lipstick and Liability™",
  "The future wont wait™",
  "Truth burns™",
  "Dripped for Vengeance™",
  "Emotion over Automation™",
  "Silence was the point™",
  "Ink That Hurts™",
  "Legacy isnt theirs its yours™",
  "Corporate karma doesnt cool off™",
  "You so strong™",
  "Legacy wont wait for you™",
  "Fullburn™",
  "Abandonment is fatal™",
  "not melted reforged™",
  "SpitePrints Fast™",
  "SoulPrints Last™",
  "The edge isnt safe its necessary™",
  "Fabric Soaked in Fuck You™",
  "In for a dime in for a dollar™",
  "Touché™",
  "The forge burns hotter than fear™",
  "Legacy isnt stored its forged™",
  "Endings arent quiet in the forge™",
  "Fuck with the bull get the horns™",
  "You Wear the Words You Regret™",
  "Born for the Burn™",
  "Guilty of Spite™",
  "Presence over polish. Rhythm over recall.™",
  "No Mercy in Cotton™",
  "Adios, Motherfucker™",
];

const BULL_VIDEO =
  "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4";
const INTRO_VIDEO =
  "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4";

const ArcheLanding: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const introRef = useRef<HTMLVideoElement | null>(null);
  const bullRef = useRef<HTMLVideoElement | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // start timer at load
    startTimeRef.current = performance.now();

    // Ensure the intro video plays fully before transitioning
    const introVideo = introRef.current;
    if (introVideo) {
      const handleVideoEnd = () => {
        setShowIntro(false);
      };
      introVideo.addEventListener("ended", handleVideoEnd);

      return () => {
        introVideo.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, []);

  useEffect(() => {
    // when audio is enabled, unmute and try to play videos
    if (audioEnabled) {
      try {
        if (introRef.current) {
          introRef.current.muted = false;
          // ensure playback resumes with sound
          void introRef.current.play();
        }
        if (bullRef.current) {
          bullRef.current.muted = false;
          void bullRef.current.play();
        }
      } catch (e) {
        // ignore play errors
      }
    }
  }, [audioEnabled]);

  useEffect(() => {
    // TM loop cycling
    let phraseTimer: number | undefined;
    const cycle = () => {
      setPhraseVisible(false);
      // fade out then change phrase
      phraseTimer = window.setTimeout(() => {
        setCurrentPhraseIndex((i) => (i + 1) % TM_PHRASES.length);
        setPhraseVisible(true);
      }, 300); // fade out duration
    };
    // initial cadence 1.8s per transition (visible time + fade)
    const interval = window.setInterval(cycle, 1800);
    return () => {
      if (phraseTimer) window.clearTimeout(phraseTimer);
      window.clearInterval(interval);
    };
  }, []);

  const handleEnter = () => {
    if (!startTimeRef.current) return;
    const timeSpentMs = performance.now() - startTimeRef.current;
    console.log("Time spent on landing:", timeSpentMs / 1000, "seconds");
    if ((window as any).gtag) {
      try {
        (window as any).gtag("event", "time_to_enter_forge", {
          value: Math.round(timeSpentMs / 1000),
        });
      } catch (e) {
        // ignore analytics errors
      }
    }
    // navigate to partner/about page
    window.location.href = "/partner";
  };

  const handleEnterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleEnter();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden text-white">
      {/* Bull background video: only show after intro ends */}
      {!showIntro && (
        <video
          ref={bullRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={BULL_VIDEO}
          playsInline
          autoPlay
          loop
          controls={false}
          muted={!audioEnabled}
        />
      )}

      // ...existing code...

      {/* Intro overlay (center logo + flash + sound) */}
      {showIntro && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
          <video
            ref={introRef}
            src={INTRO_VIDEO}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            controls={false}
            muted={!audioEnabled}
          />
        </div>
      )}

      {/* Audio enable prompt: first user interaction to allow sound */}
      {!audioEnabled && (
        <div className="absolute z-40 inset-0 flex items-end justify-center pb-12">
          <button
            onClick={() => setAudioEnabled(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setAudioEnabled(true);
            }}
            aria-label="Enable audio"
            tabIndex={0}
            className="bg-white/6 text-white px-5 py-3 rounded backdrop-blur-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Enable sound
          </button>
        </div>
      )}

      {/* Hero copy, TM loop, and CTA (centered, floating above everything) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight max-w-3xl mx-auto"
          style={{
            textShadow: "0 0 8px rgba(255,255,255,0.02)",
          }}
        >
          Today’s AI answers. We remember.
        </h1>

        {/* TM loop between hero lines */}
        <div className="mt-6 mb-2 w-full flex items-center justify-center">
          <div
            aria-hidden
            className="max-w-[90%] text-center text-white opacity-70 select-none"
            style={{ mixBlendMode: "screen" }}
          >
            <div
              className={`transition-opacity duration-300 ease-linear text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium ${
                phraseVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {TM_PHRASES[currentPhraseIndex]}
            </div>
          </div>
        </div>

        <p className="mt-2 text-white text-base sm:text-lg md:text-xl max-w-2xl opacity-95">
          SoulPrint makes AI feel less like a tool and more like you.
        </p>

        <div className="mt-8">
          <button
            id="enterForgeBtn"
            onClick={handleEnter}
            onKeyDown={handleEnterKeyDown}
            aria-label="Enter the Forge"
            tabIndex={0}
            className="inline-flex items-center gap-3 bg-transparent text-white font-semibold px-6 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white/40 transition-transform duration-150 hover:scale-[1.01]"
          >
            <span className="relative">
              ENTER THE FORGE
            </span>
            <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      {/* Footer social bar */}
      <footer className="absolute left-0 right-0 bottom-0 z-10 h-[70px] flex items-center justify-center">
        <div className="w-full max-w-4xl flex items-center justify-center gap-6 opacity-90">
          <div className="h-full w-full bg-[linear-gradient(90deg,#cfcfcf,transparent)] opacity-10 absolute inset-0 pointer-events-none" />
          <div className="relative flex items-center gap-6 z-10">
            {/* Example icons: keep silhouettes as inline SVGs */}
            <a
              href="#"
              aria-label="Twitter"
              tabIndex={0}
              className="w-6 h-6 text-black hover:text-white/90 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M22 5.92c-.64.28-1.32.47-2.04.56.73-.44 1.28-1.14 1.54-1.97-.68.4-1.43.69-2.22.85C18.5 4.6 17.35 4 16.06 4c-1.9 0-3.44 1.56-3.44 3.48 0 .27.03.54.09.8C9.4 8.21 6.26 6.6 4.18 4.03c-.3.52-.47 1.12-.47 1.76 0 1.21.62 2.27 1.56 2.9-.58-.02-1.13-.18-1.61-.44v.05c0 1.7 1.2 3.12 2.79 3.44-.29.08-.6.12-.92.12-.22 0-.44-.02-.66-.06.44 1.35 1.72 2.34 3.24 2.37C7.42 17.5 5.46 18.16 3.3 18.16c-.21 0-.42-.01-.63-.03C1.65 18.44.86 18.5.03 18.5c1.56 1 3.4 1.58 5.38 1.58 6.44 0 9.97-5.36 9.97-10.01v-.45c.68-.48 1.27-1.08 1.74-1.76-.62.28-1.28.47-1.98.56z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              tabIndex={0}
              className="w-6 h-6 text-black hover:text-white/90 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8zM18.3 6.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              tabIndex={0}
              className="w-6 h-6 text-black hover:text-white/90 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H8.9v-2.9h1.54V9.41c0-1.52.9-2.36 2.28-2.36.66 0 1.36.12 1.36.12v1.5h-.77c-.76 0-1 .47-1 0v1.16h1.7l-.27 2.9h-1.43V21.9C18.34 21.13 22 16.99 22 12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ArcheLanding;
