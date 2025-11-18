// Test script to verify video sequence functionality
// Run this in the browser console to test the implementation

const testVideoSequence = {
  // Test 1: Check if video elements are properly loaded
  checkVideoElements() {
    console.log('=== Test 1: Video Elements Check ===');
    
    const introVideo = document.querySelector('video[src*="1114_2_z4csev.mp4"]');
    const loopingVideo = document.querySelector('video[src*="1103_2_yfa7mp.mp4"]');
    
    if (introVideo) {
      console.log('✅ Intro video element found');
      console.log('Intro video state:', {
        readyState: introVideo.readyState,
        currentTime: introVideo.currentTime,
        duration: introVideo.duration,
        paused: introVideo.paused,
        muted: introVideo.muted
      });
    } else {
      console.log('❌ Intro video element not found');
    }
    
    if (loopingVideo) {
      console.log('✅ Looping video element found');
      console.log('Looping video state:', {
        readyState: loopingVideo.readyState,
        currentTime: loopingVideo.currentTime,
        duration: loopingVideo.duration,
        paused: loopingVideo.paused,
        muted: loopingVideo.muted,
        loop: loopingVideo.loop
      });
    } else {
      console.log('❌ Looping video element not found');
    }
  },
  
  // Test 2: Check for white screen during transitions
  checkTransitionBackgrounds() {
    console.log('\n=== Test 2: Transition Backgrounds Check ===');
    
    const containers = document.querySelectorAll('.fixed.inset-0');
    containers.forEach((container, index) => {
      const computedStyle = window.getComputedStyle(container);
      const backgroundColor = computedStyle.backgroundColor;
      const opacity = computedStyle.opacity;
      
      console.log(`Container ${index}:`, {
        backgroundColor,
        opacity,
        hasBlackBg: backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === '#000000'
      });
    });
  },
  
  // Test 3: Check text overlay visibility
  checkTextOverlays() {
    console.log('\n=== Test 3: Text Overlays Check ===');
    
    const trademarkOverlay = document.querySelector('[aria-live="polite"]');
    const heading = document.querySelector('h1');
    const ctaButton = document.querySelector('button[aria-label="Enter the Forge You"]');
    
    if (trademarkOverlay) {
      console.log('✅ Trademark overlay found');
      console.log('Trademark overlay visible:', trademarkOverlay.style.display !== 'none');
    } else {
      console.log('❌ Trademark overlay not found');
    }
    
    if (heading) {
      console.log('✅ Heading found');
      console.log('Heading visible:', heading.style.display !== 'none');
      console.log('Heading text:', heading.textContent);
    } else {
      console.log('❌ Heading not found');
    }
    
    if (ctaButton) {
      console.log('✅ CTA button found');
      console.log('CTA button visible:', ctaButton.style.display !== 'none');
    } else {
      console.log('❌ CTA button not found');
    }
  },
  
  // Test 4: Monitor console for errors
  monitorConsoleErrors() {
    console.log('\n=== Test 4: Console Error Monitor ===');
    
    const originalError = console.error;
    const errors = [];
    
    console.error = function(...args) {
      errors.push(args);
      originalError.apply(console, args);
    };
    
    setTimeout(() => {
      console.error = originalError;
      
      if (errors.length === 0) {
        console.log('✅ No console errors detected');
      } else {
        console.log('❌ Console errors detected:');
        errors.forEach((error, index) => {
          console.log(`Error ${index + 1}:`, error);
        });
      }
    }, 5000);
  },
  
  // Test 5: Check video sequence state
  checkSequenceState() {
    console.log('\n=== Test 5: Sequence State Check ===');
    
    // Check React component state by examining DOM structure
    const loadingOverlay = document.querySelector('[class*="LoadingOverlay"]');
    const videoSequence = document.querySelector('[class*="VideoSequence"]');
    
    if (loadingOverlay) {
      console.log('✅ Loading overlay present - likely in intro state');
    } else {
      console.log('ℹ️ Loading overlay not present - likely in looping state');
    }
    
    // Check for trademark overlay visibility to determine state
    const trademarkVisible = document.querySelector('[aria-live="polite"]')?.style.display !== 'none';
    if (trademarkVisible) {
      console.log('ℹ️ Trademark overlay visible - likely in looping state');
    }
  },
  
  // Run all tests
  runAllTests() {
    console.log('🧪 Starting Video Sequence Tests...');
    console.log('Time:', new Date().toISOString());
    
    this.checkVideoElements();
    this.checkTransitionBackgrounds();
    this.checkTextOverlays();
    this.checkSequenceState();
    this.monitorConsoleErrors();
    
    console.log('\n🏁 Tests initiated. Check console for results in 5 seconds.');
  }
};

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
  // Make it available globally
  window.testVideoSequence = testVideoSequence;
  
  // Run tests after page loads
  if (document.readyState === 'complete') {
    setTimeout(() => testVideoSequence.runAllTests(), 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => testVideoSequence.runAllTests(), 1000);
    });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testVideoSequence;
}