// Simple script to check if loading icons are hidden
// Run this in browser console

function checkLoadingIcons() {
  console.log('=== Checking for Loading Icons ===');
  
  // Check for loading spinners
  const loadingSpinners = document.querySelectorAll('[class*="animate-spin"], [class*="loader"], [class*="spinner"]');
  console.log('Loading spinners found:', loadingSpinners.length);
  
  // Check for play buttons
  const playButtons = document.querySelectorAll('button[aria-label*="Play"], button[aria-label*="play"]');
  console.log('Play buttons found:', playButtons.length);
  
  // Check for error messages
  const errorMessages = document.querySelectorAll('[class*="error"], [class*="Error"]');
  console.log('Error messages found:', errorMessages.length);
  
  // Check for buffering messages
  const bufferingMessages = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('Buffering')
  );
  console.log('Buffering messages found:', bufferingMessages.length);
  
  // Check for loading messages
  const loadingMessages = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('Loading')
  );
  console.log('Loading messages found:', loadingMessages.length);
  
  // Check video elements
  const videos = document.querySelectorAll('video');
  console.log('Video elements found:', videos.length);
  videos.forEach((video, index) => {
    console.log(`Video ${index}:`, {
      src: video.src,
      readyState: video.readyState,
      paused: video.paused,
      muted: video.muted,
      loop: video.loop,
      style: {
        opacity: video.style.opacity,
        backgroundColor: video.style.backgroundColor
      }
    });
  });
  
  // Overall status
  const totalVisibleUI = loadingSpinners.length + playButtons.length + errorMessages.length + bufferingMessages.length + loadingMessages.length;
  if (totalVisibleUI === 0) {
    console.log('✅ SUCCESS: No loading icons, play buttons, or error messages visible');
  } else {
    console.log('❌ ISSUE: Found visible UI elements that should be hidden');
  }
  
  return {
    loadingSpinners: loadingSpinners.length,
    playButtons: playButtons.length,
    errorMessages: errorMessages.length,
    bufferingMessages: bufferingMessages.length,
    loadingMessages: loadingMessages.length,
    totalVisibleUI
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.checkLoadingIcons = checkLoadingIcons;
  console.log('checkLoadingIcons() function loaded. Run it to check for loading icons.');
  
  // Auto-run after a short delay
  setTimeout(checkLoadingIcons, 2000);
}