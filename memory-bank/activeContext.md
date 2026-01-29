# Active Context

## Current Development Focus
**Primary Objective**: SEO optimization and search engine visibility improvements for travelling-technicians.ca.

**Current Status**: Phase 4 (Sitemap Freshness & Fallback) completed January 2026.  
Project is operating on the V2 "Operation Ready" database schema.

---

## ⚠️ Critical Data Source Directive (Read First)

The database schema is fully normalized and maintained externally.

**Source of Truth (always):**
- DOCS_MASTER_SCHEMA_Part1.md  
- DOCS_MASTER_SCHEMA_Part1.5.md  
- DOCS_MASTER_SCHEMA_Part2.md  
- OR live database via MCP server

This file **must not** define tables, columns, relationships, constraints, RLS policies, or triggers.

If any information here conflicts with master schema or MCP server,  
**master schema / MCP server always wins.**

---

## Target Outcome
Dominate search rankings for "travelling technicians" and local service keywords across British Columbia service areas.

---

## Recent High-Level Milestones

### V2 "Operation Ready" Schema Migration (Completed January 2026)
- Legacy V1 schema deprecated.
- Application code aligned to normalized V2 schema.
- Master schema documentation generated and maintained.

### 5-Point SEO Audit Protocol (Completed January 2026)
1. Global metadata via `next-seo@7.0.1`
2. Database-driven structured data
3. Core Web Vitals optimization (`next/image`)
4. Internal linking (Breadcrumbs, NearbyCities)
5. ISR with 1-hour revalidation

### Dynamic Service Pages ("Seed & Switch") (Completed January 2026)
- Service pages migrated from hardcoded constants to database-driven content.
- Dynamic routing with ISR.
- Zero UI regression verified.

### Sitemap Freshness & Fallback (Completed January 2026)
- Database-driven `lastmod`
- Webhook-based regeneration
- Cached with fallback static sitemap

---

## Immediate Tasks (Next 1–2 Weeks)

1. Component Rendering Debugging  
   - Investigate why Breadcrumbs and NearbyCities may not appear in static HTML.

2. SEO Monitoring  
   - Submit sitemap to Google Search Console  
   - Track indexing of dynamic routes

3. Content Expansion  
   - Add more database-driven FAQs and testimonials  
   - Expand city-service coverage

---

## Open Issues & Known Risks

- Pricing coverage gaps cause fallback pricing for some combinations.
- Technician dispatch logic not fully wired to zone-based assignment.
- Potential leftover references to deprecated V1 column names in code.

---

## Operating Rules

- Never infer schema from code or memory bank files.
- Never document schema here. It should be documented in appropriate file from @doc/master-schema folder.
- Always consult master schema or MCP server before making database assumptions.

---

_Last Updated: January 2026_