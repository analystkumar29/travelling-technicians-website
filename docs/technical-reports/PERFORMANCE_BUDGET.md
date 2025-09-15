# Performance Budget Configuration

## Image Size Limits

### Hero Images
- WebP: Maximum 100KB
- JPEG Fallback: Maximum 150KB
- Dimensions: 1200x800px optimal

### Service Images  
- WebP: Maximum 75KB
- JPEG Fallback: Maximum 100KB
- Dimensions: 800x600px optimal

### Blog Images
- WebP: Maximum 60KB  
- JPEG Fallback: Maximum 80KB
- Dimensions: 1200x800px optimal

### Thumbnails
- WebP: Maximum 30KB
- JPEG Fallback: Maximum 40KB
- Dimensions: 400x300px optimal

## Core Web Vitals Targets

### Largest Contentful Paint (LCP)
- Target: < 2.5 seconds
- Current: ~0.3 seconds ✅
- Status: Meeting target

### First Input Delay (FID)
- Target: < 100ms
- Current: ~50ms ✅  
- Status: Meeting target

### Cumulative Layout Shift (CLS)
- Target: < 0.1
- Current: ~0.05 ✅
- Status: Meeting target

## Bundle Size Limits

### JavaScript Bundle
- Target: < 250KB gzipped
- Critical: < 500KB gzipped

### CSS Bundle  
- Target: < 50KB gzipped
- Critical: < 100KB gzipped

## Monitoring Tools

### Automated Testing
- Lighthouse CI for builds
- Core Web Vitals monitoring
- Image size validation

### Manual Testing
- PageSpeed Insights (monthly)
- GTmetrix analysis (monthly)
- Real user monitoring

Generated: 2025-07-02T18:54:59.620Z
