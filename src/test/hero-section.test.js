import puppeteer from 'puppeteer';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  timeout: 10000,
  viewport: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 }
  }
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run a test
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    await testFunction();
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED' });
    console.log(`✅ PASSED: ${testName}`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Main test function
async function testHeroSection() {
  console.log('🚀 Starting Hero Section Tests');
  console.log('================================');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--autoplay-policy=no-user-gesture-required'
      ]
    });
    
    page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      console.log('📝 PAGE LOG:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('🚨 PAGE ERROR:', error.message);
    });
    
    // Test 1: Load application without errors
    await runTest('Load application without errors', async () => {
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      const title = await page.title();
      if (!title) throw new Error('Page title not found');
    });
    
    // Test 2: Intro video functionality
    await runTest('Intro video loads with correct attributes', async () => {
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('video', { timeout: TEST_CONFIG.timeout });
      
      const videoSrc = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video ? video.src : '';
      });
      
      if (!videoSrc.includes('1114_2_z4csev.mp4')) {
        throw new Error('Intro video URL is incorrect');
      }
      
      const autoPlay = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video ? video.autoplay : false;
      });
      
      if (!autoPlay) {
        throw new Error('Video autoplay is not enabled');
      }
      
      const muted = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video ? video.muted : false;
      });
      
      if (!muted) {
        throw new Error('Video is not muted');
      }
    });
    
    // Test 3: Video covers full screen with no controls
    await runTest('Video covers full screen with no controls', async () => {
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('video', { timeout: TEST_CONFIG.timeout });
      
      const videoStyle = await page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return null;
        const style = window.getComputedStyle(video);
        return {
          width: style.width,
          height: style.height,
          position: style.position,
          top: style.top,
          left: style.left
        };
      });
      
      if (!videoStyle) {
        throw new Error('Video element not found');
      }
      
      if (videoStyle.width !== '100vw' || videoStyle.height !== '100vh') {
        throw new Error('Video does not cover full screen');
      }
      
      const hasControls = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video ? video.controls : false;
      });
      
      if (hasControls) {
        throw new Error('Video has controls when it should not');
      }
    });
    
    // Test 4: Trademark phrases appear during intro video
    await runTest('Trademark phrases appear during intro video', async () => {
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('video', { timeout: TEST_CONFIG.timeout });
      
      // Wait a bit for trademark phrases to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tmPhraseExists = await page.evaluate(() => {
        const elements = document.querySelectorAll('p');
        for (const el of elements) {
          if (el.textContent && el.textContent.includes('™')) {
            return true;
          }
        }
        return false;
      });
      
      if (!tmPhraseExists) {
        throw new Error('No trademark phrases found');
      }
      
      const tmPhraseOpacity = await page.evaluate(() => {
        const elements = document.querySelectorAll('p');
        for (const el of elements) {
          if (el.textContent && el.textContent.includes('™')) {
            const style = window.getComputedStyle(el);
            return parseFloat(style.opacity);
          }
        }
        return null;
      });
      
      if (tmPhraseOpacity === null || tmPhraseOpacity >= 0.5) {
        throw new Error('Trademark phrases do not have low opacity');
      }
    });
    
    // Test 5: Hero text appears after intro video
    await runTest('Hero text appears after intro video', async () => {
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('video', { timeout: TEST_CONFIG.timeout });
      
      // Simulate video completion
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = video.duration || 30;
          video.dispatchEvent(new Event('ended'));
        }
      });
      
      // Wait for hero text to appear
      await page.waitForSelector('h1', { timeout: 5000 });
      
      const heroText = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent : '';
      });
      
      if (!heroText.includes("Today's AI answers. We remember.")) {
        throw new Error('Hero text content is incorrect');
      }
      
      const heroSubtitle = await page.evaluate(() => {
        const paragraphs = document.querySelectorAll('p');
        for (const p of paragraphs) {
          if (p.textContent && p.textContent.includes('SoulPrint')) {
            return p.textContent;
          }
        }
        return '';
      });
      
      if (!heroSubtitle.includes("SoulPrint makes AI feel less like a tool and more like you.")) {
        throw new Error('Hero subtitle content is incorrect');
      }
    });
    
    // Test 6: Hero text has transparent background
    await runTest('Hero text has transparent background', async () => {
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('video', { timeout: TEST_CONFIG.timeout });
      
      // Simulate video completion
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = video.duration || 30;
          video.dispatchEvent(new Event('ended'));
        }
      });
      
      // Wait for hero text to appear
      await page.waitForSelector('h1', { timeout: 5000 });
      
      const heroTextBackground = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return null;
        const parent = h1.parentElement;
        if (!parent) return null;
        const style = window.getComputedStyle(parent);
        return style.backgroundColor;
      });
      
      if (heroTextBackground && heroTextBackground !== 'transparent' && heroTextBackground !== 'rgba(0, 0, 0, 0)') {
        throw new Error('Hero text does not have transparent background');
      }
    });
    
    // Test 7: Mobile responsiveness
    await runTest('Mobile responsiveness', async () => {
      await page.setViewport(TEST_CONFIG.viewport.mobile);
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('video', { timeout: TEST_CONFIG.timeout });
      
      // Simulate video completion
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = video.duration || 30;
          video.dispatchEvent(new Event('ended'));
        }
      });
      
      // Wait for hero text to appear
      await page.waitForSelector('h1', { timeout: 5000 });
      
      const heroTextVisible = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return false;
        const style = window.getComputedStyle(h1);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      if (!heroTextVisible) {
        throw new Error('Hero text is not visible on mobile');
      }
    });
    
    // Test 8: No console errors
    await runTest('No console errors', async () => {
      const consoleErrors = [];
      page.on('pageerror', error => {
        consoleErrors.push(error.message);
      });
      
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors detected: ${consoleErrors.join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('Test setup error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Print test results
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`Total: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  
  console.log('\n📋 Detailed Results');
  console.log('==================');
  testResults.details.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  return testResults;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testHeroSection().catch(console.error);
}

export { testHeroSection };