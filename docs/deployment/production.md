# Production Deployment Guide

This guide covers the complete process for deploying The Travelling Technicians website to production, including environment setup, database configuration, and post-deployment verification.

## 🏗️ Infrastructure Overview

### Technology Stack
- **Hosting**: Vercel (Serverless)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Email**: SendGrid
- **Domain**: travelling-technicians.ca
- **SSL**: Automatic via Vercel

### Environment Requirements
- Node.js 16+ 
- Next.js 14
- PostgreSQL 15+ (via Supabase)

## 🚀 Pre-Deployment Checklist

### 1. Code Preparation
```bash
# Ensure all tests pass
npm run test

# Run production build locally
npm run build

# Verify no linting errors
npm run lint

# Check for security vulnerabilities
npm audit
```

### 2. Environment Variables Setup

#### Required Environment Variables
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Website Configuration
NEXT_PUBLIC_WEBSITE_URL=https://travelling-technicians.ca
NEXT_PUBLIC_SITE_NAME="The Travelling Technicians"

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@travelling-technicians.ca

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Vercel Environment Variable Setup
1. Log into Vercel Dashboard
2. Navigate to Project Settings → Environment Variables
3. Add all variables for Production environment
4. Ensure sensitive keys are marked as "Sensitive"

### 3. Database Preparation

#### Supabase Production Setup
```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check Row Level Security is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify indexes for performance
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

#### Data Migration (if needed)
```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed-production

# Verify data integrity
npm run db:verify
```

## 🌐 Deployment Process

### 1. Vercel Deployment

#### Automatic Deployment (Recommended)
```bash
# Connect repository to Vercel
# Push to main branch triggers automatic deployment

git add .
git commit -m "feat: production deployment"
git push origin main
```

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set custom domain
vercel domains add travelling-technicians.ca
```

### 2. Domain Configuration

#### DNS Settings
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

#### SSL Certificate
- Automatic via Vercel
- Includes www and root domain
- Auto-renewal enabled

### 3. CDN Configuration

#### Vercel Edge Network
- Automatic global distribution
- Image optimization enabled
- Gzip compression enabled
- Brotli compression enabled

## 📊 Post-Deployment Verification

### 1. Functional Testing

#### Core Functionality Checklist
- [ ] Homepage loads correctly
- [ ] Booking form submission works
- [ ] Email notifications are sent
- [ ] Admin panel accessible
- [ ] Pricing API responds correctly
- [ ] Service area verification works
- [ ] Mobile responsiveness verified

#### Automated Testing
```bash
# Run production health checks
npm run test:production

# Verify API endpoints
npm run test:api:production

# Check performance metrics
npm run lighthouse:production
```

### 2. Performance Verification

#### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅

#### Performance Testing
```bash
# Run Lighthouse audit
npm run lighthouse:performance

# Check image optimization
npm run audit:images

# Verify cache performance
npm run test:cache-performance
```

### 3. SEO Verification

#### SEO Checklist
- [ ] Meta tags configured correctly
- [ ] Structured data implemented
- [ ] Sitemap.xml accessible
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] Open Graph tags present

#### SEO Testing
```bash
# Run SEO test suite
npm run test:seo:full

# Validate structured data
npm run validate:schema

# Check sitemap
curl https://travelling-technicians.ca/sitemap.xml
```

### 4. Security Verification

#### Security Checklist
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database RLS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented

#### Security Testing
```bash
# Run security audit
npm run audit:security

# Check headers
curl -I https://travelling-technicians.ca

# Verify SSL
npm run test:ssl
```

## 🔧 Configuration Files

### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Next.js Configuration (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['travelling-technicians.ca'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        }
      ]
    }
  ]
}

module.exports = nextConfig
```

## 📈 Monitoring & Maintenance

### 1. Performance Monitoring

#### Vercel Analytics
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Error rate monitoring
- Geographic performance data

#### Custom Monitoring
```bash
# Schedule performance checks
npm run monitor:performance

# API health monitoring
npm run monitor:api-health

# Database performance monitoring
npm run monitor:database
```

### 2. Error Monitoring

#### Error Tracking Setup
- Vercel Function logs
- Supabase Dashboard logs
- Custom error boundaries in React

#### Log Analysis
```bash
# View Vercel function logs
vercel logs

# Check database logs in Supabase
# Navigate to Logs section in Supabase Dashboard
```

### 3. Backup & Recovery

#### Database Backups
- Automatic daily backups via Supabase
- Point-in-time recovery available
- Manual backup procedures documented

#### Disaster Recovery
```bash
# Create manual database backup
npm run db:backup

# Restore from backup
npm run db:restore --backup-id=backup-123

# Deploy rollback
vercel --prod --force
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear build cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check

# Verify environment variables
npm run validate-env
```

#### Database Connection Issues
```bash
# Test database connection
npm run db:test-connection

# Verify environment variables
npm run check:env

# Check Supabase status
curl https://status.supabase.com/api/v2/status.json
```

#### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check image optimization
npm run audit:images

# Verify cache configuration
npm run test:cache
```

### Emergency Procedures

#### Site Down Recovery
1. Check Vercel status: https://vercel.com/status
2. Verify DNS configuration
3. Check Supabase status
4. Deploy previous known good version
5. Contact support if needed

#### Database Issues
1. Check Supabase Dashboard
2. Verify connection strings
3. Check Row Level Security policies
4. Restore from backup if necessary

## 📞 Support Contacts

### Service Providers
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **SendGrid Support**: https://support.sendgrid.com

### Internal Contacts
- **Development Team**: dev@travelling-technicians.ca
- **Operations**: ops@travelling-technicians.ca

---

**Last Updated**: September 15, 2025  
**Deployment Version**: 4.0.0  
**Next Review**: October 15, 2025

For launch checklist, see [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)  
For deployment success verification, see [FINAL_DEPLOYMENT_SUCCESS.md](./FINAL_DEPLOYMENT_SUCCESS.md)
