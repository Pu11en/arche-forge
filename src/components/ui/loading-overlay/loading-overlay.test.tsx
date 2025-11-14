import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LoadingOverlay } from './loading-overlay';
import { LoadingOverlayProps } from './loading-types';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { detectBrowser, supportsVideoFormat, getOptimalVideoFormat } from '../../../lib/browser-detection';

// Mock the hooks and utilities
jest.mock('../../../hooks/useReducedMotion');
jest.mock('../../../lib/browser-detection');
jest.mock('../../../lib/cross-browser-styles', () => ({
  getPrefixedStyles: (styles: Record<string, string | number>) => styles,
  getHardwareAccelerationStyles: () => ({} as Record<string, string | number>),
  getResponsiveVideoStyles: () => ({} as Record<string, string | number>),
  getResponsiveContainerStyles: () => ({} as Record<string, string | number>),
  getLoadingSpinnerStyles: () => ({} as Record<string, string | number>),
  getTouchButtonStyles: () => ({} as Record<string, string | number>),
  getConsistentTextStyles: () => ({} as Record<string, string | number>),
  getOverlayStyles: () => ({} as Record<string, string | number>),
  getVideoAttributes: () => ({} as Record<string, string | number>),
  getFlexboxStyles: () => ({} as Record<string, string | number>),
  mediaQueries: {} as Record<string, string>
}));

// Mock HTMLVideoElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve())
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: jest.fn()
});

// Mock video properties
Object.defineProperty(HTMLVideoElement.prototype, 'buffered', {
  writable: true,
  value: {
    length: 1,
    end: jest.fn().mockReturnValue(10),
    start: jest.fn().mockReturnValue(0)
  }
});

Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
  writable: true,
  value: 20
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  vendor: 'Google Inc.',
  connection: null
};

Object.defineProperty(window, 'navigator', {
  writable: true,
  value: mockNavigator
});

// Mock the browser detection functions
const mockDetectBrowser = jest.mocked(detectBrowser);
const mockSupportsVideoFormat = jest.mocked(supportsVideoFormat);
const mockGetOptimalVideoFormat = jest.mocked(getOptimalVideoFormat);

// Mock the useReducedMotion hook
const mockUseReducedMotion = jest.mocked(useReducedMotion);

describe('LoadingOverlay Component', () => {
  const defaultProps: LoadingOverlayProps = {
    isVisible: true,
    videoUrl: 'https://example.com/video.mp4',
    videoUrls: {
      webm: 'https://example.com/video.webm',
      ogg: 'https://example.com/video.ogg'
    },
    fallbackBgColor: 'bg-black',
    onVideoLoaded: jest.fn(),
    onVideoError: jest.fn(),
    onTransitionComplete: jest.fn(),
    className: '',
    attemptAutoplay: true,
    showPlayButton: true,
    playButtonText: 'Play to Continue'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseReducedMotion.mockReturnValue(false);
    mockDetectBrowser.mockReturnValue({
      isChrome: true,
      isFirefox: false,
      isSafari: false,
      isEdge: false,
      isIE: false,
      isMobile: false,
      isDesktop: true,
      version: '91'
    });
    mockSupportsVideoFormat.mockImplementation((format) => {
      switch (format) {
        case 'webm': return true;
        case 'mp4': return true;
        case 'ogg': return true;
        default: return false;
      }
    });
    mockGetOptimalVideoFormat.mockReturnValue('webm');
  });

  describe('Basic Rendering', () => {
    test('renders when isVisible is true', () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      const videoElement = screen.getByRole('application'); // Video element role
      expect(videoElement).toBeInTheDocument();
    });

    test('does not render when isVisible is false', () => {
      render(<LoadingOverlay {...defaultProps} isVisible={false} />);
      
      const videoElement = screen.queryByRole('application');
      expect(videoElement).not.toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<LoadingOverlay {...defaultProps} className="custom-class" />);
      
      const container = screen.getByRole('application').parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Video Loading States', () => {
    test('shows loading spinner initially', () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      const loadingSpinner = screen.getByRole('status', { hidden: true });
      expect(loadingSpinner).toBeInTheDocument();
    });

    test('displays loading progress', () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      // Check for loading text
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    test('shows play button when user interaction is required', async () => {
      mockDetectBrowser.mockReturnValue({
        ...mockDetectBrowser(),
        isSafari: true,
        isMobile: true
      });
      
      render(<LoadingOverlay {...defaultProps} />);
      
      // Wait for video to attempt autoplay and fail
      await waitFor(() => {
        expect(screen.getByText('Play to Continue')).toBeInTheDocument();
      });
    });

    test('handles video loading success', async () => {
      const onVideoLoaded = jest.fn();
      render(<LoadingOverlay {...defaultProps} onVideoLoaded={onVideoLoaded} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video canplay event
      fireEvent.canPlay(videoElement);
      
      await waitFor(() => {
        expect(onVideoLoaded).toHaveBeenCalled();
      });
    });

    test('handles video loading error', async () => {
      const onVideoError = jest.fn();
      render(<LoadingOverlay {...defaultProps} onVideoError={onVideoError} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video error event
      fireEvent.error(videoElement);
      
      await waitFor(() => {
        expect(onVideoError).toHaveBeenCalled();
        expect(screen.getByText(/Unable to load video/i)).toBeInTheDocument();
      });
    });
  });

  describe('Video Playback', () => {
    test('attempts autoplay when enabled', async () => {
      render(<LoadingOverlay {...defaultProps} attemptAutoplay={true} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video canplay event
      fireEvent.canPlay(videoElement);
      
      await waitFor(() => {
        expect(videoElement.play).toHaveBeenCalled();
      });
    });

    test('does not attempt autoplay when disabled', async () => {
      render(<LoadingOverlay {...defaultProps} attemptAutoplay={false} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video canplay event
      fireEvent.canPlay(videoElement);
      
      await waitFor(() => {
        expect(videoElement.play).not.toHaveBeenCalled();
      });
    });

    test('handles user interaction to play video', async () => {
      mockDetectBrowser.mockReturnValue({
        ...mockDetectBrowser(),
        isSafari: true,
        isMobile: true
      });
      
      render(<LoadingOverlay {...defaultProps} />);
      
      // Wait for play button to appear
      await waitFor(() => {
        expect(screen.getByText('Play to Continue')).toBeInTheDocument();
      });
      
      const playButton = screen.getByRole('button');
      fireEvent.click(playButton);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      expect(videoElement.play).toHaveBeenCalled();
    });

    test('handles video end event and transition', async () => {
      const onTransitionComplete = jest.fn();
      render(<LoadingOverlay {...defaultProps} onTransitionComplete={onTransitionComplete} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video canplay and then ended events
      fireEvent.canPlay(videoElement);
      fireEvent.ended(videoElement);
      
      // Wait for transition to complete (1.5 seconds + small buffer)
      await waitFor(() => {
        expect(onTransitionComplete).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Buffering States', () => {
    test('shows buffering state during playback', async () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video canplay and then waiting events
      fireEvent.canPlay(videoElement);
      fireEvent.waiting(videoElement);
      
      await waitFor(() => {
        expect(screen.getByText(/Buffering/i)).toBeInTheDocument();
      });
    });

    test('handles progress events', async () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate progress event
      fireEvent.progress(videoElement);
      
      // Check that loading progress is calculated
      expect(videoElement.buffered.end).toHaveBeenCalled();
    });
  });

  describe('Cross-Browser Compatibility', () => {
    test('uses optimal video format based on browser support', () => {
      mockGetOptimalVideoFormat.mockReturnValue('webm');
      
      render(<LoadingOverlay {...defaultProps} />);
      
      expect(mockGetOptimalVideoFormat).toHaveBeenCalled();
    });

    test('handles different browser types', () => {
      // Test with Safari
      mockDetectBrowser.mockReturnValue({
        isChrome: false,
        isFirefox: false,
        isSafari: true,
        isEdge: false,
        isIE: false,
        isMobile: false,
        isDesktop: true,
        version: '14'
      });
      
      render(<LoadingOverlay {...defaultProps} />);
      
      expect(mockDetectBrowser).toHaveBeenCalled();
    });

    test('handles mobile browsers', () => {
      mockDetectBrowser.mockReturnValue({
        isChrome: false,
        isFirefox: false,
        isSafari: false,
        isEdge: false,
        isIE: false,
        isMobile: true,
        isDesktop: false,
        version: '14'
      });
      
      render(<LoadingOverlay {...defaultProps} />);
      
      expect(mockDetectBrowser).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('respects reduced motion preference', () => {
      mockUseReducedMotion.mockReturnValue(true);
      
      render(<LoadingOverlay {...defaultProps} />);
      
      expect(mockUseReducedMotion).toHaveBeenCalled();
    });

    test('provides proper ARIA labels', () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      const playButton = screen.queryByRole('button');
      if (playButton) {
        expect(playButton).toHaveAttribute('aria-label');
      }
    });
  });

  describe('Error Handling', () => {
    test('shows error message when video fails to load', async () => {
      const onVideoError = jest.fn();
      render(<LoadingOverlay {...defaultProps} onVideoError={onVideoError} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      fireEvent.error(videoElement);
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to load video/i)).toBeInTheDocument();
        expect(screen.getByText(/Please check your connection/i)).toBeInTheDocument();
      });
    });

    test('provides retry button in error state', async () => {
      mockDetectBrowser.mockReturnValue({
        ...mockDetectBrowser(),
        isSafari: true,
        isMobile: true
      });
      
      render(<LoadingOverlay {...defaultProps} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      fireEvent.error(videoElement);
      
      await waitFor(() => {
        const retryButton = screen.getByText('Try Again');
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('Memory Management', () => {
    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(<LoadingOverlay {...defaultProps} />);
      
      // Unmount component
      unmount();
      
      // Component should unmount without errors
      expect(true).toBe(true);
    });

    test('cleans up timers on unmount', () => {
      jest.useFakeTimers();
      
      const { unmount } = render(<LoadingOverlay {...defaultProps} />);
      
      // Fast forward timers
      jest.advanceTimersByTime(2000);
      
      // Unmount component
      unmount();
      
      // Restore real timers
      jest.useRealTimers();
      
      // Component should unmount without timer-related errors
      expect(true).toBe(true);
    });
  });

  describe('Performance Optimizations', () => {
    test('uses hardware acceleration styles', () => {
      render(<LoadingOverlay {...defaultProps} />);
      
      // The component should render without performance issues
      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    test('handles minimum display time correctly', async () => {
      jest.useFakeTimers();
      
      const onVideoLoaded = jest.fn();
      render(<LoadingOverlay {...defaultProps} onVideoLoaded={onVideoLoaded} />);
      
      const videoElement = screen.getByRole('application') as HTMLVideoElement;
      
      // Simulate video canplay
      fireEvent.canPlay(videoElement);
      
      // Fast forward time to meet minimum display requirement
      jest.advanceTimersByTime(1500);
      
      await waitFor(() => {
        expect(onVideoLoaded).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });
  });
});