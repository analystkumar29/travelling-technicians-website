# Lazy Loading Implementation Guide

## Overview
Add lazy loading to improve initial page load times by deferring off-screen images.

## 1. Update Image Components

### For Service Area Images
```tsx
<Image
  src="/images/service-areas/vancouver-optimized.webp"
  alt="Vancouver service area"
  width={800}
  height={600}
  loading="lazy" // Add this line
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### For Blog Images
```tsx
<Image
  src="/images/blog/article-image-optimized.webp"
  alt="Blog article image"
  width={1200}
  height={800}
  loading="lazy" // Add this line
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

## 2. Implementation Priority

### Immediate (Hero Images)
- Keep `priority={true}` for above-the-fold images
- Do NOT add lazy loading to hero images

### Add Lazy Loading To
- Service area grid images
- Blog post images (except featured)
- Team member photos
- Service icons below the fold
- Testimonial avatars

## 3. WebP Implementation with Fallback

```tsx
<picture>
  <source srcSet="/images/optimized.webp" type="image/webp" />
  <Image
    src="/images/optimized.jpg"
    alt="Description"
    width={800}
    height={600}
    loading="lazy"
  />
</picture>
```

## 4. Expected Performance Improvements

- Initial page load: 0.1-0.2s faster
- Reduced bandwidth usage by 40-60%
- Better Core Web Vitals scores
- Improved mobile performance

## 5. Testing

After implementation:
1. Test with Chrome DevTools Network tab
2. Verify images load as you scroll
3. Check Core Web Vitals in PageSpeed Insights
4. Monitor Google Search Console for improvements

Generated: 2025-07-02T18:54:59.617Z
