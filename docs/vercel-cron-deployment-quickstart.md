# Vercel Cron Deployment Quickstart

**Project**: travelling-technicians.ca  
**Purpose**: Quick deployment guide for sitemap regeneration cron jobs  
**Time to Complete**: 10-15 minutes

---

## Overview

This guide provides step-by-step instructions to deploy the sitemap regeneration cron job to Vercel using the **external cron service** approach (recommended for Hobby plan).

## Prerequisites

- ✅ Phase 4 implementation completed
- ✅ Vercel deployment of travelling-technicians.ca
- ✅ Supabase database with triggers configured
- ✅ Free account on [cron-job.org](https://cron-job.org)

---

## Step 1: Set Environment Variables

### In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add the following variables:

```
CRON_SECRET=generate-a-secure-random-string-here
```

**To generate a secure secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Example: `CRON_SECRET=abc123def456ghi789jkl012mno345pqr678stu901`

3. Click "Save"

---

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### Option B: Using GitHub Integration
1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Verify deployment at `https://travelling-technicians.ca`

---

## Step 3: Create cron-job.org Account

1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for free account (25 jobs free)
3. Verify your email address

---

## Step 4: Configure Cron Job

### In cron-job.org dashboard:
1. Click **"CREATE CRONJOB"**
2. Configure as follows:

#### Basic Settings:
- **Title**: `Travelling Technicians Sitemap Queue`
- **URL**: `https://travelling-technicians.ca/api/cron/process-sitemap-queue`
- **Schedule**: `Every 5 minutes`
- **Request Method**: `POST`

#### Headers Section:
Click "Add Header" and add:
- **Name**: `X-Cron-Secret`
- **Value**: `[Your CRON_SECRET from Step 1]`

Click "Add Header" again:
- **Name**: `Content-Type`
- **Value**: `application/json`

#### Request Body:
```json
{
  "action": "process_sitemap_queue",
  "timestamp": "{{UNIX_TIMESTAMP}}"
}
```

#### Advanced Settings:
- **Timeout**: `30 seconds`
- **Retry on failure**: `3 times`
- **Notification on failure**: Enable (enter your email)

3. Click **"CREATE"**

---

## Step 5: Test the Cron Job

### Test 1: Manual Test via Script
```bash
# Make the test script executable
chmod +x scripts/test-cron-endpoint.js

# Test locally (requires dev server running)
node scripts/test-cron-endpoint.js local

# Test production
node scripts/test-cron-endpoint.js production
```

### Test 2: Manual Test via curl
```bash
# Replace with your actual secret
curl -X POST https://travelling-technicians.ca/api/cron/process-sitemap-queue \
  -H "X-Cron-Secret: your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Sitemap queue processed successfully",
  "timestamp": "2026-01-14T04:20:00.000Z",
  "result": {
    "processed": 0,
    "failed": 0,
    "cleaned": 0,
    "stats": [...]
  }
}
```

### Test 3: Trigger Manual Database Change
```sql
-- In Supabase SQL Editor
INSERT INTO service_locations (city_name, province, is_active) 
VALUES ('Test City', 'BC', true)
ON CONFLICT DO NOTHING;

-- Check if queue entry was created
SELECT * FROM sitemap_regeneration_queue 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Step 6: Verify Sitemap Regeneration

1. **Check sitemap cache invalidation:**
   ```bash
   curl -I https://travelling-technicians.ca/api/sitemap.xml
   ```
   Look for: `X-Sitemap-Cache: MISS` (first request) or `HIT` (subsequent)

2. **View sitemap content:**
   ```bash
   curl https://travelling-technicians.ca/api/sitemap.xml | head -20
   ```

3. **Check queue processing:**
   ```sql
   -- In Supabase
   SELECT * FROM sitemap_regeneration_queue 
   WHERE status = 'completed'
   ORDER BY processed_at DESC 
   LIMIT 5;
   ```

---

## Step 7: Monitor and Troubleshoot

### Monitoring Dashboard:
1. **cron-job.org** → Monitor → Execution History
2. **Vercel** → Analytics → Function Invocations
3. **Supabase** → Logs → Database Logs

### Common Issues & Solutions:

#### Issue 1: "Unauthorized" error
**Solution**: Verify `CRON_SECRET` matches in Vercel and cron-job.org

#### Issue 2: Timeout errors
**Solution**: 
- Increase timeout to 60 seconds in cron-job.org
- Check database query performance
- Reduce batch size in queue processor

#### Issue 3: No queue items processed
**Solution**:
- Verify database triggers are active
- Check `sitemap_regeneration_queue` table has entries
- Test webhook endpoint manually

#### Issue 4: Sitemap not updating
**Solution**:
- Check cache invalidation logs
- Verify `sitemapCache` is being cleared
- Test sitemap generation directly

---

## Step 8: Set Up Alerts

### Email Alerts (cron-job.org):
1. Go to Settings → Notifications
2. Add your email
3. Configure to receive alerts for:
   - Failed executions
   - Timeouts
   - HTTP errors

### Vercel Alerts:
1. Go to Settings → Monitoring
2. Set up alerts for:
   - Function errors (> 5% error rate)
   - High latency (> 5 seconds)
   - High invocation count

---

## Step 9: Production Verification Checklist

- [ ] Cron job executing every 5 minutes (check cron-job.org history)
- [ ] Queue items being processed (check Supabase `sitemap_regeneration_queue`)
- [ ] Sitemap cache invalidating on changes (check response headers)
- [ ] No errors in Vercel function logs
- [ ] Database triggers firing correctly
- [ ] Sitemap XML valid (validate at https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [ ] Google Search Console sitemap submission successful

---

## Advanced Configuration

### Option A: Vercel Cron Jobs (Pro Plan)
If you upgrade to Vercel Pro:

1. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-sitemap-queue",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. Deploy and check Vercel → Cron Jobs

### Option B: Multiple Environments
For staging/testing:

1. Create separate cron jobs for:
   - Staging: `https://staging.travelling-technicians.ca/api/cron/process-sitemap-queue`
   - Production: `https://travelling-technicians.ca/api/cron/process-sitemap-queue`

2. Use different `CRON_SECRET` values for each environment

### Option C: Backup Cron Service
For redundancy, set up a second cron service:

1. **UptimeRobot** (free): 5-minute checks
2. **Healthchecks.io** (free): Cron monitoring
3. **GitHub Actions** (free): Scheduled workflows

---

## Maintenance Schedule

### Daily:
- [ ] Check cron execution history
- [ ] Review error logs
- [ ] Verify queue processing stats

### Weekly:
- [ ] Rotate `CRON_SECRET` (optional)
- [ ] Review performance metrics
- [ ] Clean up old logs

### Monthly:
- [ ] Test full regeneration flow
- [ ] Update dependencies
- [ ] Review security settings

---

## Emergency Procedures

### If Cron Jobs Stop:
1. **Immediate**: Run processor manually
   ```bash
   node scripts/process-sitemap-queue.js
   ```
2. **Diagnose**: Check service status pages
3. **Fallback**: Use alternative cron service

### If Queue Backlog Grows:
1. Increase frequency to every 2 minutes temporarily
2. Run multiple manual executions
3. Investigate database trigger issues

### If Security Breach:
1. Rotate all secrets immediately
2. Disable cron endpoints temporarily
3. Audit access logs

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs/cron-jobs
- **cron-job.org Help**: https://cron-job.org/en/help/
- **Supabase Triggers**: https://supabase.com/docs/guides/database/postgres/triggers
- **Project Issues**: GitHub repository

---

## Success Metrics

After deployment, monitor these metrics:

1. **Queue Processing Time**: Should be < 10 seconds
2. **Success Rate**: Should be > 95%
3. **Sitemap Freshness**: Updates within 5 minutes of database changes
4. **Search Engine Indexing**: Increased indexed pages over 3-6 months

---

## Final Verification

Run the complete verification script:

```bash
# Install dependencies if needed
npm install node-fetch dotenv

# Run full test suite
node scripts/test-cron-endpoint.js production && \
echo "✅ Cron endpoint test passed" || \
echo "❌ Cron endpoint test failed"
```

**Expected Outcome**: All tests pass, cron job executing every 5 minutes, sitemap regenerating automatically on database changes.

---

*Deployment completed: January 2026*  
*For assistance: ops@travelling-technicians.ca*