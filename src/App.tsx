import { useState } from "react";
import { LandingPage } from "./components/ui/landing-page";
import { Hero } from "./components/ui/animated-hero";

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);

  const handleEnterForge = () => {
    setShowLandingPage(false);
  };

  return (
    <div className="App relative">
      {showLandingPage ? (
        <LandingPage onEnterForge={handleEnterForge} />
      ) : (
        /* Partner/About Page */
        <div className="transition-opacity duration-1000 opacity-100">
          <Hero />
        </div>
      )}
    </div>
  );
}

export default App;