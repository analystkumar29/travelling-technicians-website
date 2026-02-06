# CLAUDE.md — Travelling Technicians (OperationReady)

> Black-box audit: 2026-02-06. All facts verified against live DB and source code.

## Section 1: The Truth

**Stack** (verified from `package.json` + `next.config.js`):
- **Runtime**: Next.js 14.2.25 (Pages Router, NOT App Router), React 18.2, TypeScript
- **Database**: Supabase PostgreSQL 17.6 (`@supabase/supabase-js` v2.57.4)
- **Styling**: Tailwind CSS 3.3.3, Framer Motion 10, Radix UI primitives
- **Email**: SendGrid (`@sendgrid/mail`)
- **Maps**: Leaflet + react-leaflet
- **State**: React Query (TanStack v5), react-hook-form
- **SEO**: `next-seo` v7, programmatic JSON-LD, DB-driven sitemap
- **Deploy**: Vercel (inferred from `VERCEL_URL` checks in `src/utils/supabaseClient.ts`)
- **Domain**: `www.travelling-technicians.ca` (non-www redirects via `next.config.js`)

**Database** (27 tables, 4 views, 31 triggers):

| Hot Table | Rows | Seq Scans | Idx Scans | Total Updates |
|---|---|---|---|---|
| `dynamic_routes` | 4,771 | 512 | 996,551 | 812,656 |
| `dynamic_pricing` | 496 | 64,606 | 1,607,038 | 1,452 |
| `device_models` | 124 | 5,980 | 4,690,780 | 613 |
| `services` | 17 | **664,167** | 1,504 | 59 |
| `service_locations` | 13 | **340,094** | 426,393 | 169 |
| `testimonials` | 23 | **10,608** | 5 | 5 |

**Auth**: Custom hand-rolled JWT (NOT Supabase Auth). PBKDF2-SHA512 password hash, HMAC-SHA256 token signing. Admin-only; no end-user auth. Token stored in `localStorage`. 7-day expiry.

## Section 2: Command Center

```bash
# Development
npm run dev                    # Custom dev server (scripts/development/simple-start-dev.js)
npm run dev:legacy             # Standard next dev

# Build & Deploy
npm run build                  # Validates env → next build (pre-generates ~4,771 static pages)
npm run start                  # next start (production server)

# Testing
npm test                       # Jest
npm run test:seo:full          # SEO suite: meta tags + structured data + sitemap validation

# Database
npm run db:optimize            # Run DB optimization script
npm run db:full-rebuild        # Master database rebuild

# Quality
npm run lint                   # ESLint
npm run validate:schema        # Structured data validation
npm run test:cache-full        # Cache performance + API response benchmarks
```

**Key env vars** (from `src/utils/supabaseClient.ts`, `src/pages/api/management/login.ts`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public client
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, used by booking + management APIs
- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` / `ADMIN_JWT_SECRET` — admin panel auth
- `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL` — email confirmations

## Section 3: The Graph

### Page Architecture

| Route Pattern | Type | Data Source | Revalidation |
|---|---|---|---|
| `/` `/about` `/contact` `/faq` `/privacy-policy` `/terms-conditions` | Static (SSG) | None / hardcoded | Build-time |
| `/repair` (index) | SSG + ISR | `service_locations` + `services` + `device_models` | 3,600s |
| `/repair/[city]` | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/repair/[city]/[service]` | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/repair/[city]/[service]/[model]` | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/services/[slug]` | SSG | `services` table | Build-time |
| `/book-online` `/booking-confirmation` `/verify-booking` | Client SPA | API calls | N/A |
| `/management/*` | Client SPA (auth-gated) | API calls with Bearer JWT | N/A |
| `/blog/*` | Static (hardcoded TSX) | None | Build-time |
| `/api/sitemap.xml` | API (XML) | `dynamic_routes` (paginated) | 24h cache header |

**The critical path**: `src/pages/repair/[[...slug]].tsx` — catch-all route handling 4,771+ pages via `getStaticPaths` (fallback: `'blocking'`). Queries `dynamic_routes.slug_path` directly. Payload contains pre-joined city/service/model/pricing data as JSONB.

### DB Trigger Chain (simplified)

```
Admin changes pricing → dynamic_pricing row updated
  ├─ trg_pricing_sync_routes → updates dynamic_routes.is_active
  ├─ trg_pricing_sync_device_models → updates device_models.is_active
  ├─ trigger_update_routes_on_pricing_change → updates route timestamps
  └─ trigger_refresh_routes_pricing (STATEMENT) → upserts ALL routes via view_active_repair_routes
       └─ view does: service_locations × device_models × services × brands × device_types
          with 2 correlated subqueries per row against dynamic_pricing
```

### API Layer Map

| Endpoint Group | Auth | DB Client | Primary Tables |
|---|---|---|---|
| `/api/bookings/*` | None (public) | Service Role | `bookings`, `customer_profiles` |
| `/api/pricing/*` | None (public) | Anon | `dynamic_pricing`, `services`, `device_models` |
| `/api/devices/*` | None (public) | Anon | `device_models`, `brands` |
| `/api/management/*` | JWT Bearer | Service Role | All tables (CRUD) |
| `/api/technicians/*` | None (GET) / JWT (writes) | Anon (GET) / Service (writes) | `technicians`, `technician_availability` |
| `/api/warranties/*` | JWT Bearer | Anon (GET) / Service (POST) | `warranties`, `bookings` |
| `/api/sitemap.xml` | None | Anon | `dynamic_routes` |

## Section 4: Rules of Engagement

**Patterns discovered in the codebase:**

1. **Slug-driven architecture**: Every entity has a `slug` column. Routes are built as `repair/{city_slug}/{service_slug}/{model_slug}`. The `dynamic_routes` table is the single source of truth for all SEO pages.

2. **Dual-client pattern**: Browser code uses the anon key (`supabase`). Server API routes use the service role key (`getServiceSupabase()`). Never mix them. Service role bypasses RLS.

3. **Payload denormalization**: The `dynamic_routes.payload` JSONB column contains pre-joined data (city, service, model, brand, pricing). Pages read this single column instead of joining at render time. The trade-off: every source table change triggers a full route rebuild (~1.8s avg).

4. **`is_active` as the universal soft-delete**: Every entity uses `is_active` boolean. DB triggers cascade `is_active` changes: pricing → routes + device_models. Never hard-delete catalog data.

5. **Booking ref format**: `TEC-{sequential}` (DB trigger), warranty: `WT-{YYMMDD}-{uuid_prefix}` (DB trigger). Both auto-generated on INSERT. Never set manually.

6. **Admin auth is client-side only**: The `withAuth()` HOC checks `localStorage` for a JWT. API endpoints under `/api/management/*` must independently verify the Bearer token. There is no SSR-level auth guard.

7. **SEO meta pattern**: `repair/[[...slug]].tsx` generates `<title>`, `<meta description>`, OG tags, and BreadcrumbList JSON-LD inline. The XML sitemap at `/api/sitemap.xml` paginates `dynamic_routes` in batches of 1,000.

---

## Surprise Insight: RLS Policy Bypass (RESOLVED 2026-02-06)

**Finding**: On `brands`, `device_models`, `device_types`, `dynamic_pricing`, and `services`, there were TWO permissive RLS SELECT policies. PostgreSQL ORs permissive policies together, so an `Allow public read` policy with `qual: true` made the `is_active = true` filters completely useless — exposing inactive/draft data via the raw API.

**Fix applied** (migration `fix_rls_allow_public_read_bypass`):
- Dropped `Allow public read` (qual: `true`) from all 5 tables
- Rewrote `Public Read Types` on `device_types` (was also `true`, now `is_active = true`)
- Each table now has exactly one SELECT policy: `is_active = true`

## Full Security Lockdown (RESOLVED 2026-02-06)

**Finding**: After the RLS policy bypass fix, 3 classes of issues remained:
1. 9 tables had RLS disabled — wide open to the public anon key
2. 5 tables had RLS enabled but zero policies
3. 4 views used `SECURITY DEFINER` instead of `security_invoker`
4. All 14 tables granted full privileges (SELECT/INSERT/UPDATE/DELETE) to anon + authenticated

**Fix applied** (migration `fix_all_security_advisories`):
- **Revoked all grants** from anon + authenticated on 11 internal tables (service-role-only)
- **Granted SELECT-only** to anon on 3 public reference tables: `technician_availability`, `warranties`, `service_categories`
- **Enabled RLS** on all 9 previously-disabled tables
- **Created SELECT policies** on the 3 anon-readable tables
- **Set `security_invoker = true`** on all 4 views and revoked direct access
- **Revoked access** to `mv_sitemap_routes` materialized view
- **Fixed API routes**: `technicians/availability.ts` writes now use service role + admin auth; `warranties/index.ts` POST now uses service role

**Remaining advisories** (pre-existing, lower priority):
- 11 tables have RLS enabled but no policies (intentional — all grants revoked, no anon/authenticated access)
- 29 functions have mutable `search_path` (cosmetic; all trigger-only or service-role-only)
- `bookings` table has `INSERT` policy with `true` (intentional — public booking flow)
