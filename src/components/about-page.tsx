import React from 'react';
import { Button } from './ui/button';

const AboutPage: React.FC = () => {
  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    // Dispatch a popstate event to notify the App component
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-8" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          About ARCHE FORGE
        </h1>
        
        <p className="text-lg md:text-xl mb-12 leading-relaxed">
          ARCHE FORGE is pioneering the future of AI interaction through our innovative SoulPrint technology. 
          We're transforming artificial intelligence from a mere tool into a personalized extension of yourself.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Personalization</h3>
            <p>AI that learns and adapts to your unique communication style and preferences.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Memory</h3>
            <p>Our systems remember past interactions to provide contextually aware responses.</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Evolution</h3>
            <p>Continuous improvement through advanced machine learning algorithms.</p>
          </div>
        </div>
        
        <Button
          onClick={handleBackToHome}
          className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export { AboutPage };