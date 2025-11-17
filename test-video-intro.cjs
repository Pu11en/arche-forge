const puppeteer = require('puppeteer');
const fs = require('fs');

async function testVideoIntro() {
    console.log('Starting Video Intro Implementation Test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Set to true for automated testing
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture console output
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
        console.error('Page Error:', error.message);
    });
    
    // Test results
    const results = {
        buildTest: { passed: false, message: '' },
        videoPlaybackTest: { passed: false, message: '' },
        transitionTest: { passed: false, message: '' },
        errorHandlingTest: { passed: false, message: '' },
        crossBrowserTest: { passed: false, message: '' }
    };
    
    try {
        // Test 1: Check if application loads
        console.log('1. Testing application load...');
        await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
        
        const title = await page.title();
        if (title.includes('Arche Forge')) {
            results.buildTest.passed = true;
            results.buildTest.message = 'Application loads successfully with correct title';
        } else {
            results.buildTest.message = `Unexpected title: ${title}`;
        }
        
        // Test 2: Check video element
        console.log('\n2. Testing video element...');
        const videoElement = await page.$('video');
        
        if (videoElement) {
            const videoAttrs = await page.evaluate((video) => {
                return {
                    autoplay: video.autoplay,
                    muted: video.muted,
                    playsInline: video.playsInline,
                    controls: video.controls,
                    src: video.src,
                    className: video.className,
                    parentClassName: video.parentElement?.className
                };
            }, videoElement);
            
            console.log('Video attributes:', videoAttrs);
            
            // Check required attributes
            const hasCorrectAttrs = videoAttrs.autoplay && 
                                   videoAttrs.muted && 
                                   videoAttrs.playsInline && 
                                   !videoAttrs.controls &&
                                   videoAttrs.src.includes('cloudinary');
            
            if (hasCorrectAttrs) {
                results.videoPlaybackTest.passed = true;
                results.videoPlaybackTest.message = 'Video element has correct attributes (autoplay, muted, playsInline, no controls)';
            } else {
                results.videoPlaybackTest.message = 'Video element missing required attributes';
            }
        } else {
            results.videoPlaybackTest.message = 'Video element not found';
        }
        
        // Test 3: Check video container styling
        console.log('\n3. Testing video container styling...');
        const videoContainer = await page.$('.fixed.inset-0');
        
        if (videoContainer) {
            const containerStyles = await page.evaluate((container) => {
                const computedStyle = window.getComputedStyle(container);
                return {
                    position: computedStyle.position,
                    top: computedStyle.top,
                    left: computedStyle.left,
                    width: computedStyle.width,
                    height: computedStyle.height,
                    overflow: computedStyle.overflow
                };
            }, videoContainer);
            
            console.log('Video container styles:', containerStyles);
            
            const hasCorrectStyling = containerStyles.position === 'fixed' &&
                                     containerStyles.top === '0px' &&
                                     containerStyles.left === '0px' &&
                                     (containerStyles.width === '100vw' || containerStyles.width === '100%') &&
                                     (containerStyles.height === '100vh' || containerStyles.height === '100%');
            
            if (hasCorrectStyling) {
                results.videoPlaybackTest.message += ' | Video container has correct full viewport styling';
            }
        }
        
        // Test 4: Check transition logic
        console.log('\n4. Testing transition logic...');
        
        // Check if the main content is initially hidden
        const mainContentInitiallyHidden = await page.evaluate(() => {
            const mainContent = document.querySelector('.absolute.inset-0');
            if (mainContent) {
                const computedStyle = window.getComputedStyle(mainContent);
                return computedStyle.display === 'none' || 
                       computedStyle.visibility === 'hidden' ||
                       computedStyle.opacity === '0';
            }
            return false;
        });
        
        // Simulate video end by calling the onVideoEnd callback
        const transitionSuccessful = await page.evaluate(() => {
            // Find the VideoIntro component and trigger its onVideoEnd callback
            const video = document.querySelector('video');
            if (video) {
                // Dispatch the 'ended' event
                video.dispatchEvent(new Event('ended'));
                return true;
            }
            return false;
        });
        
        // Wait a bit for the state to update
        await page.waitForTimeout(1000);
        
        // Check if main content is now visible
        const mainContentVisible = await page.evaluate(() => {
            const mainContent = document.querySelector('.absolute.inset-0');
            if (mainContent) {
                const computedStyle = window.getComputedStyle(mainContent);
                return computedStyle.display !== 'none' && 
                       computedStyle.visibility !== 'hidden';
            }
            return false;
        });
        
        if (transitionSuccessful && mainContentVisible) {
            results.transitionTest.passed = true;
            results.transitionTest.message = 'Transition from video to main content works correctly';
        } else {
            results.transitionTest.message = 'Transition test failed';
        }
        
        // Test 5: Check for console errors
        console.log('\n5. Testing error handling...');
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warning');
        
        if (errors.length === 0 && warnings.length === 0) {
            results.errorHandlingTest.passed = true;
            results.errorHandlingTest.message = 'No console errors or warnings detected';
        } else {
            results.errorHandlingTest.message = `Found ${errors.length} errors and ${warnings.length} warnings`;
        }
        
        // Test 6: Check for 'the pool' section
        console.log('\n6. Testing "the pool" section accessibility...');
        const poolSection = await page.evaluate(() => {
            // Look for text content that might indicate "the pool" section
            const allText = document.body.innerText.toLowerCase();
            return allText.includes('pool');
        });
        
        if (poolSection) {
            results.transitionTest.message += ' | "The pool" section is accessible';
        }
        
        // Test 7: Check video URL accessibility
        console.log('\n7. Testing video URL accessibility...');
        const videoUrlAccessible = await page.evaluate(async () => {
            const video = document.querySelector('video');
            if (video && video.src) {
                try {
                    const response = await fetch(video.src, { method: 'HEAD' });
                    return response.ok;
                } catch (e) {
                    return false;
                }
            }
            return false;
        });
        
        if (videoUrlAccessible) {
            results.videoPlaybackTest.message += ' | Video URL is accessible';
        } else {
            results.videoPlaybackTest.message += ' | Video URL may not be accessible';
        }
        
    } catch (error) {
        console.error('Test failed with error:', error);
        results.buildTest.message = `Test failed: ${error.message}`;
    } finally {
        await browser.close();
    }
    
    // Print results
    console.log('\n' + '='.repeat(50));
    console.log('TEST RESULTS');
    console.log('='.repeat(50));
    
    Object.entries(results).forEach(([testName, result]) => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${testName}: ${result.message}`);
    });
    
    const passedCount = Object.values(results).filter(r => r.passed).length;
    const totalCount = Object.keys(results).length;
    
    console.log('\n' + '-'.repeat(50));
    console.log(`Summary: ${passedCount}/${totalCount} tests passed`);
    
    // Save results to file
    const report = {
        timestamp: new Date().toISOString(),
        results: results,
        summary: {
            passed: passedCount,
            total: totalCount,
            successRate: `${((passedCount/totalCount) * 100).toFixed(1)}%`
        },
        consoleMessages: consoleMessages
    };
    
    fs.writeFileSync('video-intro-test-report.json', JSON.stringify(report, null, 2));
    console.log('Detailed report saved to: video-intro-test-report.json');
    
    return report;
}

// Run the test if this file is executed directly
if (require.main === module) {
    testVideoIntro().catch(console.error);
}

module.exports = testVideoIntro;