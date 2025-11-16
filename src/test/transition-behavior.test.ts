import { describe, it, expect } from 'vitest';
import { ANIMATION_TIMING, getAnimationConfig } from '../lib/animation-timing';

describe('Animation Timing Configuration', () => {
  it('should have VIDEO_DISSOLVE_DELAY set to 0', () => {
    expect(ANIMATION_TIMING.VIDEO_DISSOLVE_DELAY).toBe(0);
  });

  it('should have VIDEO_DISSOLVE_DURATION set to 0', () => {
    expect(ANIMATION_TIMING.VIDEO_DISSOLVE_DURATION).toBe(0);
  });

  it('should return 0 duration for video dissolve when reduced motion is false', () => {
    const config = getAnimationConfig(false);
    expect(config.videoDissolveDuration).toBe(0);
  });

  it('should return 0 duration for video dissolve when reduced motion is true', () => {
    const config = getAnimationConfig(true);
    expect(config.videoDissolveDuration).toBe(0);
  });

  it('should return 0 delay for dissolve when reduced motion is false', () => {
    const config = getAnimationConfig(false);
    expect(config.delays.dissolveDelay).toBe(0);
  });

  it('should return 0 delay for dissolve when reduced motion is true', () => {
    const config = getAnimationConfig(true);
    expect(config.delays.dissolveDelay).toBe(0);
  });
});

describe('CSS Duration Conversion', () => {
  it('should convert 0ms to 0s', () => {
    const { toCSSDuration } = require('../lib/animation-timing');
    expect(toCSSDuration(0)).toBe('0s');
  });

  it('should convert 500ms to 0.5s', () => {
    const { toCSSDuration } = require('../lib/animation-timing');
    expect(toCSSDuration(500)).toBe('0.5s');
  });
});