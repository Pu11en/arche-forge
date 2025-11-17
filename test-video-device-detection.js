/**
 * Test script to verify video device detection functionality
 * Run this in the browser console to test the implementation
 */

// Test function to verify device detection and video URL selection
function testVideoDeviceDetection() {
  console.log('=== Video Device Detection Test ===');
  
  // Get the browser detection function from the app
  const detectBrowser = window.detectBrowser || (() => {
    // Fallback implementation if not available globally
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor || '';
    
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(vendor) && !isChrome;
    const isEdge = /Edg/.test(userAgent);
    const isIE = /MSIE|Trident/.test(userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktop = !isMobile;
    
    return {
      isChrome, isFirefox, isSafari, isEdge, isIE, isMobile, isDesktop,
      version: null
    };
  });
  
  // Test device detection
  const browser = detectBrowser();
  console.log('Device Detection Results:', browser);
  
  // Expected URLs
  const DESKTOP_VIDEO_URL = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4";
  const MOBILE_VIDEO_URL = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4";
  
  // Determine expected URL
  const expectedUrl = browser.isMobile ? MOBILE_VIDEO_URL : DESKTOP_VIDEO_URL;
  console.log('Expected Video URL:', expectedUrl);
  console.log('Device Type:', browser.isMobile ? 'Mobile' : 'Desktop');
  
  // Check if video element exists and what URL it's using
  const videoElement = document.querySelector('video');
  if (videoElement) {
    const sources = videoElement.querySelectorAll('source');
    console.log('Video sources found:', sources.length);
    
    sources.forEach((source, index) => {
      console.log(`Source ${index}:`, {
        src: source.src,
        type: source.type
      });
    });
    
    // Check if the expected URL is among the sources
    const hasCorrectUrl = Array.from(sources).some(source => 
      source.src.includes(browser.isMobile ? '1114_2_z4csev.mp4' : '1103_2_yfa7mp.mp4')
    );
    
    console.log('Correct video URL detected:', hasCorrectUrl ? '✅ Yes' : '❌ No');
    
    // Test video playback
    console.log('Testing video playback...');
    videoElement.play().then(() => {
      console.log('✅ Video playback started successfully');
    }).catch(error => {
      console.warn('⚠️ Video autoplay failed (might be normal):', error.message);
    });
  } else {
    console.log('❌ No video element found on the page');
  }
  
  // Check for console errors
  console.log('Checking for console errors...');
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Check after a delay
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log('❌ Console errors detected:', errors);
    } else {
      console.log('✅ No console errors detected');
    }
  }, 3000);
  
  return {
    deviceType: browser.isMobile ? 'Mobile' : 'Desktop',
    expectedUrl,
    hasVideoElement: !!videoElement,
    browserInfo: browser
  };
}

// Function to simulate device switching (for testing)
function simulateDeviceSwitch() {
  console.log('=== Simulating Device Switch ===');
  
  const videoElement = document.querySelector('video');
  if (!videoElement) {
    console.log('❌ No video element found');
    return;
  }
  
  // Get current sources
  const sources = videoElement.querySelectorAll('source');
  const currentSources = Array.from(sources).map(s => s.src);
  
  // Determine if we're currently using mobile or desktop video
  const isCurrentlyMobile = currentSources.some(src => src.includes('1114_2_z4csev.mp4'));
  
  // Create new sources for the opposite device type
  const newVideoUrl = isCurrentlyMobile 
    ? "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
    : "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4";
  
  console.log(`Switching from ${isCurrentlyMobile ? 'Mobile' : 'Desktop'} to ${isCurrentlyMobile ? 'Desktop' : 'Mobile'} video`);
  console.log('New video URL:', newVideoUrl);
  
  // Update video sources
  sources.forEach(source => {
    source.src = newVideoUrl;
  });
  
  // Reload the video
  videoElement.load();
  
  console.log('✅ Video sources updated, reloading...');
  
  return {
    previousDevice: isCurrentlyMobile ? 'Mobile' : 'Desktop',
    newDevice: isCurrentlyMobile ? 'Desktop' : 'Mobile',
    newVideoUrl
  };
}

// Test network conditions (if available)
function testNetworkConditions() {
  console.log('=== Network Conditions Test ===');
  
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    console.log('Network Information:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  } else {
    console.log('Network Information API not available');
  }
  
  // Test video loading performance
  const videoElement = document.querySelector('video');
  if (videoElement) {
    const startTime = performance.now();
    
    videoElement.addEventListener('canplay', () => {
      const loadTime = performance.now() - startTime;
      console.log(`Video loaded in ${loadTime.toFixed(2)}ms`);
      
      if (loadTime > 5000) {
        console.log('⚠️ Slow video loading detected');
      } else {
        console.log('✅ Video loading time is acceptable');
      }
    }, { once: true });
  }
}

// Run all tests
function runAllTests() {
  console.log('🧪 Starting Video Device Detection Tests...');
  
  const testResults = {
    deviceDetection: testVideoDeviceDetection(),
    networkConditions: testNetworkConditions()
  };
  
  console.log('=== Test Summary ===');
  console.log('Test Results:', testResults);
  
  return testResults;
}

// Make functions available globally
window.testVideoDeviceDetection = testVideoDeviceDetection;
window.simulateDeviceSwitch = simulateDeviceSwitch;
window.testNetworkConditions = testNetworkConditions;
window.runAllTests = runAllTests;

console.log('🔧 Video device detection test functions loaded. Run runAllTests() to start testing.');