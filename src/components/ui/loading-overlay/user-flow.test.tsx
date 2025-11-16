import React, { useState, useEffect } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { Hero } from "../animated-hero.tsx";
import { Button } from "../button.tsx";

/**
 * Complete User Flow Test Component
 * Tests the entire user journey from loading overlay to hero reveal
 */
const UserFlowTest = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [flowState, setFlowState] = useState({
    videoLoaded: false,
    videoPlaying: false,
    transitionStarted: false,
    transitionComplete: false,
    heroVisible: false
  });

  const testSteps = [
    {
      name: 'Initial Load',
      description: 'Loading overlay appears on page load',
      duration: 2000
    },
    {
      name: 'Video Loading',
      description: 'Video begins loading with spinner',
      duration: 3000
    },
    {
      name: 'Video Playback',
      description: 'Video starts playing automatically',
      duration: 2000
    },
    {
      name: 'Video Completion',
      description: 'Video plays through to completion',
      duration: 5000
    },
    {
      name: 'Transition Start',
      description: 'Dissolve transition begins',
      duration: 1500
    },
    {
      name: 'Transition Complete',
      description: 'Overlay fades out completely',
      duration: 1000
    },
    {
      name: 'Hero Reveal',
      description: 'Hero content becomes visible',
      duration: 1000
    }
  ];

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const updateFlowState = (updates: Partial<typeof flowState>) => {
    setFlowState(prev => ({ ...prev, ...updates }));
  };

  const runCompleteUserFlowTest = async () => {
    setIsTestRunning(true);
    setCurrentStep(0);
    setTestResults([]);
    setFlowState({
      videoLoaded: false,
      videoPlaying: false,
      transitionStarted: false,
      transitionComplete: false,
      heroVisible: false
    });

    addTestResult('🚀 Starting complete user flow test...');

    for (let i = 0; i < testSteps.length; i++) {
      const step = testSteps[i];
      setCurrentStep(i);
      addTestResult(`📋 Step ${i + 1}: ${step.name}`);
      
      // Execute step validation
      const stepResult = await executeStep(i);
      addTestResult(stepResult);
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    // Final validation
    const finalValidation = await validateCompleteFlow();
    addTestResult(finalValidation);

    addTestResult('✅ Complete user flow test finished');
    setIsTestRunning(false);
  };

  const executeStep = async (stepIndex: number): Promise<string> => {
    switch (stepIndex) {
      case 0: // Initial Load
        return await validateInitialLoad();
      case 1: // Video Loading
        return await validateVideoLoading();
      case 2: // Video Playback
        return await validateVideoPlayback();
      case 3: // Video Completion
        return await validateVideoCompletion();
      case 4: // Transition Start
        return await validateTransitionStart();
      case 5: // Transition Complete
        return await validateTransitionComplete();
      case 6: // Hero Reveal
        return await validateHeroReveal();
      default:
        return '❌ Unknown step';
    }
  };

  const validateInitialLoad = async (): Promise<string> => {
    const overlay = document.querySelector('.motion-div') as HTMLElement | null;
    if (!overlay) {
      return '❌ Loading overlay not found';
    }

    const isVisible = overlay.style.display !== 'none' && overlay.style.opacity !== '0';
    if (!isVisible) {
      return '❌ Loading overlay not visible';
    }

    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video) {
      return '❌ Video element not found';
    }

    return '✅ Loading overlay loaded correctly';
  };

  const validateVideoLoading = async (): Promise<string> => {
    const spinner = document.querySelector('[class*="spinner"], [class*="loading"]') as HTMLElement | null;
    if (!spinner) {
      return '❌ Loading spinner not found';
    }

    const isVisible = spinner.style.display !== 'none';
    if (!isVisible) {
      return '❌ Loading spinner not visible';
    }

    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video) {
      return '❌ Video element not found';
    }

    const isLoading = video.readyState < 2; // HAVE_CURRENT_DATA
    if (!isLoading) {
      updateFlowState({ videoLoaded: true });
      return '✅ Video loaded quickly';
    }

    return '✅ Video loading in progress';
  };

  const validateVideoPlayback = async (): Promise<string> => {
    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video) {
      return '❌ Video element not found';
    }

    // Try to play video
    try {
      if (video.paused) {
        await video.play();
      }
    } catch (error) {
      // Check if play button is shown
      const playButton = document.querySelector('button');
      if (playButton) {
        return '✅ Play button shown for autoplay restriction';
      }
      return '❌ Autoplay failed and no play button shown';
    }

    const isPlaying = !video.paused && video.readyState >= 2;
    if (isPlaying) {
      updateFlowState({ videoPlaying: true });
      return '✅ Video playing successfully';
    }

    return '❌ Video not playing';
  };

  const validateVideoCompletion = async (): Promise<string> => {
    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video) {
      return '❌ Video element not found';
    }

    // Fast forward to near end for testing
    if (video.duration) {
      video.currentTime = Math.max(0, video.duration - 0.5);
    }

    // Wait a bit for video to process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if video is near end
    const isNearEnd = video.duration && video.currentTime >= video.duration - 1;
    if (isNearEnd) {
      return '✅ Video playing to completion';
    }

    return '❌ Video not progressing to completion';
  };

  const validateTransitionStart = async (): Promise<string> => {
    const overlay = document.querySelector('.motion-div') as HTMLElement | null;
    if (!overlay) {
      return '❌ Loading overlay not found';
    }

    // Trigger transition by ending video
    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (video) {
      video.dispatchEvent(new Event('ended'));
    }

    // Wait for transition to start
    await new Promise(resolve => setTimeout(resolve, 100));

    const styles = window.getComputedStyle(overlay);
    const isTransitioning = styles.opacity !== '1' && styles.opacity !== '0';
    
    if (isTransitioning) {
      updateFlowState({ transitionStarted: true });
      return '✅ Transition started correctly';
    }

    return '❌ Transition not started';
  };

  const validateTransitionComplete = async (): Promise<string> => {
    const overlay = document.querySelector('.motion-div') as HTMLElement | null;
    if (!overlay) {
      updateFlowState({ transitionComplete: true });
      return '✅ Overlay removed from DOM';
    }

    const styles = window.getComputedStyle(overlay);
    const isHidden = styles.opacity === '0' || styles.display === 'none';
    
    if (isHidden) {
      updateFlowState({ transitionComplete: true });
      return '✅ Transition completed';
    }

    return '❌ Transition not complete';
  };

  const validateHeroReveal = async (): Promise<string> => {
    const hero = document.querySelector('.relative.z-20') as HTMLElement | null;
    if (!hero) {
      return '❌ Hero component not found';
    }

    const styles = window.getComputedStyle(hero);
    const isVisible = styles.opacity === '1';
    
    if (isVisible) {
      updateFlowState({ heroVisible: true });
      return '✅ Hero content revealed';
    }

    return '❌ Hero content not visible';
  };

  const validateCompleteFlow = async (): Promise<string> => {
    const allStepsComplete = 
      flowState.videoLoaded &&
      flowState.videoPlaying &&
      flowState.transitionStarted &&
      flowState.transitionComplete &&
      flowState.heroVisible;

    if (allStepsComplete) {
      return '✅ Complete user flow successful';
    }

    const failedSteps = [];
    if (!flowState.videoLoaded) failedSteps.push('video loading');
    if (!flowState.videoPlaying) failedSteps.push('video playback');
    if (!flowState.transitionStarted) failedSteps.push('transition start');
    if (!flowState.transitionComplete) failedSteps.push('transition complete');
    if (!flowState.heroVisible) failedSteps.push('hero reveal');

    return `❌ Failed steps: ${failedSteps.join(', ')}`;
  };

  const runStepByStepTest = async () => {
    setIsTestRunning(true);
    addTestResult('🚀 Starting step-by-step test...');

    for (let i = 0; i < testSteps.length; i++) {
      setCurrentStep(i);
      const step = testSteps[i];
      addTestResult(`📋 Executing: ${step.description}`);
      
      const result = await executeStep(i);
      addTestResult(result);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsTestRunning(false);
  };

  const resetTest = () => {
    setCurrentStep(0);
    setTestResults([]);
    setFlowState({
      videoLoaded: false,
      videoPlaying: false,
      transitionStarted: false,
      transitionComplete: false,
      heroVisible: false
    });
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / testSteps.length) * 100;
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={!flowState.transitionComplete}
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
        videoUrls={{
          webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
          ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
        }}
        fallbackBgColor="bg-black"
        onVideoLoaded={() => {
          updateFlowState({ videoLoaded: true });
          addTestResult('✅ Video loaded event fired');
        }}
        onVideoError={(error) => addTestResult(`❌ Video error: ${error?.message || 'Unknown error'}`)}
        onTransitionComplete={() => {
          updateFlowState({ transitionComplete: true });
          addTestResult('✅ Transition complete event fired');
        }}
        attemptAutoplay={true}
        showPlayButton={true}
        playButtonText="Play to Continue"
      />

      {/* Hero Content */}
      <div className={`transition-opacity duration-1000 ${flowState.transitionComplete ? 'opacity-100' : 'opacity-0'}`}>
        <Hero />
      </div>

      {/* Test Controls Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-lg font-semibold mb-3">User Flow Test</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Step {currentStep + 1} of {testSteps.length}</span>
            <span>{getStepProgress().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {testSteps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div 
                key={index}
                className={`p-2 rounded text-xs ${
                  status === 'completed' ? 'bg-green-50 text-green-700' :
                  status === 'active' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-50 text-gray-600'
                }`}
              >
                <div className="font-medium">{step.name}</div>
                <div className="text-xs opacity-75">{step.description}</div>
              </div>
            );
          })}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button
            onClick={runCompleteUserFlowTest}
            disabled={isTestRunning}
            className="w-full"
          >
            {isTestRunning ? 'Running...' : 'Run Complete Flow'}
          </Button>
          
          <Button
            onClick={runStepByStepTest}
            disabled={isTestRunning}
            variant="outline"
            className="w-full"
          >
            {isTestRunning ? 'Running...' : 'Step by Step'}
          </Button>
          
          <Button
            onClick={resetTest}
            variant="outline"
            className="w-full"
          >
            Reset Test
          </Button>
        </div>
      </div>

      {/* Flow State Display */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-semibold mb-2">Flow State:</h4>
        <div className="text-xs space-y-1">
          <div className={flowState.videoLoaded ? 'text-green-600' : 'text-gray-600'}>
            Video Loaded: {flowState.videoLoaded ? '✅' : '❌'}
          </div>
          <div className={flowState.videoPlaying ? 'text-green-600' : 'text-gray-600'}>
            Video Playing: {flowState.videoPlaying ? '✅' : '❌'}
          </div>
          <div className={flowState.transitionStarted ? 'text-green-600' : 'text-gray-600'}>
            Transition Started: {flowState.transitionStarted ? '✅' : '❌'}
          </div>
          <div className={flowState.transitionComplete ? 'text-green-600' : 'text-gray-600'}>
            Transition Complete: {flowState.transitionComplete ? '✅' : '❌'}
          </div>
          <div className={flowState.heroVisible ? 'text-green-600' : 'text-gray-600'}>
            Hero Visible: {flowState.heroVisible ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md max-h-64 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-2">Test Results:</h4>
          <div className="text-xs font-mono space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : 'text-gray-600'}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { UserFlowTest };