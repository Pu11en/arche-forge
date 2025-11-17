import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VideoIntroOverlay } from '../components/ui/video-intro-overlay';
import { LoadingOverlay } from '../components/ui/loading-overlay/loading-overlay';

// Mock browser detection
jest.mock('../lib/browser-detection', () => ({
  detectBrowser: jest.fn(() => ({
    isChrome: true,
    isFirefox: false,
    isSafari: false,
    isEdge: false,
    isIE: false,
    isMobile: false,
    isDesktop: true,
    version: '90'
  })),
  requiresUserInteractionForAutoplay: jest.fn(() => false),
  getSafeZIndex: jest.fn(() => '999999'),
  getEventListenerOptions: jest.fn(() => ({ passive: false, capture: false }))
}));

// Mock reduced motion hook
jest.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false)
}));

// Mock cross-browser styles
jest.mock('../lib/cross-browser-styles', () => ({
  getPrefixedStyles: jest.fn((styles) => styles),
  getHardwareAccelerationStyles: jest.fn(() => ({})),
  getResponsiveVideoStyles: jest.fn(() => ({})),
  getResponsiveContainerStyles: jest.fn(() => ({})),
  getLoadingSpinnerStyles: jest.fn(() => ({})),
  getTouchButtonStyles: jest.fn(() => ({})),
  getConsistentTextStyles: jest.fn(() => ({})),
  getOverlayStyles: jest.fn(() => ({})),
  getVideoAttributes: jest.fn(() => ({})),
  getFlexboxStyles: jest.fn(() => ({}))
}));

// Mock the TM Loop component
jest.mock('../components/ui/tm-loop', () => ({
  TMLoop: ({ isVisible }: { isVisible: boolean }) => 
    isVisible ? <div data-testid="tm-loop">TM Loop</div> : null
}));

// Mock HTMLVideoElement
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve())
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: true
});

describe('Cloudinary Video Implementation Tests', () => {
  const cloudinaryVideoUrl = 'https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4';

  describe('VideoIntroOverlay with Cloudinary URL', () => {
    test('renders with Cloudinary video URL', () => {
      const onVideoComplete = jest.fn();
      
      render(
        <VideoIntroOverlay 
          videoUrl={cloudinaryVideoUrl}
          onVideoComplete={onVideoComplete}
        />
      );
      
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement?.querySelector('source')).toHaveAttribute('src', cloudinaryVideoUrl);
      expect(videoElement?.querySelector('source')).toHaveAttribute('type', 'video/mp4');
    });

    test('handles autoplay with Cloudinary video', async () => {
      const onVideoComplete = jest.fn();
      
      render(
        <VideoIntroOverlay 
          videoUrl={cloudinaryVideoUrl}
          autoPlay={true}
          onVideoComplete={onVideoComplete}
        />
      );
      
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      // Simulate video can play
      fireEvent.canPlay(videoElement);
      
      // Wait for autoplay attempt
      await waitFor(() => {
        expect(videoElement.play).toHaveBeenCalled();
      });
    });

    test('shows loading state initially', () => {
      const onVideoComplete = jest.fn();
      
      render(
        <VideoIntroOverlay 
          videoUrl={cloudinaryVideoUrl}
          onVideoComplete={onVideoComplete}
          showLoadingIndicator={true}
        />
      );
      
      // Should show loading indicator initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('handles user interaction when autoplay is blocked', async () => {
      // Mock play to reject (simulating autoplay blocked)
      const mockPlay = jest.fn().mockRejectedValue(new Error('Autoplay blocked'));
      Object.defineProperty(HTMLMediaElement.prototype, 'play', {
        writable: true,
        value: mockPlay
      });
      
      const onVideoComplete = jest.fn();
      
      render(
        <VideoIntroOverlay 
          videoUrl={cloudinaryVideoUrl}
          autoPlay={true}
          onVideoComplete={onVideoComplete}
        />
      );
      
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      // Simulate video can play
      fireEvent.canPlay(videoElement);
      
      // Wait for autoplay attempt to fail
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled();
      });
      
      // Should show play button
      await waitFor(() => {
        expect(screen.getByText('Tap to Play')).toBeInTheDocument();
      });
      
      // Mock successful play after user interaction
      mockPlay.mockResolvedValueOnce(undefined);
      
      // Click play button
      const playButton = screen.getByText('Tap to Play');
      fireEvent.click(playButton);
      
      // Should attempt to play again
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('LoadingOverlay with Cloudinary URL', () => {
    test('renders with Cloudinary video URL', () => {
      const onVideoComplete = jest.fn();
      
      render(
        <LoadingOverlay 
          videoUrl={cloudinaryVideoUrl}
          onVideoComplete={onVideoComplete}
        />
      );
      
      const videoElement = document.querySelector('video');
      expect(videoElement).toBeInTheDocument();
      expect(videoElement?.querySelector('source')).toHaveAttribute('src', cloudinaryVideoUrl);
      expect(videoElement?.querySelector('source')).toHaveAttribute('type', 'video/mp4');
    });

    test('handles autoplay with Cloudinary video', async () => {
      const onVideoComplete = jest.fn();
      
      render(
        <LoadingOverlay 
          videoUrl={cloudinaryVideoUrl}
          attemptAutoplay={true}
          onVideoComplete={onVideoComplete}
        />
      );
      
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      // Simulate video can play
      fireEvent.canPlay(videoElement);
      
      // Wait for autoplay attempt
      await waitFor(() => {
        expect(videoElement.play).toHaveBeenCalled();
      });
    });

    test('handles video completion', async () => {
      const onVideoComplete = jest.fn();
      
      render(
        <LoadingOverlay 
          videoUrl={cloudinaryVideoUrl}
          onVideoComplete={onVideoComplete}
        />
      );
      
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      // Simulate video ended
      fireEvent.ended(videoElement);
      
      // Should call onVideoComplete
      await waitFor(() => {
        expect(onVideoComplete).toHaveBeenCalled();
      });
    });

    test('shows error state when video fails to load', async () => {
      const onVideoError = jest.fn();
      
      render(
        <LoadingOverlay 
          videoUrl={cloudinaryVideoUrl}
          onVideoError={onVideoError}
        />
      );
      
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      
      // Simulate video error
      fireEvent.error(videoElement);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Unable to load video')).toBeInTheDocument();
      });
      
      // Should call error callback
      await waitFor(() => {
        expect(onVideoError).toHaveBeenCalled();
      });
    });
  });

  describe('Cross-browser compatibility', () => {
    test('uses MP4 format for all browsers', () => {
      // Test with different browser configurations
      const browsers = [
        { isChrome: true, isFirefox: false, isSafari: false, isEdge: false, isMobile: false },
        { isChrome: false, isFirefox: true, isSafari: false, isEdge: false, isMobile: false },
        { isChrome: false, isFirefox: false, isSafari: true, isEdge: false, isMobile: false },
        { isChrome: false, isFirefox: false, isSafari: false, isEdge: true, isMobile: false },
        { isChrome: false, isFirefox: false, isSafari: false, isEdge: false, isMobile: true }
      ];

      browsers.forEach((browserConfig, index) => {
        const { detectBrowser } = require('../lib/browser-detection');
        detectBrowser.mockReturnValue(browserConfig);
        
        const { unmount } = render(
          <VideoIntroOverlay 
            videoUrl={cloudinaryVideoUrl}
          />
        );
        
        const videoElement = document.querySelector('video');
        const sourceElement = videoElement?.querySelector('source');
        
        expect(sourceElement).toHaveAttribute('src', cloudinaryVideoUrl);
        expect(sourceElement).toHaveAttribute('type', 'video/mp4');
        
        unmount();
      });
    });
  });
});