const puppeteer = require('puppeteer');
const fs = require('fs');

async function testSocialMediaRemoval() {
    console.log('Starting social media removal tests...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Capture console events
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // Capture page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.error(`PAGE ERROR: ${error.message}`);
    });
    
    try {
        // Navigate to the application
        console.log('Navigating to http://localhost:4000...');
        await page.goto('http://localhost:4000', { waitUntil: 'networkidle2' });
        
        // Wait for the page to load completely
        await page.waitForTimeout(3000);
        
        // Test 1: Check if social media components are removed
        console.log('\n=== Test 1: Checking for social media components ===');
        
        const socialElements = await page.evaluate(() => {
            const selectors = [
                '[class*="social"]',
                '[id*="social"]',
                '[class*="linkedin"]',
                '[id*="linkedin"]',
                '[class*="SocialMedia"]',
                '[id*="SocialMedia"]',
                '[class*="SocialFooter"]',
                '[id*="SocialFooter"]'
            ];
            
            let elements = [];
            selectors.forEach(selector => {
                const found = document.querySelectorAll(selector);
                if (found.length > 0) {
                    elements.push({
                        selector,
                        count: found.length,
                        elements: Array.from(found).map(el => ({
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id
                        }))
                    });
                }
            });
            
            return elements;
        });
        
        const hasSocialComponents = socialElements.length > 0;
        console.log(`Social media components found: ${hasSocialComponents ? 'YES' : 'NO'}`);
        if (hasSocialComponents) {
            console.log('Social elements details:', JSON.stringify(socialElements, null, 2));
        }
        
        // Test 2: Check if landing page loads properly
        console.log('\n=== Test 2: Checking landing page functionality ===');
        
        const landingPageStatus = await page.evaluate(() => {
            const videoElements = document.querySelectorAll('video');
            const heroElements = document.querySelectorAll('[class*="hero"], [id*="hero"]');
            const hasVideoBackground = videoElements.length > 0;
            const hasHeroSection = heroElements.length > 0;
            
            return {
                hasVideoBackground,
                hasHeroSection,
                videoCount: videoElements.length,
                heroCount: heroElements.length,
                pageTitle: document.title,
                bodyClasses: document.body.className
            };
        });
        
        console.log('Landing page status:', JSON.stringify(landingPageStatus, null, 2));
        
        // Test 3: Check if button component works without linkedin variant
        console.log('\n=== Test 3: Testing button component ===');
        
        // Navigate to about page to test button
        console.log('Navigating to about page...');
        await page.goto('http://localhost:4000/about', { waitUntil: 'networkidle2' });
        await page.waitForTimeout(2000);
        
        const buttonStatus = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            const backButton = Array.from(buttons).find(btn => 
                btn.textContent.includes('Back to Home')
            );
            
            return {
                buttonCount: buttons.length,
                hasBackButton: !!backButton,
                backButtonClasses: backButton ? backButton.className : null
            };
        });
        
        console.log('Button component status:', JSON.stringify(buttonStatus, null, 2));
        
        // Test the back button functionality
        if (buttonStatus.hasBackButton) {
            console.log('Testing back button click...');
            await page.click('button');
            await page.waitForTimeout(1000);
            
            const currentUrl = page.url();
            console.log(`URL after clicking back button: ${currentUrl}`);
        }
        
        // Test 4: Check for console errors
        console.log('\n=== Test 4: Checking for console errors ===');
        
        const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
        const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');
        
        console.log(`Console errors found: ${errorMessages.length}`);
        console.log(`Console warnings found: ${warningMessages.length}`);
        
        if (errorMessages.length > 0) {
            console.log('Error details:');
            errorMessages.forEach((error, index) => {
                console.log(`${index + 1}. ${error.text}`);
            });
        }
        
        // Test 5: Check page load performance
        console.log('\n=== Test 5: Checking page performance ===');
        
        const performanceMetrics = await page.metrics();
        console.log('Performance metrics:', JSON.stringify(performanceMetrics, null, 2));
        
        // Generate test report
        const testReport = {
            timestamp: new Date().toISOString(),
            tests: {
                socialMediaComponentsRemoved: !hasSocialComponents,
                landingPageLoads: landingPageStatus.hasVideoBackground || landingPageStatus.hasHeroSection,
                buttonComponentWorks: buttonStatus.hasBackButton,
                noConsoleErrors: errorMessages.length === 0,
                noConsoleWarnings: warningMessages.length === 0
            },
            details: {
                socialElements,
                landingPageStatus,
                buttonStatus,
                consoleErrors: errorMessages,
                consoleWarnings: warningMessages,
                pageErrors,
                performanceMetrics
            },
            overallStatus: (!hasSocialComponents && errorMessages.length === 0 && buttonStatus.hasBackButton) ? 'PASS' : 'FAIL'
        };
        
        // Save test report
        fs.writeFileSync('social-media-removal-test-report.json', JSON.stringify(testReport, null, 2));
        console.log('\n=== Test Report Saved ===');
        console.log('Report saved to: social-media-removal-test-report.json');
        
        console.log('\n=== Test Summary ===');
        console.log(`Social media components removed: ${testReport.tests.socialMediaComponentsRemoved ? 'PASS' : 'FAIL'}`);
        console.log(`Landing page loads: ${testReport.tests.landingPageLoads ? 'PASS' : 'FAIL'}`);
        console.log(`Button component works: ${testReport.tests.buttonComponentWorks ? 'PASS' : 'FAIL'}`);
        console.log(`No console errors: ${testReport.tests.noConsoleErrors ? 'PASS' : 'FAIL'}`);
        console.log(`No console warnings: ${testReport.tests.noConsoleWarnings ? 'PASS' : 'FAIL'}`);
        console.log(`Overall test status: ${testReport.overallStatus}`);
        
    } catch (error) {
        console.error('Test execution failed:', error);
    } finally {
        await browser.close();
    }
}

// Check if localhost:4000 is accessible
async function checkServer() {
    try {
        const response = await fetch('http://localhost:4000');
        return response.ok;
    } catch (error) {
        console.error('Server not accessible:', error.message);
        return false;
    }
}

// Run tests
async function runTests() {
    console.log('Checking if development server is running...');
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.error('Development server is not running on http://localhost:4000');
        console.error('Please start the development server with: npm run dev');
        process.exit(1);
    }
    
    try {
        await testSocialMediaRemoval();
    } catch (error) {
        console.error('Test execution failed:', error);
        process.exit(1);
    }
}

// Check if puppeteer is available
try {
    require('puppeteer');
    runTests();
} catch (error) {
    console.error('Puppeteer is not installed. Please install it with:');
    console.error('npm install puppeteer');
    process.exit(1);
}