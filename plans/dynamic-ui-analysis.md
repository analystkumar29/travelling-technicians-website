# Dynamic UI Loading Analysis

## Objective
Determine whether UI components are loaded dynamically from Supabase for service pages and location pages.

## Methodology
1. Examined Supabase schema via `list_tables` and `execute_sql` to understand available data tables.
2. Reviewed source code of key pages:
   - Homepage (`src/pages/index.tsx`)
   - Location pages (`src/pages/locations/[city].tsx`)
   - Service pages (`src/pages/services/laptop-repair.tsx`, `src/pages/mobile-screen-repair.tsx`)
3. Analyzed data fetching patterns (static vs dynamic) and identified API calls.

## Findings

### Supabase Schema Overview
The database contains the following relevant tables:
- `locations` – store location data (city, description, neighborhoods, etc.)
- `reviews` – customer reviews
- `technicians` – technician details
- `services` – service definitions
- `pricing` – pricing data for services by location
- `devices` and `brands` – device and brand catalog

### Homepage (`src/pages/index.tsx`)
- **Static content**: Hero, features, service highlights, testimonials (hardcoded).
- **Dynamic components**:
  - `PostalCodeChecker` – client-side component that calls `POST /api/geocode` (which queries Supabase `locations` table) to validate postal codes and show location info.
  - `TechnicianAvailability` – static placeholder (no Supabase integration).
  - `TestimonialCarousel` – static data (no Supabase integration).
  - `ServiceAreasMap` – static image (no Supabase integration).

### Location Pages (`src/pages/locations/[city].tsx`)
- **Dynamic data**: Uses `getStaticProps` to fetch location data from Supabase `locations` table via `GET /api/locations/[city]` (server‑side). Renders location‑specific content (description, neighborhoods, common repairs).
- **Static fallbacks**: Testimonials, FAQ, service highlights are hardcoded.
- **API calls**:
  - `GET /api/locations/[city]` → queries Supabase `locations` table.
  - No client‑side dynamic loading after initial page load.

### Service Pages (`src/pages/services/laptop-repair.tsx`, `src/pages/mobile-screen-repair.tsx`)
- **Fully static**: All content (pricing, FAQ, service areas, features) is hardcoded.
- **No Supabase integration**: No API calls or database queries.
- **Pricing data**: Hardcoded price ranges; not sourced from `pricing` table.

### Other Components
- **Booking flow**: `book‑online.tsx` uses client‑side API calls (`/api/devices/brands`, `/api/devices/models`) which query Supabase `devices` and `brands` tables.
- **Admin/backend**: Sitemap generation, cache invalidation, and cron jobs interact with Supabase for SEO and data freshness.

## Summary of Dynamic Loading

| Page/Component | Supabase Integration | Dynamic Loading |
|----------------|----------------------|-----------------|
| Homepage | Partial (PostalCodeChecker only) | Client‑side API call |
| Location pages | Yes (location data) | Static‑time (SSG) |
| Service pages | No | None |
| Booking flow | Yes (device/brand catalog) | Client‑side API calls |
| Testimonials | No | Static |
| Pricing | No | Static |

## Conclusion
- **Location pages** are the only UI that currently loads content dynamically from Supabase (via SSG).
- **Service pages** are entirely static and do not leverage Supabase for pricing, FAQ, or service details.
- **Homepage** has minimal dynamic integration (postal‑code validation only).
- The bulk of the UI (service pages, testimonials, pricing, service areas) remains hardcoded.

## Recommendations (Optional)
1. **Migrate service‑page pricing** to use the `pricing` table, enabling location‑based price display.
2. **Fetch testimonials dynamically** from the `reviews` table for better freshness.
3. **Implement ISR (Incremental Static Regeneration)** for location pages to keep neighborhood/repair data up‑to‑date.
4. **Create a service‑content table** to manage service‑page content (descriptions, FAQs, features) in Supabase, enabling CMS‑like updates.

## Next Steps
1. Review findings with the team.
2. Decide on priority areas for dynamic content loading.
3. Create implementation plan for selected improvements.

---

*Analysis performed on 2026‑01‑14.*