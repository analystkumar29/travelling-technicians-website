# Active Context

## Current Development Focus
**Primary Objective**: SEO optimization and search engine visibility improvements for travelling-technicians.ca.

**Current Status**: Phase 4 (Sitemap Freshness & Fallback) completed January 2026. All four phases of the "Zero-Regression SEO Improvement Plan" are now complete:
1. **Phase 1**: Safe Data Layer & ISR Foundation ✓
2. **Phase 2**: Database-Driven Pricing & Content Injection ✓
3. **Phase 3**: Dynamic City Pages & Schema Markup ✓
4. **Phase 4**: Sitemap Freshness & Fallback ✓

The website now features:
- **ISR (Incremental Static Regeneration)** with 1-hour cache for dynamic content
- **Database-driven content** for pricing, services, testimonials with graceful fallbacks
- **Dynamic city-service-model pages** for hyper-local long-tail keywords
- **E-E-A-T signals** via `TechnicianSchema` component with `knowsAbout` and `memberOf` properties
- **Wikidata entity linking** for local SEO
- **Fresh sitemap** with database-driven `lastmod` timestamps and webhook regeneration triggers

**Target Outcome**: Dominate search rankings for "travelling technicians" and local service keywords in British Columbia service areas.

## Recent Changes & Milestones
### Phase 4 – SEO Sitemap Freshness & Fallback (Completed January 2026)
- **XML Sitemap Fixes** – Fixed `escapeXml` function with proper HTML entities, completed `generateFallbackSitemap` function.
- **Database-Driven Freshness** – Sitemap uses `updated_at` timestamps from `service_locations`, `services`, `mobileactive_products` tables.
- **Dynamic Route Inclusion** – City-service-model pages (e.g., `/repair/vancouver/screen-repair/iphone-14`) included in sitemap (55 total URLs).
- **Webhook Regeneration** – Created `/api/webhooks/sitemap-regenerate` endpoint for real-time sitemap updates on database changes.
- **Cache Integration** – Added `sitemapCache` with 24-hour TTL and cache invalidation support.
- **Zero-Regression Guarantee** – All changes additive with no UI, booking system, or admin functionality impact.

### Phase 3 – Dynamic City Pages & Schema Markup (Completed January 2026)
- **Technicians Database Schema** – Created `technicians` table with `certifications`, `years_experience`, `specializations` columns.
- **Standalone Schema Component** – `TechnicianSchema.tsx` with `knowsAbout` and `memberOf` properties for E-E-A-T signals.
- **Dynamic City-Service-Model Routes** – `/repair/[city]/[service]/[model].tsx` for hyper-local long-tail keywords.
- **Wikidata Integration** – `wikidata.ts` utility with city-to-entity mapping for local SEO entity linking.

### Phase 2 – Management Enhancement (Completed September 2025)
- **Audit Logging System** – Automatic change tracking for all critical tables (`device_models`, `brands`, `dynamic_pricing`).
- **Review Queue** – Priority‑based interface for reviewing contaminated or flagged models.
- **Approval Workflows** – Configurable multi‑step approval processes for pricing changes and bulk operations.
- **Data Lineage Tracking** – Source system identification (manual, scraped, imported, static) and transformation history.
- **Deployment**: Successfully deployed to production with zero downtime.

### Phase 1 – Immediate Actions (Completed September 2025)
- **Quality Control Columns** – Added `quality_score`, `data_source`, `needs_review` to `device_models`.
- **Emergency Blacklist** – Frontend and API filtering of contaminated model names (e.g., `QV7`, `V1‑V10`, `Premium`, `Standard`).
- **Bulk Operations API** – Endpoints for mass deactivation, activation, marking for review.
- **Management Panel Enhancements** – Quality control dashboard with contamination detection.

### SEO & Performance Foundation (Completed January 2026)
- **ISR Implementation** – Incremental Static Regeneration with `revalidate: 3600` for homepage and city pages.
- **Data Service Layer** – `src/lib/data-service.ts` with singleton cache pattern, 5-minute TTL, graceful fallbacks.
- **Database Integration** – Pricing, services, testimonials fetched from Supabase with static fallback safety.
- **Structured Data Validation** – Implemented and validated Organization, LocalBusiness, and Service schema.
- **Caching System** – Multi‑layer cache for API responses with configurable TTLs.

### Production Deployment Success (January 2026)
- **Final Build Fix** – Resolved TypeScript errors in `browserCache.ts` and deployed a world‑class caching system.
- **Performance Metrics** – 75%+ cache hit rates, 99%+ speed improvements for device APIs.
- **Live Monitoring** – Cache health endpoints, service worker offline support, and production verification.

## Immediate Tasks (Next 1–2 Weeks)
1. **SEO Monitoring & Optimization**
   - **Google Search Console**: Submit updated sitemap and monitor indexing status of new dynamic routes.
   - **Performance Tracking**: Monitor Core Web Vitals and ISR cache hit rates.
   - **Keyword Ranking**: Track position changes for target keywords ("travelling technicians", "mobile repair Vancouver", etc.).

2. **Configure Cron Job for Sitemap Queue Processing**
   - **Production Deployment**: Set up cron job to run `scripts/process-sitemap-queue.js` every 5 minutes.
   - **Environment Variables**: Configure `SITEMAP_WEBHOOK_URL` for production environment.
   - **Monitoring**: Add logging and alerting for queue processing failures.

3. **Content Expansion**
   - **Blog Posts**: Create additional SEO-optimized content for target long-tail keywords.
   - **Service Pages**: Expand dynamic city-service-model combinations based on search demand.
   - **Testimonials**: Increase database-driven testimonials for social proof signals.

4. **Performance Monitoring & Alerting**
   - **API Response Times**: Set up alerts for slow queries (e.g., > 500 ms).
   - **Cache Hit Rates**: Monitor cache performance and adjust TTLs if needed.
   - **Error Rate Tracking**: Track 5xx errors and fallback usage.

## Open Issues & Known Risks
- **Pricing Coverage Gaps**: Only 14.7% of possible device/service/tier combinations have pricing entries (1,529 of 10,376). Missing combinations will fall back to static pricing.
- **Database Performance**: The simple‑query pattern fetches all pricing entries; this may become inefficient as the table grows (currently ~1.5k rows). Caching mitigates but does not eliminate the risk.
- **Contaminated Models**: 33 models (12%) flagged as contaminated; review queue needs manual attention.
- **Email Deliverability**: SendGrid integration works but subject‑line formatting issues may affect open rates.
- **Mobile Responsiveness**: Some UI enhancements may need further tuning on small screens.

## Schema Drift Audit
*Audit performed: 2026-01-13 (UTC)*

### Missing Tables
The following tables are defined in migration files but do not exist in the live database:
- `technicians` – referenced by `bookings.technician_id` foreign key.
- `audit_logs` – created in `20250916151201_add-audit-logging.sql`.
- `approval_workflows` – same migration.
- `pending_approvals` – same migration.
- `approval_history` – same migration.
- `data_lineage` – same migration.
- `review_queue` – same migration.
- `device_models_staging` – created in `20250916142455_add-quality-control-columns.sql`.

### RLS Mismatches
- **RLS disabled** on `import_batches`, `quality_rules`, `anomaly_detections`, `customer_feedback` (advisor flags this as a security error). Migrations may not have enabled RLS; decision needed.
- **Overly permissive policies**: `Public can insert bookings` allows unrestricted INSERT; `Service role can do everything` bypasses RLS for service role (advisor warning).

### Index Issues
- **Missing foreign‑key indexes**: 6 foreign keys lack covering indexes (advisor INFO).
- **Unused indexes**: 43 indexes have never been used (advisor INFO). Consider removal to improve write performance.

### Security Definer Views
- `staging_dashboard` and `anomaly_summary` are defined with `SECURITY DEFINER` (advisor ERROR). These views should be reviewed.

### Function Search Path Mutable
- Functions `publish_model`, `archive_model`, `bulk_publish_models`, `update_updated_at_column` have mutable search paths (advisor WARN).

### Schema Consistency
- The `bookings` table includes columns `technician_id`, `repair_status`, `user_id` added by later migration (`20250917140027_fix_booking_compatibility.sql`), which are present in live schema (consistent).
- All other core tables match migration definitions.

### Recommendations
1. Create missing tables if they are still required for application functionality.
2. Enable RLS on administrative tables or move them to a non‑public schema.
3. Add missing indexes on foreign keys.
4. Review and possibly drop unused indexes.
5. Convert security‑definer views to `INVOKER` or adjust permissions.
6. Fix function search paths.

## Decisions & Rationale
- **Caching Strategy**: Chose in‑memory (Node‑cache) over Redis for simplicity; TTLs are endpoint‑specific (30 min – 24 hours).
- **Fallback Static Data**: All device‑selection APIs include static fallback data to ensure UI functionality even when database is unavailable.
- **Module‑Based Logging**: Each module (`supabaseClient`, `apiCache`, `api/devices/brands`) creates its own logger for granular debugging.
- **Service Role vs Anonymous Client**: Customer‑facing APIs use the service‑role key for consistent database access; frontend components use the anonymous key for security.
- **Dynamic Pricing Query Pattern**: Switched from complex nested JOINs to a simple `SELECT *` plus JavaScript filtering to avoid database timeouts. This pattern is already proven in the admin panel.

## Upcoming Planning
### Phase 3 – Pipeline Redesign (Planned)
- **Staged Data Import**: Move scraped data to `device_models_staging` table for review before production.
- **Automated Quality Scoring**: Machine‑learning model to predict contamination.
- **Customer Feedback Integration**: Allow users to report incorrect model names or pricing.

### Feature Roadmap
- **Payment Integration** (Stripe/PayPal) – Enable online payments for bookings.
- **SMS Notifications** (Twilio) – Send booking reminders and status updates via SMS.
- **Technician Mobile App** – Separate app for technician dispatch and job management.
- **Advanced Analytics** – Dashboard for business insights (conversion rates, popular services, regional demand).

## Team Notes
- **Primary Developer**: Solo developer (owner) with occasional contractor support.
- **Communication**: Issues tracked via GitHub; deployment via Vercel.
- **Documentation**: Comprehensive `/docs/` directory; `npm run scripts:help` lists available utilities.

---

*Last Updated: January 2026*  
*This document is updated as the project context evolves.*