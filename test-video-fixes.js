// Test script to verify video sequence fixes
// This script will open the application and monitor console logs for video transitions

const { chromium } = require('playwright');

async function testVideoSequence() {
  console.log('Starting video sequence test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(msg.text());
    if (msg.text().includes('[VideoSequence]') || 
        msg.text().includes('[LoopingVideo]') || 
        msg.text().includes('[LoadingOverlay]') ||
        msg.text().includes('[useTransitionTiming]')) {
      console.log('CONSOLE:', msg.text());
    }
  });
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    console.log('Page loaded, waiting for video sequence to complete...');
    
    // Wait for the intro video to complete and transition to happen
    // This might take up to 10 seconds depending on video length
    await page.waitForTimeout(10000);
    
    // Check console messages for key events
    const introCompleted = consoleMessages.some(msg => msg.includes('Intro video completed'));
    const crossFadeStarted = consoleMessages.some(msg => msg.includes('Starting frame-perfect cross-fade'));
    const crossFadeComplete = consoleMessages.some(msg => msg.includes('Cross-fade transition complete'));
    const loopingVideoPlaying = consoleMessages.some(msg => msg.includes('Looping video confirmed playing'));
    
    console.log('\n=== TEST RESULTS ===');
    console.log('Intro video completed:', introCompleted);
    console.log('Cross-fade started:', crossFadeStarted);
    console.log('Cross-fade completed:', crossFadeComplete);
    console.log('Looping video playing:', loopingVideoPlaying);
    
    // Take a screenshot to verify the final state
    await page.screenshot({ path: 'video-sequence-test.png' });
    console.log('Screenshot saved as video-sequence-test.png');
    
    // Check if there are any error messages
    const errors = consoleMessages.filter(msg => 
      msg.includes('error') || 
      msg.includes('failed') || 
      msg.includes('Error')
    );
    
    if (errors.length > 0) {
      console.log('\n=== ERRORS FOUND ===');
      errors.forEach(error => console.log('ERROR:', error));
    } else {
      console.log('\n=== NO ERRORS DETECTED ===');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testVideoSequence();