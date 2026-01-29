# Project Brief

⚠️ **Database Source of Truth**
This document does NOT define database tables, columns, relationships, constraints, or triggers. All schema information must be obtained from:
- `DOCS_MASTER_SCHEMA_Part1.md`
- `DOCS_MASTER_SCHEMA_Part1.5.md`
- `DOCS_MASTER_SCHEMA_Part2.md`
- Or live database via MCP server.
**If any conflict exists, the master schema / MCP server wins.**

---

## Overview
**Project Name**: The Travelling Technicians  
**Description**: A professional mobile phone and laptop repair service offering doorstep convenience across the Lower Mainland, BC. The platform includes an online booking system, transparent dynamic pricing, and automated technician dispatch.

**Live Website**: https://travelling-technicians.ca  
**Repository**: Private (proprietary)  
**Current Version**: 5.0.0 (January 2026 – V2 Schema Update)

## Business Goals
- Provide convenient doorstep repair for mobile phones and laptops.
- Enable customers to book repairs online with real-time pricing.
- Expand service coverage across the Lower Mainland.
- Automate technician dispatch via WhatsApp integration.
- Track warranty and repair part information using a normalized relational structure.

## Core Features
- **Doorstep Service**: Multi-step booking flow with location-based verification.
- **V2 Pricing Engine**: Database-driven pricing with location-based travel fees.
- **Automated Dispatch**: WhatsApp integration for real-time technician communication.
- **Warranty Management**: Tracking system with auto-generated warranty numbers via DB triggers.
- **SEO Infrastructure**: Dynamic city/service pages powered by ISR (Incremental Static Regeneration).
- Database-driven FAQs and testimonials.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Next.js API Routes, Supabase (Postgres).
- **Automation**: n8n (Dispatch logic), SendGrid (Transactional email).

## Architecture Highlights
- **V2 Schema**: Fully normalized database comprising **22 tables**.
- **Database-Level Logic**: Critical ID generation (TEC-refs) and audit logging are handled by PostgreSQL triggers, not application code.
- **Security**: Strict Row-Level Security (RLS) enforced at the database layer.
- **Resilience**: Graceful degradation via static fallbacks if the database is unreachable.

## Documentation
- `/docs/` directory  
- `DOCS_MASTER_SCHEMA_*.md` (Primary Data Reference)

---
_Last Updated: January 2026_