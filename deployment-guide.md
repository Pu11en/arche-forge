# ArcheForge Landing Page Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the ArcheForge cinematic landing page with all implemented systems including analytics, video optimization, performance monitoring, and service worker functionality.

## Prerequisites

### Environment Requirements
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser with ES6+ support
- HTTPS enabled (required for service workers)

### Build Tools
- Vite (configured in `vite.config.ts`)
- TypeScript (configured in `tsconfig.json`)
- Tailwind CSS (configured in `tailwind.config.js`)

## Pre-Deployment Checklist

### 1. Environment Configuration
```bash
# Verify Node.js version
node --version  # Should be 18+

# Install dependencies
npm install

# Verify TypeScript configuration
npm run type-check
```

### 2. Build Process
```bash
# Build for production
npm run build

# Verify build output
ls -la dist/
```

### 3. Testing
```bash
# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

## Deployment Steps

### Step 1: Build Optimization
The build process automatically optimizes:
- Video assets with adaptive streaming
- Image assets with responsive loading
- JavaScript and CSS minification
- Service worker registration

### Step 2: Asset Configuration
Ensure the following assets are properly configured:

#### Video Assets
```javascript
// Verify video URLs in production
const videoAssets = {
  intro: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4",
  mobile: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4",
  desktop: "https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
};
```

#### Fallback Images
```javascript
// Verify fallback image URLs
const fallbackImages = {
  mobile: "https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg",
  tablet: "https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg",
  desktop: "https://res.cloudinary.com/djg0pqts6/image/upload/v1762217661/Archeforge_nobackground_krynqu.jpg"
};
```

### Step 3: Service Worker Configuration
The service worker (`public/sw.js`) is automatically built and registered. Ensure:

1. HTTPS is enabled on your domain
2. Service worker scope is correctly set
3. Cache strategies are appropriate for your CDN

### Step 4: Analytics Configuration
Configure analytics endpoints:

#### Google Analytics
```javascript
// Update measurement ID in production
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'ArcheForge Landing Page',
  page_location: window.location.href
});
```

#### Custom Analytics
```javascript
// Configure API endpoint
const analyticsConfig = {
  apiEndpoint: 'https://your-domain.com/api/analytics',
  enableCustomAnalytics: true,
  sampleRate: 0.1
};
```

## Platform-Specific Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables
vercel env add GA_MEASUREMENT_ID
vercel env add ANALYTICS_API_ENDPOINT
```

### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront
```bash
# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Performance Optimization

### 1. CDN Configuration
Configure your CDN for optimal performance:
- Enable Gzip/Brotli compression
- Set appropriate cache headers
- Enable HTTP/2 or HTTP/3
- Configure edge caching for video assets

### 2. Video Optimization
The system automatically handles:
- Adaptive bitrate streaming
- Device-specific video profiles
- Network-aware quality selection
- Progressive loading

### 3. Image Optimization
- WebP format support with fallbacks
- Responsive image loading
- Lazy loading for non-critical images
- Automatic quality adjustment

## Monitoring and Analytics

### 1. Performance Metrics
Monitor these key metrics:
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms

### 2. User Engagement Tracking
The analytics system tracks:
- Video completion rates
- CTA click-through rates
- Page visibility changes
- Scroll depth (if applicable)
- Device and browser breakdown

### 3. Error Monitoring
Set up error tracking for:
- Video playback failures
- JavaScript errors
- Network connectivity issues
- Service worker failures

## Security Considerations

### 1. HTTPS Requirements
- Service workers require HTTPS
- All video assets must be served over HTTPS
- Mixed content warnings must be avoided

### 2. Content Security Policy
```javascript
// Example CSP header
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://res.cloudinary.com;
  media-src 'self' https://res.cloudinary.com;
  connect-src 'self' https://www.google-analytics.com;
```

### 3. Cross-Origin Resource Sharing
Configure CORS headers for video assets:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Range
```

## Troubleshooting

### Common Issues

#### 1. Video Not Playing
- Check HTTPS configuration
- Verify video URLs are accessible
- Check browser console for errors
- Verify video format compatibility

#### 2. Service Worker Not Registering
- Ensure HTTPS is enabled
- Check service worker scope
- Verify service worker file exists
- Clear browser cache and retry

#### 3. Analytics Not Tracking
- Verify API endpoints are accessible
- Check Google Analytics configuration
- Verify network requests in browser dev tools
- Check for ad-blocker interference

#### 4. Performance Issues
- Monitor Core Web Vitals
- Check video file sizes
- Verify CDN configuration
- Analyze bundle size with webpack-bundle-analyzer

### Debug Mode
Enable debug mode for development:
```javascript
const analytics = new ForgeAnalytics({
  debugMode: process.env.NODE_ENV === 'development'
});
```

## Post-Deployment Verification

### 1. Functional Testing
- [ ] Video intro plays automatically
- [ ] Hero section appears after video
- [ ] CTA button is functional
- [ ] Social media links work
- [ ] Responsive design works on all devices

### 2. Performance Testing
- [ ] Page load time < 2 seconds
- [ ] Video playback is smooth
- [ ] No memory leaks detected
- [ ] Service worker caching works
- [ ] Offline functionality works

### 3. Analytics Verification
- [ ] Page view events are tracked
- [ ] Video completion events are tracked
- [ ] CTA click events are tracked
- [ ] Performance metrics are collected
- [ ] Error events are logged

### 4. Cross-Browser Testing
- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Maintenance

### Regular Tasks
1. **Weekly**: Monitor analytics and performance metrics
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and optimize video assets
4. **Annually**: Conduct full performance audit

### Update Process
```bash
# Update dependencies
npm update

# Run tests
npm test

# Build and deploy
npm run build
# Deploy using your preferred method
```

## Support

For deployment issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure all external assets are accessible
4. Review this troubleshooting guide
5. Check the implementation documentation

## Conclusion

Following this guide ensures a successful deployment of the ArcheForge cinematic landing page with all performance optimizations, analytics tracking, and error handling systems in place. The landing page is designed to be maintainable, scalable, and provide an exceptional user experience across all devices and network conditions.