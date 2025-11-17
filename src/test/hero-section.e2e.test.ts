import puppeteer, { Browser, Page } from 'puppeteer';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

// Extend Jest matchers for better assertions
expect.extend({
  toBeVisibleWithinViewport(received: Element) {
    const isVisible = received && 
      received.getBoundingClientRect().top >= 0 &&
      received.getBoundingClientRect().left >= 0 &&
      received.getBoundingClientRect().bottom <= window.innerHeight &&
      received.getBoundingClientRect().right <= window.innerWidth;
    
    return {
      message: () => `expected element to be visible within viewport`,
      pass: isVisible
    };
  }
});

describe('Hero Section E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--autoplay-policy=no-user-gesture-required'
      ]
    });
    page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.error('PAGE ERROR:', error.message);
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('loads the application without errors', async () => {
    // Navigate to the local development server
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Check if page loaded successfully
    const title = await page.title();
    expect(title).toBeDefined();
  });

  it('displays intro video with correct attributes', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Wait for intro video to load
    await page.waitForSelector('video', { timeout: 5000 });
    
    // Check video attributes
    const videoElement = await page.$('video');
    expect(videoElement).toBeTruthy();
    
    // Check if video has the correct src
    const videoSrc = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : '';
    });
    expect(videoSrc).toContain('1114_2_z4csev.mp4');
    
    // Check if video has autoplay and muted attributes
    const autoPlay = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.autoplay : false;
    });
    expect(autoPlay).toBe(true);
    
    const muted = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.muted : false;
    });
    expect(muted).toBe(true);
  });

  it('shows trademark phrases during intro video', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Wait for trademark phrases to appear
    await page.waitForSelector('[data-testid="tm-phrase"], p', { timeout: 5000 });
    
    // Check if trademark phrases are visible
    const tmPhrase = await page.$eval('[data-testid="tm-phrase"], p', el => el.textContent);
    expect(tmPhrase).toBeTruthy();
    
    // Check if trademark phrases have low opacity
    const opacity = await page.$eval('[data-testid="tm-phrase"], p', el => {
      return window.getComputedStyle(el).opacity;
    });
    expect(parseFloat(opacity)).toBeLessThan(0.5); // Should be low opacity
  });

  it('transitions to bull video after intro video completes', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Wait for intro video to load
    await page.waitForSelector('video', { timeout: 5000 });
    
    // Simulate video completion by fast-forwarding
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration || 30;
        video.dispatchEvent(new Event('ended'));
      }
    });
    
    // Wait for bull video to appear
    await page.waitForTimeout(2000); // Wait for transition
    
    // Check if bull video is present
    const bullVideoSrc = await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      return videos.length > 1 ? videos[1].src : '';
    });
    
    // Either bull video appears or hero text appears directly
    const heroText = await page.$('h1');
    expect(bullVideoSrc || heroText).toBeTruthy();
  });

  it('displays hero text with correct content', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Skip intro video by simulating completion
    await page.waitForSelector('video', { timeout: 5000 });
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration || 30;
        video.dispatchEvent(new Event('ended'));
      }
    });
    
    // Wait for hero text to appear
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check hero text content
    const heroText = await page.$eval('h1', el => el.textContent);
    expect(heroText).toContain("Today's AI answers. We remember.");
    
    // Check hero subtitle content
    const heroSubtitle = await page.$eval('p', el => el.textContent);
    expect(heroSubtitle).toContain("SoulPrint makes AI feel less like a tool and more like you.");
  });

  it('shows hero text with transparent background', async () => {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Skip intro video
    await page.waitForSelector('video', { timeout: 5000 });
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration || 30;
        video.dispatchEvent(new Event('ended'));
      }
    });
    
    // Wait for hero text to appear
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check if hero text container has transparent background
    const backgroundColor = await page.$eval('h1', el => {
      return window.getComputedStyle(el.parentElement || el).backgroundColor;
    });
    expect(backgroundColor).toBe('transparent' || 'rgba(0, 0, 0, 0)');
  });

  it('works on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Check if intro video loads on mobile
    await page.waitForSelector('video', { timeout: 5000 });
    
    // Check if mobile video URL is used
    const videoSrc = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : '';
    });
    
    // Should still work on mobile
    expect(videoSrc).toBeTruthy();
    
    // Skip intro video
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = video.duration || 30;
        video.dispatchEvent(new Event('ended'));
      }
    });
    
    // Wait for hero text to appear on mobile
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check if hero text is visible on mobile
    const heroTextVisible = await page.$eval('h1', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    expect(heroTextVisible).toBe(true);
  });

  it('handles autoplay disabled', async () => {
    // Navigate with autoplay disabled
    await page.goto('http://localhost:5173?autoplay=false', { waitUntil: 'networkidle2' });
    
    // Hero text should appear immediately when autoplay is disabled
    await page.waitForSelector('h1', { timeout: 3000 });
    
    // Check hero text content
    const heroText = await page.$eval('h1', el => el.textContent);
    expect(heroText).toContain("Today's AI answers. We remember.");
  });

  it('has no console errors', async () => {
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    // Check for console errors
    expect(consoleErrors.length).toBe(0);
  });
});