import { useState } from "react";
import { LoadingOverlay } from "./loading-overlay";
import { Button } from "../button";
import { detectBrowser, supportsVideoFormat, getOptimalVideoFormat } from "../../../lib/browser-detection";

/**
 * Test component to verify cross-browser compatibility and responsive design
 */
export const CrossBrowserTest = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [testVideo, setTestVideo] = useState(0);
  
  const browserInfo = detectBrowser();
  const supportedFormats = {
    webm: supportsVideoFormat('webm'),
    mp4: supportsVideoFormat('mp4'),
    ogg: supportsVideoFormat('ogg')
  };
  const optimalFormat = getOptimalVideoFormat();

  const testVideos = [
    {
      name: "Default MP4",
      url: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
      videoUrls: {}
    },
    {
      name: "Multi-format",
      url: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4",
      videoUrls: {
        webm: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.webm",
        ogg: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.ogv"
      }
    }
  ];

  const currentVideo = testVideos[testVideo];

  const handleVideoLoaded = () => {
    console.log("✅ Video loaded successfully");
  };

  const handleVideoError = (error?: Error) => {
    console.error("❌ Video loading failed:", error);
  };

  const handleTransitionComplete = () => {
    console.log("✅ Transition completed");
  };

  const toggleOverlay = () => {
    setIsVisible(!isVisible);
  };

  const switchVideo = () => {
    setTestVideo((prev) => (prev + 1) % testVideos.length);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cross-Browser Loading Overlay Test</h1>
        
        {/* Browser Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Browser:</span>
              <div className="text-gray-600">
                {browserInfo.isChrome && "Chrome"}
                {browserInfo.isFirefox && "Firefox"}
                {browserInfo.isSafari && "Safari"}
                {browserInfo.isEdge && "Edge"}
                {browserInfo.isIE && "Internet Explorer"}
              </div>
            </div>
            <div>
              <span className="font-medium">Version:</span>
              <div className="text-gray-600">{browserInfo.version || "Unknown"}</div>
            </div>
            <div>
              <span className="font-medium">Device:</span>
              <div className="text-gray-600">
                {browserInfo.isMobile ? "Mobile" : "Desktop"}
              </div>
            </div>
            <div>
              <span className="font-medium">Optimal Format:</span>
              <div className="text-gray-600">{optimalFormat.toUpperCase()}</div>
            </div>
            <div>
              <span className="font-medium">Supported Formats:</span>
              <div className="text-gray-600">
                MP4: {supportedFormats.mp4 ? "✅" : "❌"} | 
                WebM: {supportedFormats.webm ? "✅" : "❌"} | 
                OGG: {supportedFormats.ogg ? "✅" : "❌"}
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={toggleOverlay}>
              {isVisible ? "Hide" : "Show"} Overlay
            </Button>
            <Button onClick={switchVideo} variant="outline">
              Switch Video ({currentVideo.name})
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Current video: {currentVideo.name}</p>
            <p>Video URL: {currentVideo.url}</p>
            {Object.keys(currentVideo.videoUrls).length > 0 && (
              <p>Alternative formats: {Object.keys(currentVideo.videoUrls).join(", ")}</p>
            )}
          </div>
        </div>

        {/* Responsive Test Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Responsive Design Test</h2>
          <div className="text-sm text-gray-600">
            <p>• Resize your browser window to test responsive behavior</p>
            <p>• Test on mobile devices by using browser dev tools</p>
            <p>• Check that video scales properly across all viewport sizes</p>
            <p>• Verify touch interactions work on mobile devices</p>
            <p>• Ensure loading spinner and buttons are properly sized</p>
          </div>
        </div>

        {/* Cross-Browser Test Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cross-Browser Test Checklist</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <input type="checkbox" id="autoplay" className="mr-2" />
              <label htmlFor="autoplay">Video autoplay works (or shows play button)</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="loading" className="mr-2" />
              <label htmlFor="loading">Loading spinner displays correctly</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="transition" className="mr-2" />
              <label htmlFor="transition">Dissolve transition works smoothly</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="responsive" className="mr-2" />
              <label htmlFor="responsive">Video scales properly on different screen sizes</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="touch" className="mr-2" />
              <label htmlFor="touch">Touch interactions work on mobile</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="fallback" className="mr-2" />
              <label htmlFor="fallback">Error handling and fallbacks work</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="zindex" className="mr-2" />
              <label htmlFor="zindex">Proper z-index and stacking context</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="performance" className="mr-2" />
              <label htmlFor="performance">Hardware acceleration and performance</label>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Console Output</h2>
          <div className="text-sm text-gray-600">
            <p>Check the browser console for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Video loading success/failure messages</li>
              <li>Transition completion notifications</li>
              <li>Browser detection information</li>
              <li>Any error messages or warnings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isVisible}
        videoUrl={currentVideo.url}
        videoUrls={currentVideo.videoUrls}
        onVideoLoaded={handleVideoLoaded}
        onVideoError={handleVideoError}
        onTransitionComplete={handleTransitionComplete}
        fallbackBgColor="bg-gray-900"
        attemptAutoplay={true}
        showPlayButton={true}
        playButtonText="Click to Play Video"
      />
    </div>
  );
};