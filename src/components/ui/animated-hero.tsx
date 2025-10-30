import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "./button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const titles = useMemo(
    () => [
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
      "Adios, Motherfucker™"
    ]
      .filter(title => title.includes("™"))
      // Filter out overly long phrases that won't fit well on one line
      .filter(title => title.length <= 40),
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 3000); // Increased from 2000ms to 3000ms for better readability
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onCanPlay={() => setVideoLoaded(true)}
      >
        <source src="https://res.cloudinary.com/djg0pqts6/video/upload/v1761845865/Forge1_final_oqpbsa.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Fallback background while video loads */}
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-black z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}></div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      
      {/* Gradient overlay darker at bottom for improved text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
      
      <div className="relative z-20 container mx-auto py-20 lg:py-32 flex items-center justify-center flex-col gap-3 min-h-screen">
        {/* Combined heading and summary with consistent spacing */}
        <div className="text-center max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-wider font-serif font-black mb-2">
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] block mb-2">ARCHE FORGE</span>
            <div className="relative flex w-full justify-center overflow-visible h-16 md:h-20 lg:h-24 mb-2">
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] w-full text-center px-2 text-lg md:text-xl lg:text-2xl xl:text-3xl whitespace-nowrap overflow-visible leading-normal"
                  style={{ textOverflow: 'ellipsis' }}
                  initial={{ opacity: 0, y: "-100%" }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  animate={
                    titleNumber === index
                      ? {
                          y: "0%",
                          opacity: 1,
                          zIndex: 10,
                        }
                      : {
                          y: titleNumber > index ? "-100%" : "100%",
                          opacity: 0,
                          zIndex: 1,
                        }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </div>
          </h1>
          
          {/* Summary paragraph with consistent spacing */}
          <div className="max-w-3xl mx-auto mt-0 pt-0">
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-4 pb-2">
              Today's AI interactions lack soul.<br />
              Ditch the robotic scripts that break the connection. Our goal is to mirror<br />
              your identity, making AI feel less like a tool and more like you.
            </p>
          </div>
        </div>
        
        {/* Button row at the bottom with consistent spacing */}
        <div className="flex justify-center mt-4">
          <a
            href="https://www.linkedin.com/company/arche-forge/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block focus:outline-none focus:ring-4 focus:ring-white/30 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Button variant="secondary" size="lg" className="!gap-2 !text-base !px-6 !py-3 !bg-[#0077B5] hover:!bg-[#004d7a] hover:shadow-[0_10px_20px_rgba(0,119,181,0.3)] focus:!bg-[#004d7a] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.5)] transition-all duration-300">
              Visit our Linkedin <MoveRight className="!w-4 !h-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export { Hero };