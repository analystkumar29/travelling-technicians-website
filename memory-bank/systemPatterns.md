# System Patterns

## Operating Rules (CRITICAL)

- **Reference, Don't Guess**: SystemPatterns describe **how the system behaves**. They never describe **what the schema contains**.
- **Schema Authority**: All schema assumptions (table names, columns, types, triggers) MUST be obtained from `DOCS_MASTER_SCHEMA_*.md` or the live database via MCP server.
- **No Hardcoding**: No hardcoded schema definitions are allowed inside application logic.

---

## 1. API Design Pattern

**Pattern**: RESTful Next.js API Routes with consistent error handling and client separation.

- **Validation**: Validate inputs early (at the edge/handler start).
- **Status Codes**: Return meaningful HTTP status codes (400 for bad input, 401 for auth, 404 for missing data).
- **Security**: Never expose service-role credentials or raw DB errors to the client.
- **Response Shape**: Consistent JSON objects `{ success: boolean, data?: T, error?: string }`.

## 2. Caching Strategy

**Pattern**: Multi-layer in-memory caching with configurable TTLs.

- **Flow**: Cache → Database → Fallback.
- **Granularity**: Each endpoint defines its own TTL based on data volatility.
- **Normalization**: Cache keys are deterministic, normalized, and include relevant parameters (e.g., `brand_id`).
- **Safety**: Cached failures or empty states are never stored.

## 3. Logging & Monitoring

**Pattern**: Module-scoped structured logging.

- **Utility**: Centralized logger utility for consistent formatting.
- **Scoping**: Each module/API creates its own logger instance (e.g., `const logger = new Logger('API/Pricing')`).
- **Metadata**: Include contextual metadata (endpoint, user_id, params, duration) in every log.

## 4. Error Handling & Fallbacks

**Pattern**: Graceful degradation.

- **Catch-All**: Always catch database and third-party API errors.
- **Data Resilience**: Return fallback static data (constants) where feasible to keep the UI functional.
- **UI States**: Frontend components must handle loading, empty, and error states gracefully.

## 5. Database Access Pattern

**Pattern**: Client separation and RLS.

- **Anonymous Client**: Used strictly for browser-side, non-sensitive reads (RLS enforced).
- **Service-Role Client**: Used strictly for server-side operations, complex joins, or administrative writes.
- **Logic Location**: Prefer PostgreSQL triggers for automatic fields (refs, timestamps) over application-side calculation.

## 6. Security Pattern

- Environment variables validated at runtime; failure to load = crash on start.
- Service-role key is never passed to the frontend.
- Strict input sanitization and TypeScript type-guards.
- Row-Level Security (RLS) is the primary defense, not the secondary one.

## 7. Component Architecture

**Pattern**: Reusable, composable components using shadcn/ui.

- **Base UI**: Purely presentational (shadcn).
- **Features**: Logic-heavy components (e.g., `BookingForm`).
- **Guidelines**: No business logic inside UI-only components; prefer composition over complex prop-drilling.

## 8. State Management

- **Workflow State**: React Context for client-side multi-step flows (e.g., `BookingContext`).
- **Server State**: TanStack Query (React Query) for all asynchronous data fetching.
- **Keys**: Query keys are deterministic arrays for reliable invalidation.

## 9. SEO & Content Pattern

**Pattern**: Hybrid static/dynamic rendering.

- **ISR**: Incremental Static Regeneration (1-hour TTL) for all service and location pages.
- **Structured Data**: JSON-LD injected at render time based on current DB pricing/metadata.
- **Metadata**: Dynamic meta-tag generation via a centralized `SEO` utility.

## 10. Build & TypeScript Safety

- **Zero Tolerance**: Fix TypeScript errors immediately; never use `any` when a type can be defined.
- **Verification**: Always run `npm run build` locally before pushing to ensure deployment success.

## 11. Conventions

- **Filenames**: `kebab-case.ts` / `kebab-case.tsx`
- **Components**: `PascalCase`
- **Utilities/Variables**: `camelCase`
- **Imports**: Always use absolute paths (`@/components/...`, `@/utils/...`)

---
_Last Updated: January 2026_