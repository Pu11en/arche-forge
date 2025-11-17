import { useState, useEffect } from 'react';
import { LandingPage } from "./components/landing-page";
import { AboutPage } from "./components/about-page";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/about':
        return <AboutPage />;
      default:
        return (
          <div className="App" style={{
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}>
            <LandingPage
              desktopBackgroundVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
              mobileBackgroundVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4"
            />
          </div>
        );
    }
  };

  return renderPage();
}

export default App;