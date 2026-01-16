# Surgical Repository Cleanup - Recommended Deletions

**Audit Date**: 2026-01-13  
**Source of Truth**: `memory-bank/systemPatterns.md` & Supabase MCP  
**Live Schema**: Verified via `mcp--supabase--list_tables`

## Summary
This document lists files and directories identified as redundant, obsolete, or “ghost” (unused) during the audit of the Travelling Technicians project. Each entry includes a reason and recommended action. The goal is to improve maintainability, reduce SEO risks, and align the local codebase with the live Supabase schema.

## Categories
1. **Ghost Files** – No import references anywhere in the project.
2. **Duplicate Files** – Multiple versions of the same component/endpoint.
3. **Test/Example Files** – API endpoints and pages used only for development/testing.
4. **Unused Routes** – Pages that are not linked and likely not visited.
5. **Schema‑Drift Migrations** – Migration files that create tables missing in the live database.

## Recommended Deletions

| File Path | Category | Reason | Recommended Action |
|-----------|----------|--------|-------------------|
| `src/components/AddressAutocomplete.tmp1` | Ghost | Temporary backup of `AddressAutocomplete.tsx`; zero import references. | Delete |
| `src/components/AddressAutocomplete.tsx.old` | Ghost | Older version of the same component; zero import references. | Delete |
| `src/components/FallbackErrorBoundary.jsx` | Ghost | JavaScript component never imported; replaced by TypeScript error boundaries. | Delete |
| `src/components/NextjsRouterLoader.tsx` | Ghost | Custom router‑loader component not used anywhere. | Delete |
| `src/components/RouterErrorGuard.tsx` | Ghost | No import references; functionality appears superseded by other error‑handling. | Delete |
| `src/components/SafeNavigation.tsx` | Ghost | No import references; likely an experiment that was never integrated. | Delete |
| `src/components/GlobalErrorHandler.tsx` | Ghost | Only referenced by `RouterErrorGuard.tsx` (itself unused). | Delete |
| `src/components/FallbackContent.tsx` | Ghost | Zero import references; appears to be a placeholder component. | Delete |
| `src/pages/debug.tsx` | Unused Route | Debug page not linked in navigation or sitemap; could be indexed by search engines. | Delete |
| `src/pages/minimal.tsx` | Unused Route | Minimal test page with no inbound links. | Delete |
| `src/pages/services/mobile.tsx` | Unused Route | Duplicate of `mobile‑repair.tsx`; no direct links. | Delete (redirect to `mobile‑repair.tsx` if needed) |
| `src/pages/book‑online.tsx.new` | Duplicate | New version of booking page that was never activated; original `book‑online.tsx` is live. | Delete |
| `src/pages/api/pricing/calculate.ts.backup` | Duplicate | Backup of the pricing calculation endpoint; the primary `calculate.ts` is used. | Delete |
| `src/components/ui/LoadingSpinner.tsx` | Duplicate | Memoized duplicate of `src/components/common/LoadingSpinner.tsx`. Used by `BookingComplete.tsx`. | **Refactor** – update import in `BookingComplete.tsx` to use common version, then delete this file. |
| `src/pages/api/test/` (entire directory) | Test Files | 12+ endpoints used only for development (health checks, booking tests, email subjects). Zero references in production code. | Delete directory (consider keeping a single health‑check if needed for monitoring). |
| `src/pages/api/example/integration‑demo.ts` | Example | Demo endpoint not used in production. | Delete |
| `supabase/migrations/20250916151201_add‑audit‑logging.sql` | Schema‑Drift Migration | Creates `audit_logs`, `approval_workflows`, `pending_approvals`, `approval_history`, `data_lineage`, `review_queue` tables that do not exist in the live database. If these tables are not required for current functionality, the migration is obsolete. | **Investigate** – Confirm with product owner whether these tables are still needed. If not, delete migration file. |
| `supabase/migrations/20250916142455_add‑quality‑control‑columns.sql` | Schema‑Drift Migration | Adds quality‑control columns to `device_models`; columns already exist in live schema (verified). Migration may have already been applied. | Keep (historical record) or archive after verifying no future deployments depend on it. |
| `database/add‑audit‑logging.sql` | Redundant SQL | Duplicate of the migration above; stored in `database/` directory. | Delete (use migrations folder as source of truth). |
| `database/fix‑booking‑compatibility.sql` | Redundant SQL | Already applied? Verify if changes are reflected in live schema. | Delete if applied. |
| `reports/` (old JSON files) | Obsolete Reports | Performance and health‑check reports from previous runs (e.g., `api‑performance‑1751526965801.json`). | Delete or move to archive outside repository. |

## First 5 Ghost Files (as requested)
1. `src/components/AddressAutocomplete.tmp1`
2. `src/components/AddressAutocomplete.tsx.old`
3. `src/components/FallbackErrorBoundary.jsx`
4. `src/components/NextjsRouterLoader.tsx`
5. `src/components/RouterErrorGuard.tsx`

## SEO & Maintenance Notes
- **Unused routes** (`debug.tsx`, `minimal.tsx`) could be indexed by search engines, diluting SEO. Removing them eliminates this risk.
- **Duplicate meta tags** were not detected in this audit; consider a separate SEO‑scan pass.
- **Dynamic imports** of `MapComponent` and `InteractiveMap` are verified as used; keep them.

## Next Steps
1. **Review this list** – Confirm each recommendation with the product owner.
2. **Phase 2 (Approval)** – Obtain explicit confirmation before deletion.
3. **Phase 3 (Execution)** – Use `rm` or `git rm` for approved files.
4. **Phase 4 (Verification)** – Run `npm run build` and `npm run type‑check` to ensure no functionality loss.

## Risks & Caveats
- Deleting migration files may break future deployment if they are still required. Always verify with the Supabase migration history.
- Some “ghost” components may be dynamically loaded via string references (e.g., `require(componentName)`). We found no evidence of this pattern.
- The `calculate‑fixed.ts` endpoint is referenced in `src/utils/cache.ts` for cache warming. **Do not delete** without updating the cache‑warming logic.

---

*Generated by Roo (Architect mode) – 2026‑01‑13*