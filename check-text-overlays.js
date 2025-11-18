// Script to test text overlay functionality
// Run this in browser console

function checkTextOverlays() {
  console.log('=== Checking Text Overlay Functionality ===');
  
  const results = {
    heading: { found: false, visible: false, centered: false, readable: false },
    trademark: { found: false, visible: false, centered: false, readable: false, rotating: false },
    cta: { found: false, visible: false, centered: false, readable: false }
  };
  
  // Check heading
  const heading = document.querySelector('h1');
  if (heading) {
    results.heading.found = true;
    results.heading.visible = heading.offsetParent !== null;
    results.heading.centered = checkCentered(heading);
    results.heading.readable = checkReadability(heading);
    
    console.log('Heading found:', results.heading);
    console.log('Heading text:', heading.textContent);
    console.log('Heading styles:', {
      fontFamily: window.getComputedStyle(heading).fontFamily,
      fontSize: window.getComputedStyle(heading).fontSize,
      color: window.getComputedStyle(heading).color,
      textShadow: window.getComputedStyle(heading).textShadow,
      position: window.getComputedStyle(heading).position,
      top: window.getComputedStyle(heading).top,
      left: window.getComputedStyle(heading).left,
      transform: window.getComputedStyle(heading).transform
    });
  } else {
    console.log('❌ Heading not found');
  }
  
  // Check trademark overlay
  const trademarkOverlay = document.querySelector('[aria-live="polite"]');
  if (trademarkOverlay) {
    results.trademark.found = true;
    results.trademark.visible = trademarkOverlay.offsetParent !== null;
    results.trademark.centered = checkCentered(trademarkOverlay);
    results.trademark.readable = checkReadability(trademarkOverlay);
    
    // Check if phrases are rotating by looking for animation or multiple elements
    const phrases = trademarkOverlay.querySelectorAll('p, div');
    results.trademark.rotating = phrases.length > 0 || 
      window.getComputedStyle(trademarkOverlay).animation !== 'none' ||
      trademarkOverlay.querySelector('[class*="motion"]');
    
    console.log('Trademark overlay found:', results.trademark);
    console.log('Trademark phrases:', phrases.length);
    
    if (phrases.length > 0) {
      console.log('Current phrase text:', phrases[0].textContent);
      console.log('Trademark styles:', {
        fontFamily: window.getComputedStyle(phrases[0]).fontFamily,
        fontSize: window.getComputedStyle(phrases[0]).fontSize,
        color: window.getComputedStyle(phrases[0]).color,
        textShadow: window.getComputedStyle(phrases[0]).textShadow,
        opacity: window.getComputedStyle(phrases[0]).opacity
      });
    }
  } else {
    console.log('❌ Trademark overlay not found');
  }
  
  // Check CTA button
  const ctaButton = document.querySelector('button[aria-label="Enter the Forge You"]');
  if (ctaButton) {
    results.cta.found = true;
    results.cta.visible = ctaButton.offsetParent !== null;
    results.cta.centered = checkCentered(ctaButton);
    results.cta.readable = checkReadability(ctaButton);
    
    console.log('CTA button found:', results.cta);
    console.log('CTA button text:', ctaButton.textContent);
    console.log('CTA button styles:', {
      fontFamily: window.getComputedStyle(ctaButton).fontFamily,
      fontSize: window.getComputedStyle(ctaButton).fontSize,
      color: window.getComputedStyle(ctaButton).color,
      backgroundColor: window.getComputedStyle(ctaButton).backgroundColor,
      border: window.getComputedStyle(ctaButton).border,
      textShadow: window.getComputedStyle(ctaButton).textShadow,
      position: window.getComputedStyle(ctaButton).position,
      bottom: window.getComputedStyle(ctaButton).bottom,
      left: window.getComputedStyle(ctaButton).left,
      transform: window.getComputedStyle(ctaButton).transform
    });
  } else {
    console.log('❌ CTA button not found');
  }
  
  // Check for proper z-index layering
  const zIndexes = {
    heading: heading ? parseInt(window.getComputedStyle(heading).zIndex) || 0 : 0,
    trademark: trademarkOverlay ? parseInt(window.getComputedStyle(trademarkOverlay).zIndex) || 0 : 0,
    cta: ctaButton ? parseInt(window.getComputedStyle(ctaButton).zIndex) || 0 : 0
  };
  console.log('Z-index values:', zIndexes);
  
  // Overall assessment
  const allFound = results.heading.found && results.trademark.found && results.cta.found;
  const allVisible = results.heading.visible && results.trademark.visible && results.cta.visible;
  const allCentered = results.heading.centered && results.trademark.centered && results.cta.centered;
  const allReadable = results.heading.readable && results.trademark.readable && results.cta.readable;
  
  console.log('\n=== Overall Assessment ===');
  console.log('All elements found:', allFound ? '✅' : '❌');
  console.log('All elements visible:', allVisible ? '✅' : '❌');
  console.log('All elements centered:', allCentered ? '✅' : '❌');
  console.log('All elements readable:', allReadable ? '✅' : '❌');
  
  if (allFound && allVisible && allCentered && allReadable) {
    console.log('🎉 SUCCESS: Text overlays are properly positioned and readable!');
  } else {
    console.log('⚠️ ISSUES: Some text overlays need attention');
  }
  
  return results;
}

function checkCentered(element) {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Check if element is roughly centered (within 20% of center)
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const elementCenterX = rect.left + rect.width / 2;
  const elementCenterY = rect.top + rect.height / 2;
  
  const toleranceX = viewportWidth * 0.2; // 20% tolerance
  const toleranceY = viewportHeight * 0.2; // 20% tolerance
  
  const isCenteredX = Math.abs(centerX - elementCenterX) < toleranceX;
  const isCenteredY = Math.abs(centerY - elementCenterY) < toleranceY;
  
  return isCenteredX && isCenteredY;
}

function checkReadability(element) {
  const styles = window.getComputedStyle(element);
  
  // Check for sufficient contrast (basic check)
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;
  const textShadow = styles.textShadow;
  
  // Check if text is visible (not transparent)
  const opacity = parseFloat(styles.opacity);
  const isVisible = opacity > 0.5;
  
  // Check for text shadow or outline for better readability
  const hasTextShadow = textShadow && textShadow !== 'none';
  
  // Check font size
  const fontSize = parseFloat(styles.fontSize);
  const hasReadableFontSize = fontSize >= 14; // 14px minimum
  
  return isVisible && (hasTextShadow || hasReadableFontSize);
}

// Monitor phrase rotation
function monitorPhraseRotation() {
  console.log('=== Monitoring Phrase Rotation ===');
  const trademarkOverlay = document.querySelector('[aria-live="polite"]');
  
  if (!trademarkOverlay) {
    console.log('❌ Trademark overlay not found for monitoring');
    return;
  }
  
  let lastPhrase = '';
  let rotationCount = 0;
  
  const checkInterval = setInterval(() => {
    const currentPhrase = trademarkOverlay.textContent?.trim() || '';
    
    if (currentPhrase !== lastPhrase && currentPhrase !== '') {
      rotationCount++;
      console.log(`Phrase rotation ${rotationCount}: "${currentPhrase}"`);
      lastPhrase = currentPhrase;
    }
  }, 500);
  
  // Stop monitoring after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log(`Phrase rotation monitoring complete. Total rotations: ${rotationCount}`);
    
    if (rotationCount > 0) {
      console.log('✅ Phrase rotation is working');
    } else {
      console.log('❌ No phrase rotation detected');
    }
  }, 10000);
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.checkTextOverlays = checkTextOverlays;
  window.monitorPhraseRotation = monitorPhraseRotation;
  
  console.log('Text overlay check functions loaded:');
  console.log('- checkTextOverlays() - Check positioning and readability');
  console.log('- monitorPhraseRotation() - Monitor phrase rotation for 10 seconds');
  
  // Auto-run after a short delay
  setTimeout(() => {
    checkTextOverlays();
    setTimeout(monitorPhraseRotation, 2000);
  }, 2000);
}