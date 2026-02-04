# Archived Sitemap Files

**Archived Date:** March 2, 2026  
**Reason:** Replaced with dynamic API-based sitemap via Vercel rewrite

## What Changed

These static sitemap files have been replaced with a professional Vercel rewrite configuration:

| Before | After |
|--------|-------|
| `public/sitemap.xml` (2 URLs, placeholder) | `/sitemap.xml` → rewrites to `/api/sitemap.xml` |
| `public/sitemap-simple.xml` (24 URLs, incomplete) | Archived - no longer needed |

## Why This Change

1. **Single Source of Truth**: The dynamic API sitemap (`/api/sitemap.xml`) generates 3,289+ URLs with accurate `lastmod` dates from the database
2. **No SEO Noise**: Having multiple sitemaps with conflicting data creates confusion for Google
3. **Professional Approach**: Using Vercel rewrites to serve dynamic content at the canonical `/sitemap.xml` URL
4. **Database-Driven**: Content timestamps automatically update when database records change

## Configuration

### Vercel Rewrite (vercel.json)
```json
"rewrites": [
  {
    "source": "/sitemap.xml",
    "destination": "/api/sitemap.xml"
  }
]
```

### Robots.txt
```txt
Sitemap: https://www.travelling-technicians.ca/sitemap.xml
```

## Archived Files

- `sitemap.xml.archived` - Original static placeholder (2 URLs)
- `sitemap-simple.xml.archived` - Original simple sitemap (24 URLs)

## Recovery

If you need to restore static sitemaps:
1. Rename `.archived` files back to `.xml`
2. Move them to `/public/`
3. Remove the rewrite from `vercel.json`
4. Update `robots.txt` accordingly

**Note:** This is NOT recommended unless the API sitemap fails catastrophically.
