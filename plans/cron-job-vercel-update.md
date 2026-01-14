# Vercel Cron Job Configuration Update

**Date:** 2026-01-14  
**Purpose:** Add cron job configuration to `vercel.json` for automatic sitemap queue processing.

## Current Status

- ✅ CRON_SECRET environment variable added via MCP (value: `test-secret-placeholder-123`)
- ✅ API endpoint exists at `/api/cron/process-sitemap-queue.ts`
- ❌ Cron configuration missing in `vercel.json`

## Required Changes

### 1. Update `vercel.json`

Add a top-level `"crons"` array with the following configuration:

```json
{
  "version": 2,
  ...existing configuration...
  "crons": [
    {
      "path": "/api/cron/process-sitemap-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

#### Location
Insert the `crons` property after the `functions` section (line ~156) and before the `redirects` section.

### 2. Update CRON_SECRET with a Stronger Value (Optional)

The current placeholder secret `test-secret-placeholder-123` should be replaced with a cryptographically secure random string (e.g., generated via `openssl rand -base64 32`). This can be done later.

## Implementation Steps

1. **Switch to Code mode** to edit `vercel.json`.
2. **Insert the cron configuration** as described above.
3. **Commit changes** to the repository (optional).
4. **Deploy** the updated configuration (may happen automatically if connected to Vercel Git integration).
5. **Test** the cron endpoint manually using curl (step 5 of the todo list).

## Validation

After deployment, verify:

- Cron job appears in Vercel Dashboard → Cron Jobs section.
- The endpoint responds with a 401 when secret is missing.
- The endpoint processes queue when correct secret is provided.

## Backup Plan

If Vercel Cron Jobs are not available (requires Pro/Enterprise plan), revert to using external cron service (Option 2 in the deployment guide). The current configuration is compatible with both approaches.

---

**Next Action:** Request mode switch to Code mode for file editing.