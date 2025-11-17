import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoIntroOverlay } from '../components/ui/video-intro-overlay';
import { LoadingOverlay } from '../components/ui/loading-overlay/loading-overlay';
import { 
  isSecureContext, 
  requiresUserInteractionForAutoplayEnhanced,
  detectBrowser 
} from '../lib/browser-detection';

// Mock window.location for testing different contexts
const mockLocation = {
  protocol: 'https:',
  hostname: 'example.com',
  href: 'https://example.com',
  origin: 'https://example.com'
};

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: mockLocation
});

// Mock video element
const mockVideo = {
  play: vi.fn(),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  load: vi.fn(),
  readyState: 4,
  buffered: {
    length: 1,
    end: vi.fn(() => 10)
  },
  duration: 10,
  error: null
};

// Mock HTMLVideoElement
global.HTMLVideoElement = vi.fn(() => mockVideo) as any;

describe('Localhost Video Playback Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVideo.play.mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Reset to default secure context
    window.isSecureContext = true;
    window.location.protocol = 'https:';
    window.location.hostname = 'example.com';
  });

  describe('Secure Context Detection', () => {
    it('should detect HTTPS as secure context', () => {
      window.location.protocol = 'https:';
      window.location.hostname = 'example.com';
      
      const isSecure = isSecureContext();
      expect(isSecure).toBe(true);
    });

    it('should detect localhost as secure context for development', () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'localhost';
      
      const isSecure = isSecureContext();
      expect(isSecure).toBe(true);
    });

    it('should detect 127.0.0.1 as secure context for development', () => {
      window.location.protocol = 'http:';
      window.location.hostname = '127.0.0.1';
      
      const isSecure = isSecureContext();
      expect(isSecure).toBe(true);
    });

    it('should detect non-localhost HTTP as non-secure context', () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'example.com';
      
      const isSecure = isSecureContext();
      expect(isSecure).toBe(false);
    });
  });

  describe('Autoplay Requirements', () => {
    it('should require user interaction in non-secure contexts', () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'example.com';
      
      const requiresInteraction = requiresUserInteractionForAutoplayEnhanced();
      expect(requiresInteraction).toBe(true);
    });

    it('should allow autoplay in secure contexts for Chrome', () => {
      window.location.protocol = 'https:';
      window.location.hostname = 'example.com';
      
      // Mock Chrome browser
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      const requiresInteraction = requiresUserInteractionForAutoplayEnhanced();
      expect(requiresInteraction).toBe(false);
    });

    it('should require user interaction for Safari even in secure contexts', () => {
      window.location.protocol = 'https:';
      window.location.hostname = 'example.com';
      
      // Mock Safari browser
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      );
      
      const requiresInteraction = requiresUserInteractionForAutoplayEnhanced();
      expect(requiresInteraction).toBe(true);
    });
  });

  describe('VideoIntroOverlay Component', () => {
    const mockVideoUrl = 'https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4';
    const mockProps = {
      videoUrl: mockVideoUrl,
      autoPlay: true,
      showLoadingIndicator: true
    };

    it('should attempt autoplay in secure context', async () => {
      window.location.protocol = 'https:';
      window.location.hostname = 'example.com';
      
      render(<VideoIntroOverlay {...mockProps} />);
      
      await waitFor(() => {
        expect(mockVideo.play).toHaveBeenCalled();
      });
    });

    it('should show play button in non-secure context', async () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'example.com';
      mockVideo.play.mockRejectedValue(new Error('Autoplay failed'));
      
      render(<VideoIntroOverlay {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Tap to Play/i)).toBeInTheDocument();
      });
    });

    it('should allow video to play after user interaction', async () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'example.com';
      mockVideo.play.mockRejectedValueOnce(new Error('Autoplay failed'));
      
      render(<VideoIntroOverlay {...mockProps} />);
      
      // Wait for play button to appear
      await waitFor(() => {
        expect(screen.getByText(/Tap to Play/i)).toBeInTheDocument();
      });
      
      // Reset mock to resolve on second call
      mockVideo.play.mockResolvedValue(undefined);
      
      // Click the play button
      const playButton = screen.getByText(/Tap to Play/i).closest('button');
      fireEvent.click(playButton!);
      
      await waitFor(() => {
        expect(mockVideo.play).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('LoadingOverlay Component', () => {
    const mockVideoUrl = 'https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4';
    const mockProps = {
      isVisible: true,
      videoUrl: mockVideoUrl,
      attemptAutoplay: true,
      showLoadingIndicator: true
    };

    it('should attempt autoplay in secure context', async () => {
      window.location.protocol = 'https:';
      window.location.hostname = 'example.com';
      
      render(<LoadingOverlay {...mockProps} />);
      
      await waitFor(() => {
        expect(mockVideo.play).toHaveBeenCalled();
      });
    });

    it('should show play button in non-secure context', async () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'example.com';
      mockVideo.play.mockRejectedValue(new Error('Autoplay failed'));
      
      render(<LoadingOverlay {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Play to Continue/i)).toBeInTheDocument();
      });
    });

    it('should allow video to play after user interaction', async () => {
      window.location.protocol = 'http:';
      window.location.hostname = 'example.com';
      mockVideo.play.mockRejectedValueOnce(new Error('Autoplay failed'));
      
      render(<LoadingOverlay {...mockProps} />);
      
      // Wait for play button to appear
      await waitFor(() => {
        expect(screen.getByText(/Play to Continue/i)).toBeInTheDocument();
      });
      
      // Reset mock to resolve on second call
      mockVideo.play.mockResolvedValue(undefined);
      
      // Click the play button
      const playButton = screen.getByText(/Play to Continue/i).closest('button');
      fireEvent.click(playButton!);
      
      await waitFor(() => {
        expect(mockVideo.play).toHaveBeenCalledTimes(2);
      });
    });
  });
});