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

**Database** (30 tables, 4 views, 32 triggers):

| Hot Table | Rows | Seq Scans | Idx Scans | Total Updates |
|---|---|---|---|---|
| `dynamic_routes` | 4,919 | 512 | 996,551 | 812,656 |
| `dynamic_pricing` | 496 | 64,606 | 1,607,038 | 1,452 |
| `device_models` | 124 | 5,980 | 4,690,780 | 613 |
| `services` | 17 | **664,167** | 1,504 | 59 |
| `service_locations` | 13 | **340,094** | 426,393 | 169 |
| `testimonials` | 63 | **10,608** | 5 | 5 |

**Auth**: Custom hand-rolled JWT (NOT Supabase Auth). PBKDF2-SHA512 password hash, HMAC-SHA256 token signing. Admin (7-day expiry) + Technician (30-day, role='technician' in JWT). Tokens stored in `localStorage`. Shared `ADMIN_JWT_SECRET` key.

## Section 2: Command Center

```bash
# Development
npm run dev                    # Custom dev server (scripts/development/simple-start-dev.js)
npm run dev:legacy             # Standard next dev

# Build & Deploy
npm run build                  # Validates env → next build (pre-generates ~4,920 static pages)
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
| `/` `/about` `/faq` `/privacy-policy` `/terms-conditions` | Static (SSG) | None / hardcoded | Build-time |
| `/contact` | SSG + ISR | `site_settings` via `getBusinessSettingsForSSG()` | 3,600s |
| `/repair` (index) | SSG + ISR | `service_locations` + `services` + `device_models` | 3,600s |
| `/repair/[city]` (city-page) | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/repair/[city]/[model]` (city-model-page) | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/repair/[city]/[service]` (city-service-page) | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/repair/[city]/[neighborhood]` (neighborhood-page) | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/repair/[city]/[service]/[model]` (model-service-page) | SSG + ISR | `dynamic_routes` (slug_path lookup) | 86,400s |
| `/services/[slug]` | SSG + ISR | `services` table | 3,600s |
| `/service-areas` | SSG + ISR | `service_locations` + `neighborhood_pages` + `testimonials` | 3,600s |
| `/sitemap` | SSG + ISR | `dynamic_routes` + `services` + `service_locations` | 3,600s |
| `/check-warranty` | Client SPA | `/api/warranties/lookup` | N/A |
| `/book-online` `/booking-confirmation` `/verify-booking` | Client SPA | API calls | N/A |
| `/management/*` | Client SPA (auth-gated) | API calls with Bearer JWT | N/A |
| `/technician/login` | Client SPA | `/api/technician/login` | N/A |
| `/technician` `/technician/available-jobs` `/technician/my-jobs` `/technician/profile` | Client SPA (tech-auth-gated) | `/api/technician/*` with Bearer JWT | N/A |
| `/technician/jobs/[id]` | Client SPA (tech-auth-gated) | `/api/technician/jobs/[id]` | N/A |
| `/blog/*` | Static (hardcoded TSX) | None | Build-time |
| `/api/sitemap.xml` | API (XML) | `dynamic_routes` (paginated) | 24h cache header |

**The critical path**: `src/pages/repair/[[...slug]].tsx` — catch-all route handling **~4,920 pages** across **6 route types** via `getStaticPaths` (fallback: `'blocking'`). Queries `dynamic_routes.slug_path` directly. Payload contains pre-joined city/service/model/pricing data as JSONB.

### Route Types & Templates

| Route Type | Slug Pattern | Template | Source |
|---|---|---|---|
| `model-service-page` | `repair/[city]/[service]/[model]` | `ModelServicePage` (dynamic import) | 3,172 routes |
| `city-model-page` | `repair/[city]/[model]` | Inline JSX in `[[...slug]].tsx` | 1,586 routes |
| `city-service-page` | `repair/[city]/[service]` | Inline JSX in `[[...slug]].tsx` | 52 routes |
| `city-page` | `repair/[city]` | `CityPage` (dynamic import) | 13 routes |
| `neighborhood-page` | `repair/[city]/[neighborhood]` | `NeighborhoodPage` (dynamic import) | 96 routes |
| (index) | `repair` | `RepairIndex` (dynamic import) | 1 route |

Templates in `src/components/templates/`: `CityPage.tsx`, `ModelServicePage.tsx`, `NeighborhoodPage.tsx`, `RepairIndex.tsx`

### DB Trigger Chain (simplified)

```
Admin changes pricing → dynamic_pricing row updated
  ├─ trg_pricing_sync_routes → updates dynamic_routes.is_active
  ├─ trg_pricing_sync_device_models → updates device_models.is_active
  ├─ trigger_update_routes_on_pricing_change → updates route timestamps
  └─ trigger_refresh_routes_pricing (STATEMENT) → upserts ALL routes via view_active_repair_routes
       └─ view does: service_locations × device_models × services × brands × device_types
          with 2 correlated subqueries per row against dynamic_pricing

Repair completed → repair_completions INSERT
  └─ trg_auto_create_warranty → INSERT into warranties (90-day, status='active')
       └─ set_warranty_number (BEFORE INSERT) → generates WT-YYMMDD-XXXX number
```

### API Layer Map

| Endpoint Group | Auth | DB Client | Primary Tables |
|---|---|---|---|
| `/api/bookings/*` | None (public create) / JWT (list/update) | Service Role | `bookings`, `customer_profiles`, `terms_acceptances`, `legal_documents` |
| `/api/repairs/complete` | JWT Bearer | Service Role | `repair_completions`, `bookings`, `warranties` (via trigger) |
| `/api/pricing/*` | None (public) | Anon | `dynamic_pricing`, `services`, `device_models` |
| `/api/devices/*` | None (public) | Anon | `device_models`, `brands` |
| `/api/management/*` | JWT Bearer | Service Role | All tables (CRUD) |
| `/api/technicians/*` | None (GET) / JWT (writes) | Anon (GET) / Service (writes) | `technicians`, `technician_availability` |
| `/api/warranties/lookup` | None (public, rate-limited) | Service Role | `warranties`, `bookings`, `device_models`, `services` |
| `/api/warranties/*` (other) | JWT Bearer | Service Role | `warranties`, `bookings`, `device_models`, `services` |
| `/api/send-warranty-notification` | None (internal) | N/A | N/A (sends email via SendGrid) |
| `/api/technician/login` | None (public) | Service Role | `technicians` |
| `/api/technician/*` (other) | Technician JWT | Service Role | `bookings`, `technicians`, `technician_specializations`, `repair_completions` |
| `/api/management/technicians/[id]/*` | Admin JWT | Service Role | `technician_specializations`, `technician_service_zones`, `technicians` |
| `/api/sitemap.xml` | None | Anon | `dynamic_routes` |

## Section 4: Rules of Engagement

**Patterns discovered in the codebase:**

1. **Slug-driven architecture**: Every entity has a `slug` column. Routes are built as `repair/{city_slug}/{service_slug}/{model_slug}`. The `dynamic_routes` table is the single source of truth for all SEO pages.

2. **Dual-client pattern**: Browser code uses the anon key (`supabase`). Server API routes use the service role key (`getServiceSupabase()`). Never mix them. Service role bypasses RLS.

3. **Payload denormalization**: The `dynamic_routes.payload` JSONB column contains pre-joined data (city, service, model, brand, pricing). Pages read this single column instead of joining at render time. The trade-off: every source table change triggers a full route rebuild (~1.8s avg).

4. **`is_active` as the universal soft-delete**: Every entity uses `is_active` boolean. DB triggers cascade `is_active` changes: pricing → routes + device_models. Never hard-delete catalog data.

5. **Booking ref format**: `TEC-{sequential}` (DB trigger), warranty: `WT-{YYMMDD}-{uuid_prefix}` (DB trigger). Both auto-generated on INSERT. Never set manually.

6. **Admin auth is client-side only**: The `withAuth()` HOC checks `localStorage` for a JWT. API endpoints under `/api/management/*` must independently verify the Bearer token. There is no SSR-level auth guard.

7. **SEO meta pattern**: `repair/[[...slug]].tsx` generates `<title>`, `<meta description>`, OG tags, hreflang (`en-CA`), and BreadcrumbList JSON-LD inline. The XML sitemap at `/api/sitemap.xml` paginates `dynamic_routes` in batches of 1,000. Global LocalBusiness + Service + FAQ JSON-LD schemas live in `_document.tsx` with `areaServed` covering 13 cities with GeoCoordinates.

8. **Booking form controller pattern**: The booking form is split into `useBookingController` hook (state, validation, navigation) + 3 step components (`DeviceServiceStep`, `ContactLocationStep`, `ScheduleConfirmStep`). The hook exposes watched values via `useWatch` (not `watch()`) for performance. Liquid-glass CSS in `src/styles/liquid-glass.css`.

9. **Business settings from DB**: `src/hooks/useBusinessSettings.ts` provides client-side hooks (`usePhoneNumber`, `useServiceAreas`, etc.) with 5-minute cache. SSG pages use `getBusinessSettingsForSSG()` from `src/lib/business-settings.ts`. Source of truth: `site_settings` table (16 rows — phone, email, hours, tax rate, etc.).

10. **Internal linking for SEO**: `InternalLinkingFooter` component adds links to all 13 city pages + popular services on every repair page, preventing 3,200+ dynamic pages from being sitemap-only orphans.

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

## Performance Optimization (APPLIED 2026-02-06)

**Migration `optimize_indexes_and_fix_neighborhood_rls`**:
- **Fixed `neighborhood_pages` RLS bypass** — dropped 3 `authenticated_can_*` duplicate policies (same OR-bypass pattern as the earlier RLS fix)
- **Optimized `testimonials` indexes** — dropped 4 unused indexes (city/service/location/neighborhood, all 0 scans), added `idx_testimonials_featured` covering actual query pattern (`is_featured, featured_order, created_at DESC`)
- **Dropped duplicate bookings indexes** — `idx_bookings_booking_ref` (duplicate of unique constraint), `idx_bookings_technician_id` (duplicate of partial index)
- **Dropped duplicate/unused payments indexes** — `unique_booking_payment` constraint (duplicate of `one_payment_per_booking`), `idx_payments_processed_at`, `idx_payments_status`
- **Dropped unused `idx_warranties_end_date`** (0 scans, no code path)
- **Disabled orphaned trigger** `booking_status_change_trigger` — writes to `booking_status_history` which has 0 code references

**Migration `fix_rls_initplan_duplicates_and_policies`**:
- **Fixed `auth_rls_initplan`** on `neighborhood_pages` — rewrote 3 admin policies to use `(select auth.uid())` / `(select auth.jwt())` for per-query evaluation
- **Fixed `multiple_permissive_policies`** on `technicians` and `technician_service_zones` — split `Strict Admin Access` (ALL) into separate INSERT/UPDATE/DELETE policies with `(select auth.jwt())`, eliminating SELECT overlap with `Public Read Access`
- **Dropped duplicate index** `idx_dynamic_pricing_model_service_status` (identical to `idx_dynamic_pricing_active`)

**Remaining advisories** (pre-existing, lower priority):
- 14 tables have RLS enabled but no policies (intentional — all grants revoked, no anon/authenticated access; includes `terms_acceptances`, `repair_completions`)
- 30 functions have mutable `search_path` (cosmetic; all trigger-only or service-role-only; includes `create_warranty_on_completion`)
- `bookings` table has `INSERT` policy with `true` (intentional — public booking flow)
- `booking_communications` and `booking_status_history` are orphaned tables (0 code references, 0 rows)
- `terms_acceptances` and `repair_completions` have RLS enabled but no policies (intentional — service-role only, no anon/authenticated grants)

## Legal Compliance Infrastructure (APPLIED 2026-02-06)

**Migration `create_legal_compliance_tables`**:

### New Tables
- **`legal_documents`** — Versioned legal document metadata (T&C + Privacy Policy). Partial unique index `idx_legal_documents_current` ensures one `is_current` per `document_type`. Anon SELECT granted (needed for version display on pages).
- **`terms_acceptances`** — Audit trail of T&C acceptance at booking time. FK to `bookings(id)` ON DELETE SET NULL, FK to `legal_documents(id)`. Indexes on `booking_id` and `customer_email`. Service-role only (no anon/authenticated grants). Records IP address (`inet`), user-agent, document version, and timestamp.

### Booking Flow Integration
- `CreateBookingRequest` type includes `agreedToTerms` + `termsVersion` fields
- `useBookingController` hook sends `agreedToTerms: true` and `termsVersion: '2026-02-06-v1'` in submission payload
- `/api/bookings/create.ts` inserts `terms_acceptances` row after successful booking creation (non-blocking — errors logged but don't fail the booking)

### Legal Content
- **Terms & Conditions** (`/terms-conditions`): 21 sections — PIPEDA/PIPA device data consent, BPCPA s.18.2 pricing disclosure, no mandatory arbitration (BC Bill 4), statutory warranties (BC SGA s.18, ON CPA s.9, QC CPA art.37), provincial addendums (ON 10-day cooling-off, QC legal warranty + French language right), right to repair (Bills C-244/C-294), unclaimed devices (Repairers Lien Act + Commercial Liens Act)
- **Privacy Policy** (`/privacy-policy`): PIPEDA breach notification procedure (s.10.1 RROSH), BC PIPA references, device data incidental access policy, specific retention periods, Privacy Commissioner complaint filing (federal + BC OIPC)

## Operational Workflow (APPLIED 2026-02-06)

**Migration `create_repair_completions_and_fix_warranties`**:

### Booking Lifecycle

```
pending → confirmed → assigned → in-progress → completed
                                                    ↓
                                            repair_completions INSERT
                                                    ↓
                                            trg_auto_create_warranty
                                                    ↓
                                            warranties INSERT (90-day, active)
                                                    ↓
                                            warranty notification email (non-blocking)
```

Any non-completed status can also → `cancelled`.

### New Table: `repair_completions`
- `id` (uuid PK), `booking_id` (FK → bookings, UNIQUE), `technician_id` (FK → technicians)
- `completed_at` (timestamptz), `repair_notes` (text), `parts_used` (jsonb), `repair_duration` (integer, minutes)
- `customer_signature_url` (text), `additional_services` (jsonb)
- RLS enabled, no policies (service-role only — same pattern as `terms_acceptances`)
- Indexes: `idx_repair_completions_booking`, `idx_repair_completions_technician`

### Schema Changes
- **`warranties.status`** column added — `warranty_status` enum (`active`/`expired`/`void`/`claimed`), default `'active'`
- **`bookings_status_check`** constraint updated — now allows: `pending`, `confirmed`, `assigned`, `in-progress`, `completed`, `cancelled`
- **`BookingStatus` TypeScript type** updated in `src/types/booking.ts` — added `'assigned'` and `'in-progress'`

### Trigger: `trg_auto_create_warranty`
- AFTER INSERT on `repair_completions`
- Calls `create_warranty_on_completion()` → inserts into `warranties` with 90-day duration, status `'active'`
- The existing `set_warranty_number` BEFORE INSERT trigger on `warranties` auto-generates the `WT-YYMMDD-XXXX` warranty number

### API Endpoints Fixed
- **`/api/repairs/complete.ts`** — Now uses service role + `requireAdminAuth()`. Creates `repair_completions` row, updates booking to `completed`, returns auto-created warranty. Removed references to non-existent booking columns (`repair_status`, `device_type`, `device_brand`, `device_model`, `service_type`).
- **`/api/bookings/update.ts`** — Completion logic now uses the booking's assigned `technician_id` (falls back to first active technician). Removed references to non-existent columns and default technician creation.
- **`/api/bookings/index.ts`** — Added `technicians (full_name, phone)` join for admin display.
- **`/api/warranties/index.ts`** — Switched GET to service role. Replaced invalid booking column joins (`device_type`, `device_brand`, etc.) with proper `device_models (name)` and `services (name, display_name)` joins.

### Admin UI: Booking Management (`/management/bookings`)
- **Summary cards**: 6 status cards (Total, Pending, Confirmed, Assigned, In Progress, Completed)
- **Status filter dropdown**: All 6 statuses
- **Status badges**: pending (yellow), confirmed (blue), assigned (purple), in-progress (indigo), completed (green), cancelled (red)
- **Status-based action buttons per booking**:
  - `pending` → **Confirm** button
  - `confirmed` → **Assign Technician** dropdown + button (inline in list)
  - `assigned` → **Start Repair** button
  - `in-progress` → **Complete Repair** button (opens modal with form)
  - Any non-completed → **Cancel** button
- **Technician assignment**: Dropdown in booking list (confirmed) and modal (any non-terminal status). Sets `technician_id` on booking and transitions to `assigned`.
- **Repair completion form** (in modal): Repair notes (required), duration (minutes), parts used (one per line). Calls `/api/repairs/complete`. Shows success message with auto-generated warranty number.
- **Warranty display** (in modal): For completed bookings, shows warranty number, valid-until date, status badge, and link to warranty management page.
- **Technician display**: Shows assigned technician name + phone in booking list and modal.

### Customer-Facing: Verify Booking (`/verify-booking`)
- For completed bookings with warranty data, shows a warranty card with: warranty code (monospace), valid-until date, status badge
- Status display updated for all 6 statuses with appropriate colors
- Warranty card includes "Check warranty status anytime" link to `/check-warranty`
- **Fixed (2026-02-07)**: `/api/verify-booking` and `/api/bookings/reference/[reference]` now join warranty data for completed bookings — previously the warranty card was dead code (never received data)

## Customer Warranty Confirmation (APPLIED 2026-02-07)

### Public Warranty Lookup API

**New file**: `src/pages/api/warranties/lookup.ts`

- **POST only** — keeps warranty numbers out of URL/access logs
- **No auth required** — uses `getServiceSupabase()` (warranties table has RLS, no anon policies)
- **Two lookup modes**: `warranty_number + email` or `booking_ref + email`
- **Rate limiting**: In-memory Map, 5 requests/minute/IP, auto-cleanup every 5 minutes
- **Security**: Returns generic 404 whether warranty number or email is wrong (prevents enumeration)
- **Response**: warranty details (number, dates, duration, status, days_remaining) + booking details (ref, device, service, completion date)

### `/check-warranty` Page

**New file**: `src/pages/check-warranty.tsx`

- Client-side SPA (same pattern as `/verify-booking`, `/book-online`)
- **Tab toggle**: "Warranty Number" | "Booking Reference"
- **Email input** always visible (required for both modes)
- **Result card**: status badge (active=green, expired=gray, void=red, claimed=blue), warranty number (monospace), days remaining progress bar, valid from/until dates, device + service info
- **CTA**: "Need to file a warranty claim? Call us at (604) 849-5329"
- **FAQ section**: 3 collapsible items (coverage, claims, expiry)
- **Rate limit handling**: Shows friendly message on 429

### Warranty Notification Email

**Modified file**: `src/lib/email-templates.ts`
- `WarrantyEmailData` interface + `buildWarrantyNotificationEmail()` function
- Uses existing `emailWrapper()`, `headerBanner()`, `detailRow()` helpers
- Email structure: navy header → greeting → amber WARRANTY CODE badge → details card (duration, dates, device, service, technician, booking ref) → amber CTA button → "What's Covered" bullets → footer

**New file**: `src/pages/api/send-warranty-notification.ts`
- Follows exact pattern of `send-confirmation.ts` (SendGrid, click tracking disabled, dev simulation mode)
- Subject: "Your Repair Warranty — The Travelling Technicians"

**Modified file**: `src/pages/api/repairs/complete.ts`
- After warranty data is fetched post-completion, sends non-blocking warranty email via internal fetch to `/api/send-warranty-notification`
- Fetches customer name, email, device model, and service name for email content
- Errors logged but never block the API response

### Navigation Links
- **Footer** (`src/components/layout/Footer.tsx`): "Check Warranty" link added to Quick Links (between "Book Online" and "Contact Us")
- **Verify Booking** (`src/pages/verify-booking.tsx`): "Check warranty status anytime" link below warranty card
