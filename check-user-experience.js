// Comprehensive user experience testing script
// Run this in browser console

function checkUserExperience() {
  console.log('=== Comprehensive User Experience Test ===');
  
  const results = {
    performance: { score: 0, issues: [] },
    responsiveness: { score: 0, issues: [] },
    crossBrowser: { score: 0, issues: [] },
    accessibility: { score: 0, issues: [] },
    visualQuality: { score: 0, issues: [] }
  };
  
  // Performance checks
  checkPerformance(results.performance);
  
  // Responsiveness checks
  checkResponsiveness(results.responsiveness);
  
  // Cross-browser checks
  checkCrossBrowser(results.crossBrowser);
  
  // Accessibility checks
  checkAccessibility(results.accessibility);
  
  // Visual quality checks
  checkVisualQuality(results.visualQuality);
  
  // Calculate overall score
  const categories = Object.keys(results);
  const totalScore = categories.reduce((sum, cat) => sum + results[cat].score, 0);
  const maxScore = categories.length * 100;
  const overallScore = Math.round((totalScore / maxScore) * 100);
  
  console.log('\n=== Overall User Experience Score ===');
  console.log(`Overall Score: ${overallScore}%`);
  
  categories.forEach(category => {
    console.log(`${category.toUpperCase()}: ${results[category].score}%`);
    if (results[category].issues.length > 0) {
      console.log(`  Issues:`, results[category].issues);
    }
  });
  
  if (overallScore >= 90) {
    console.log('🎉 EXCELLENT: Professional quality implementation!');
  } else if (overallScore >= 80) {
    console.log('✅ GOOD: Minor optimizations needed');
  } else if (overallScore >= 70) {
    console.log('⚠️ FAIR: Several improvements needed');
  } else {
    console.log('❌ POOR: Major improvements needed');
  }
  
  return { overallScore, results };
}

function checkPerformance(result) {
  console.log('\n--- Performance Checks ---');
  
  // Check video loading performance
  const videos = document.querySelectorAll('video');
  let videoScore = 100;
  const videoIssues = [];
  
  videos.forEach((video, index) => {
    if (video.readyState < 3) { // HAVE_FUTURE_DATA
      videoScore -= 20;
      videoIssues.push(`Video ${index} not fully loaded`);
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      videoScore -= 20;
      videoIssues.push(`Video ${index} has no dimensions`);
    }
  });
  
  // Check for smooth animations
  const animatedElements = document.querySelectorAll('[class*="motion"], [class*="transition"]');
  let animationScore = 100;
  const animationIssues = [];
  
  animatedElements.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.transition && style.transition !== 'none') {
      // Check for GPU acceleration
      const transform = style.transform;
      const opacity = style.opacity;
      
      if (!transform && !opacity) {
        animationScore -= 10;
        animationIssues.push('Animation not using GPU-accelerated properties');
      }
    }
  });
  
  // Check for memory leaks (basic check)
  const elementCount = document.querySelectorAll('*').length;
  let memoryScore = 100;
  const memoryIssues = [];
  
  if (elementCount > 2000) {
    memoryScore -= 20;
    memoryIssues.push(`High DOM element count: ${elementCount}`);
  }
  
  // Check console for errors
  const hasConsoleErrors = console.error && console.error.toString().includes('native');
  let errorScore = hasConsoleErrors ? 50 : 100;
  const errorIssues = hasConsoleErrors ? ['Console errors detected'] : [];
  
  result.score = Math.round((videoScore + animationScore + memoryScore + errorScore) / 4);
  result.issues = [...videoIssues, ...animationIssues, ...memoryIssues, ...errorIssues];
  
  console.log(`Video performance: ${videoScore}%`);
  console.log(`Animation performance: ${animationScore}%`);
  console.log(`Memory usage: ${memoryScore}%`);
  console.log(`Error handling: ${errorScore}%`);
}

function checkResponsiveness(result) {
  console.log('\n--- Responsiveness Checks ---');
  
  let score = 100;
  const issues = [];
  
  // Check viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    score -= 20;
    issues.push('Missing viewport meta tag');
  }
  
  // Check responsive units in CSS
  const responsiveUnits = ['vw', 'vh', 'rem', 'em'];
  let hasResponsiveUnits = false;
  
  const elements = document.querySelectorAll('*');
  for (let i = 0; i < Math.min(elements.length, 100); i++) {
    const styles = window.getComputedStyle(elements[i]);
    responsiveUnits.forEach(unit => {
      if (styles.fontSize.includes(unit) || 
          styles.width.includes(unit) || 
          styles.height.includes(unit)) {
        hasResponsiveUnits = true;
      }
    });
    if (hasResponsiveUnits) break;
  }
  
  if (!hasResponsiveUnits) {
    score -= 20;
    issues.push('No responsive units detected');
  }
  
  // Check media queries
  const hasMediaQueries = window.matchMedia && window.matchMedia('(max-width: 768px)').matches !== undefined;
  if (!hasMediaQueries) {
    score -= 20;
    issues.push('Media queries not supported');
  }
  
  // Check flexible layouts
  const flexContainers = document.querySelectorAll('[class*="flex"]');
  if (flexContainers.length === 0) {
    score -= 20;
    issues.push('No flexible layouts detected');
  }
  
  // Test different viewport sizes
  const originalWidth = window.innerWidth;
  const testSizes = [320, 768, 1024, 1920];
  let layoutIssues = 0;
  
  testSizes.forEach(width => {
    // Simulate viewport change (basic check)
    if (width < originalWidth && document.body.scrollWidth > width) {
      layoutIssues++;
    }
  });
  
  if (layoutIssues > 0) {
    score -= 20;
    issues.push('Layout breaks at different viewport sizes');
  }
  
  result.score = Math.max(0, score);
  result.issues = issues;
  
  console.log(`Viewport meta tag: ${viewportMeta ? '✅' : '❌'}`);
  console.log(`Responsive units: ${hasResponsiveUnits ? '✅' : '❌'}`);
  console.log(`Media queries: ${hasMediaQueries ? '✅' : '❌'}`);
  console.log(`Flexible layouts: ${flexContainers.length > 0 ? '✅' : '❌'}`);
}

function checkCrossBrowser(result) {
  console.log('\n--- Cross-Browser Checks ---');
  
  let score = 100;
  const issues = [];
  
  // Check browser features
  const features = {
    video: !!document.createElement('video').canPlayType,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    geolocation: !!navigator.geolocation,
    webgl: !!document.createElement('canvas').getContext('webgl'),
    webAudio: !!(window.AudioContext || window.webkitAudioContext)
  };
  
  Object.entries(features).forEach(([feature, supported]) => {
    if (!supported) {
      score -= 10;
      issues.push(`${feature} not supported`);
    }
  });
  
  // Check for vendor prefixes
  const styles = window.getComputedStyle(document.body);
  const hasVendorPrefixes = Object.keys(styles).some(prop => prop.includes('-'));
  
  if (hasVendorPrefixes) {
    score -= 10;
    issues.push('Vendor prefixes detected (may indicate compatibility issues)');
  }
  
  // Check for polyfills
  const hasPolyfills = document.querySelector('script[src*="polyfill"]') ||
                     document.querySelector('script[src*="shim"]');
  
  if (hasPolyfills) {
    score -= 10;
    issues.push('Polyfills detected (compatibility concerns)');
  }
  
  result.score = Math.max(0, score);
  result.issues = issues;
  
  console.log('Feature support:', features);
}

function checkAccessibility(result) {
  console.log('\n--- Accessibility Checks ---');
  
  let score = 100;
  const issues = [];
  
  // Check for alt text on images
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
  
  if (imagesWithoutAlt.length > 0) {
    score -= 20;
    issues.push(`${imagesWithoutAlt.length} images without alt text`);
  }
  
  // Check for ARIA labels
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
  const elementsWithoutAria = Array.from(interactiveElements).filter(el => 
    !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')
  );
  
  if (elementsWithoutAria.length > 0) {
    score -= 20;
    issues.push(`${elementsWithoutAria.length} interactive elements without ARIA labels`);
  }
  
  // Check for semantic HTML
  const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
  const hasSemanticHTML = semanticTags.some(tag => document.querySelector(tag));
  
  if (!hasSemanticHTML) {
    score -= 20;
    issues.push('No semantic HTML5 tags detected');
  }
  
  // Check for keyboard navigation
  const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
  if (focusableElements.length === 0) {
    score -= 20;
    issues.push('No keyboard-navigable elements');
  }
  
  // Check color contrast (basic check)
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
  let contrastIssues = 0;
  
  textElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Basic check for sufficient contrast
    if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
      contrastIssues++;
    }
  });
  
  if (contrastIssues > 0) {
    score -= 20;
    issues.push(`${contrastIssues} elements with poor color contrast`);
  }
  
  result.score = Math.max(0, score);
  result.issues = issues;
  
  console.log(`Images with alt text: ${images.length - imagesWithoutAlt.length}/${images.length}`);
  console.log(`Elements with ARIA labels: ${interactiveElements.length - elementsWithoutAria.length}/${interactiveElements.length}`);
  console.log(`Semantic HTML: ${hasSemanticHTML ? '✅' : '❌'}`);
  console.log(`Keyboard navigation: ${focusableElements.length > 0 ? '✅' : '❌'}`);
}

function checkVisualQuality(result) {
  console.log('\n--- Visual Quality Checks ---');
  
  let score = 100;
  const issues = [];
  
  // Check for consistent fonts
  const fontFamilies = new Set();
  const textElements = document.querySelectorAll('*');
  
  for (let i = 0; i < Math.min(textElements.length, 50); i++) {
    const fontFamily = window.getComputedStyle(textElements[i]).fontFamily;
    if (fontFamily && fontFamily !== 'initial') {
      fontFamilies.add(fontFamily.split(',')[0]); // Get first font in stack
    }
  }
  
  if (fontFamilies.size > 3) {
    score -= 15;
    issues.push(`Too many different fonts: ${fontFamilies.size}`);
  }
  
  // Check for consistent spacing
  const margins = new Set();
  const paddings = new Set();
  
  for (let i = 0; i < Math.min(textElements.length, 50); i++) {
    const styles = window.getComputedStyle(textElements[i]);
    margins.add(styles.margin);
    paddings.add(styles.padding);
  }
  
  if (margins.size > 10 || paddings.size > 10) {
    score -= 15;
    issues.push('Inconsistent spacing detected');
  }
  
  // Check for broken layout
  const overlappingElements = [];
  for (let i = 0; i < Math.min(textElements.length, 20); i++) {
    const rect1 = textElements[i].getBoundingClientRect();
    for (let j = i + 1; j < Math.min(textElements.length, 20); j++) {
      const rect2 = textElements[j].getBoundingClientRect();
      if (rect1.left < rect2.left + rect2.width &&
          rect1.left + rect1.width > rect2.left &&
          rect1.top < rect2.top + rect2.height &&
          rect1.top + rect1.height > rect2.top) {
        overlappingElements.push(i, j);
      }
    }
  }
  
  if (overlappingElements.length > 0) {
    score -= 20;
    issues.push('Overlapping elements detected');
  }
  
  // Check for visual hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const hasHeadingHierarchy = headings.length > 0;
  
  if (!hasHeadingHierarchy) {
    score -= 20;
    issues.push('No heading hierarchy found');
  }
  
  // Check for proper color usage
  const hasColorScheme = document.querySelector('meta[name="theme-color"]') ||
                         document.querySelector('meta[name="color-scheme"]');
  
  if (!hasColorScheme) {
    score -= 10;
    issues.push('No color scheme meta tag');
  }
  
  result.score = Math.max(0, score);
  result.issues = issues;
  
  console.log(`Font families: ${fontFamilies.size} (should be ≤ 3)`);
  console.log(`Spacing consistency: ${margins.size <= 10 && paddings.size <= 10 ? '✅' : '❌'}`);
  console.log(`Layout overlaps: ${overlappingElements.length === 0 ? '✅' : '❌'}`);
  console.log(`Heading hierarchy: ${hasHeadingHierarchy ? '✅' : '❌'}`);
  console.log(`Color scheme: ${hasColorScheme ? '✅' : '❌'}`);
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.checkUserExperience = checkUserExperience;
  console.log('User experience check function loaded. Run checkUserExperience() to start testing.');
  
  // Auto-run after a short delay
  setTimeout(checkUserExperience, 3000);
}