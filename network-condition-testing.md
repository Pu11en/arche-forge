
# Network Condition Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for verifying seamless video transitions across various network conditions, ensuring consistent performance regardless of connection quality.

## Network Conditions to Test

### 1. Connection Types
- **Slow 3G**: 500 Kbps download, 500 Kbps upload, 400ms RTT
- **Regular 3G**: 1.5 Mbps download, 750 Kbps upload, 300ms RTT
- **Regular 4G**: 4 Mbps download, 3 Mbps upload, 100ms RTT
- **Fast 4G**: 9 Mbps download, 8 Mbps upload, 50ms RTT
- **WiFi**: Direct connection with minimal latency

### 2. Edge Cases
- **Intermittent Connection**: Connection drops and recovers
- **High Latency**: Low bandwidth with high latency
- **Packet Loss**: Simulated packet loss scenarios
- **Network Throttling**: Dynamic bandwidth changes during playback

## Testing Infrastructure

### 1. Network Simulation Setup

```typescript
interface NetworkCondition {
  name: string;
  downloadThroughput: number; // Kbps
  uploadThroughput: number;    // Kbps
  latency: number;            // ms
  packetLoss?: number;        // percentage
}

const NETWORK_CONDITIONS: NetworkCondition[] = [
  {
    name: 'slow-3g',
    downloadThroughput: 500,
    uploadThroughput: 500,
    latency: 400
  },
  {
    name: 'regular-3g',
    downloadThroughput: 1500,
    uploadThroughput: 750,
    latency: 300
  },
  {
    name: 'regular-4g',
    downloadThroughput: 4000,
    uploadThroughput: 3000,
    latency: 100
  },
  {
    name: 'fast-4g',
    downloadThroughput: 9000,
    uploadThroughput: 8000,
    latency: 50
  },
  {
    name: 'wifi',
    downloadThroughput: 25000,
    uploadThroughput: 20000,
    latency: 10
  }
];

// Network simulation using Chrome DevTools Protocol
export const simulateNetworkCondition = async (condition: NetworkCondition) => {
  if (window.chrome && window.chrome.devtools) {
    // Use Chrome DevTools Protocol if available
    const client = await window.chrome.devtools.inspectedWindow.eval(`
      new Promise(resolve => {
        const target = window.chrome.devtools.inspectedWindow;
        target.evaluate('navigator.connection', (result) => {
          resolve(result);
        });
      })
    `);
    
    // Apply network conditions
    await window.chrome.devtools.inspectedWindow.eval(`
      (function() {
        // Override Network Information API
        Object.defineProperty(navigator, 'connection', {
          value: {
            effectiveType: '${condition.name}',
            downlink: ${condition.downloadThroughput / 1000},
            rtt: ${condition.latency},
            saveData: false
          },
          writable: true
        });
        
        // Override fetch for simulation
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          // Simulate delay based on latency
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              originalFetch(url, options).then(resolve).catch(reject);
            }, ${condition.latency});
          });
        };
      })()
    `);
  } else {
    // Fallback: Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      // Note: Actual network throttling requires browser dev tools
      console.log(`Simulating ${condition.name} network condition`);
    }
  }
};
```

### 2. Performance Monitoring

```typescript
interface NetworkPerformanceMetrics {
  condition: string;
  videoLoadTime: number;
  bufferHealth: number[];
  transitionDelay: number;
  frameDrops: number;
  visualGaps: boolean;
  userExperience: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useNetworkPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<NetworkPerformanceMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const startTimeRef = useRef<number>();
  const frameCountRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);

  const startMonitoring = (conditionName: string) => {
    setIsMonitoring(true);
    startTimeRef.current = performance.now();
    frameCountRef.current = 0;
    droppedFramesRef.current = 0;

    // Monitor frame rate
    const monitorFrameRate = () => {
      frameCountRef.current++;
      
      // Detect dropped frames
      const lastFrameTime = performance.now();
      if (lastFrameTime - (startTimeRef.current || 0) > (frameCountRef.current * 16.67)) {
        droppedFramesRef.current++;
      }
      
      if (isMonitoring) {
        requestAnimationFrame(monitorFrameRate);
      }
    };
    
    requestAnimationFrame(monitorFrameRate);
  };

  const stopMonitoring = (conditionName: string) => {
    setIsMonitoring(false);
    
    const endTime = performance.now();
    const totalTime = endTime - (startTimeRef.current || endTime);
    
    const metric: NetworkPerformanceMetrics = {
      condition: conditionName,
      videoLoadTime: totalTime,
      bufferHealth: [], // Would be populated by video element monitoring
      transitionDelay: 0, // Would be measured during transition
      frameDrops: droppedFramesRef.current,
      visualGaps: false, // Would be detected by visual analysis
      userExperience: 'excellent' // Would be calculated based on metrics
    };
    
    setMetrics(prev => [...prev, metric]);
  };

  return { metrics, startMonitoring, stopMonitoring, isMonitoring };
};
```

### 3. Video Buffer Monitoring

```typescript
export const useVideoBufferMonitor = (videoRef: RefObject<HTMLVideoElement>) => {
  const [bufferHealth, setBufferHealth] = useState<number[]>([]);
  const [bufferEvents, setBufferEvents] = useState<string[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const monitorBuffer = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedSeconds = bufferedEnd - video.currentTime;
        const bufferPercentage = (bufferedSeconds / video.duration) * 100;
        
        setBufferHealth(prev => [...prev.slice(-100), bufferPercentage]);
        
        // Log buffer events
        if (bufferedSeconds < 0.5) {
          setBufferEvents(prev => [...prev, `Low buffer: ${bufferedSeconds.toFixed(2)}s`]);
        }
      }
    };

    const interval = setInterval(monitorBuffer, 100);
    
    // Monitor video events
    const handleWaiting = () => {
      setBufferEvents(prev => [...prev, 'Video waiting (buffering)']);
    };
    
    const handlePlaying = () => {
      setBufferEvents(prev => [...prev, 'Video playing']);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    
    return () => {
      clearInterval(interval);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [videoRef]);

  return { bufferHealth, bufferEvents };
};
```

## Automated Testing Suite

### 1. Network Condition Tests

```typescript
export const runNetworkConditionTests = async () => {
  const results: NetworkPerformanceMetrics[] = [];
  
  for (const condition of NETWORK_CONDITIONS) {
    console.log(`Testing network condition: ${condition.name}`);
    
    // Apply network condition
    await simulateNetworkCondition(condition);
    
    // Start monitoring
    const monitor = useNetworkPerformanceMonitor();
    monitor.startMonitoring(condition.name);
    
    // Load and test videos
    const testResult = await testVideoTransitionUnderCondition(condition);
    
    // Stop monitoring
    monitor.stopMonitoring(condition.name);
    
    results.push(testResult);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
};

const testVideoTransitionUnderCondition = async (condition: NetworkCondition): Promise<NetworkPerformanceMetrics> => {
  const startTime = performance.now();
  
  // Create test video elements
  const introVideo = document.createElement('video');
  const loopingVideo = document.createElement('video');
  
  introVideo.src = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4";
  loopingVideo.src = "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4";
  
  introVideo.muted = true;
  loopingVideo.muted = true;
  introVideo.playsInline = true;
  loopingVideo.playsInline = true;
  
  // Measure load times
  const loadPromises = [
    new Promise(resolve => introVideo.addEventListener('canplay', resolve)),
    new Promise(resolve => loopingVideo.addEventListener('canplay', resolve))
  ];
  
  await Promise.all(loadPromises);
  
  const loadTime = performance.now() - startTime;
  
  // Test transition
  const transitionResult = await testVideoTransition(introVideo, loopingVideo);
  
  // Cleanup
  introVideo.remove();
  loopingVideo.remove();
  
  return {
    condition: condition.name,
    videoLoadTime: loadTime,
    bufferHealth: transitionResult.bufferHealth,
    transitionDelay: transitionResult.transitionDelay,
    frameDrops: transitionResult.frameDrops,
    visualGaps: transitionResult.visualGaps,
    userExperience: calculateUserExperience(loadTime, transitionResult)
  };
};
```

### 2. Visual Gap Detection

```typescript
const detectVisualGaps = async (introVideo: HTMLVideoElement, loopingVideo: HTMLVideoElement): Promise<boolean> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  canvas.width = 640;
  canvas.height = 360;
  
  const frames: string[] = [];
  let visualGapDetected = false;
  
  // Capture frames during transition
  const captureFrame = () => {
    // Render both videos to canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw intro video with opacity
    ctx.globalAlpha = introVideo.style.opacity ? parseFloat(introVideo.style.opacity) : 1;
    ctx.drawImage(introVideo, 0, 0, canvas.width, canvas.height);
    
    // Draw looping video with opacity
    ctx.globalAlpha = loopingVideo.style.opacity ? parseFloat(loopingVideo.style.opacity) : 0;
    ctx.drawImage(loopingVideo, 0, 0, canvas.width, canvas.height);
    
    const frameData = canvas.toDataURL();
    frames.push(frameData);
    
    // Analyze frame for visual gaps
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = analyzeFrameContent(imageData);
    
    if (!hasContent) {
      visualGapDetected = true;
    }
  };
  
  // Capture frames during transition
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
    captureFrame();
  }
  
  return visualGapDetected;
};

const analyzeFrameContent = (imageData: ImageData): boolean => {
  const data = imageData.data;
  let totalBrightness = 0;
  
  // Calculate average brightness
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    totalBrightness += brightness;
  }
  
  const averageBrightness = totalBrightness / (data.length / 4);
  
  // If frame is mostly black, consider it a visual gap
  return averageBrightness > 10; // Threshold for detecting content
};
```

### 3. User Experience Scoring

```typescript
const calculateUserExperience = (
  loadTime: number,
  transitionResult: any
): 'excellent' | 'good' | 'fair' | 'poor' => {
  let score = 100;
  
  // Penalize slow loading
  if (loadTime > 5000) score -= 30;
  else if (loadTime > 3000) score -= 20;
  else if (loadTime > 1000) score -= 10;
  
  // Penalize transition delays
  if (transitionResult.transitionDelay > 500) score -= 20;
  else if (transitionResult.transitionDelay > 200) score -= 10;
  
  // Penalize frame drops
  if (transitionResult.frameDrops > 10) score -= 20;
  else if (transitionResult.frameDrops > 5) score -= 10;
  
  // Penalize visual gaps
  if (transitionResult.visualGaps) score -= 30;
  
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
};
```

## Manual Testing Procedures

### 1. Browser DevTools Network Throttling

```markdown
## Chrome DevTools Testing Steps

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" from throttling dropdown
4. Clear cache and hard reload
5. Observe video loading and transition
6. Repeat for each network condition
7. Document any issues observed

## Firefox Testing Steps

1. Open Firefox Developer Tools
2. Go to Network tab
3. Enable throttling
4. Select "Slow 3G"
5. Reload page and observe behavior
6. Repeat for different conditions
```

### 2. Real Device Testing

```markdown
## Mobile Network Testing

1. Test on actual 3G/4G connections
2. Use network simulation apps
3. Test in areas with poor connectivity
4. Test during network switching (WiFi to cellular)
5. Document performance differences

## Desktop Network Testing

1. Use network simulation software
2. Test with actual network throttling
3. Test with VPN connections
4. Test during network interruptions
```

## Test Results Analysis

### 1. Performance Metrics Dashboard

```typescript
export const NetworkTestDashboard = () => {
  const [testResults, setTestResults] = useState<NetworkPerformanceMetrics[]>([]);
  
  const generateReport = () => {
    return {
      summary: {
        totalTests: testResults.length,
        averageLoadTime: testResults.reduce((sum, r) => sum + r.videoLoadTime, 0) / testResults.length,
        excellentExperience: testResults.filter(r => r.userExperience === 'excellent').length,
        visualGapsDetected: testResults.filter(r => r.visualGaps).length
      },
      byCondition: testResults.map(result => ({
        condition: result.condition,
        loadTime: result.videoLoadTime,
        experience: result.userExperience,
        issues: {
          frameDrops: result.frameDrops,
          visualGaps: result.visualGaps,
          transitionDelay: result.transitionDelay
        }
      })),
      recommendations: generateRecommendations(testResults)
    };
  };
  
  const generateRecommendations = (results: NetworkPerformanceMetrics[]) => {
    const recommendations = [];
    
    const poorConditions = results.filter(r => r.userExperience === 'poor');
    if (poorConditions.length > 0) {
      recommendations.push({
        priority: 'high',
        issue: 'Poor performance on slow connections',
        solution: 'Implement adaptive video quality based on network speed'
      });
    }
    
    const gapConditions = results.filter(r => r.visualGaps);
    if (gapConditions.length > 0) {
      recommendations.push({
        priority: 'critical',
