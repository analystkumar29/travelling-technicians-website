# Vercel Cron Job Deployment Guide

**Project**: travelling-technicians.ca  
**Purpose**: Deploy sitemap queue processor as a scheduled cron job on Vercel  
**Date**: January 2026

---

## Overview

Since Vercel doesn't support traditional cron jobs on serverless functions, we need to use one of three approaches:

1. **Vercel Cron Jobs** (Recommended - Vercel Pro/Enterprise feature)
2. **External Cron Service** (Free options available)
3. **Self-hosted worker** (Alternative approach)

This guide covers all three options with step-by-step instructions.

---

## Option 1: Vercel Cron Jobs (Recommended)

Vercel offers built-in cron job functionality for Pro and Enterprise plans. This is the most integrated solution.

### Step 1: Create a Cron Job API Route

Create a new file at `src/pages/api/cron/process-sitemap-queue.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { processSitemapQueue } from '../../../scripts/process-sitemap-queue';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret for security
  const cronSecret = req.headers['x-vercel-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting sitemap queue processing via Vercel Cron...');
    const result = await processSitemapQueue();
    
    res.status(200).json({
      success: true,
      message: 'Sitemap queue processed successfully',
      result
    });
  } catch (error) {
    console.error('Error processing sitemap queue:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### Step 2: Update Queue Processor for API Compatibility

Modify `scripts/process-sitemap-queue.js` to export a function:

```javascript
// Add at the end of the file
async function processSitemapQueue() {
  try {
    console.log('Starting sitemap queue processing...');
    
    // Your existing processing logic here
    const result = await main();
    
    console.log('Queue processing completed:', result);
    return result;
  } catch (error) {
    console.error('Queue processing failed:', error);
    throw error;
  }
}

// Export for API usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { processSitemapQueue };
}
```

### Step 3: Configure `vercel.json`

Add cron job configuration to your `vercel.json` file:

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

### Step 4: Set Environment Variable

Add a `CRON_SECRET` environment variable in Vercel dashboard:

```bash
CRON_SECRET=your-secure-random-string-here
```

### Step 5: Deploy and Verify

1. Deploy to Vercel
2. Check Vercel dashboard → Cron Jobs section
3. Monitor execution logs

**Note**: Vercel Cron Jobs require Pro or Enterprise plan. If you're on Hobby plan, use Option 2 or 3.

---

## Option 2: External Cron Service (Free)

Use a free external service like **cron-job.org**, **UptimeRobot**, or **Healthchecks.io**.

### Using cron-job.org:

#### Step 1: Create Account
- Go to [cron-job.org](https://cron-job.org)
- Sign up for free account (25 jobs free)

#### Step 2: Create Cron Job
1. Click "CREATE CRONJOB"
2. Configure:
   - **Title**: "Travelling Technicians Sitemap Queue"
   - **URL**: `https://travelling-technicians.ca/api/webhooks/process-queue`
   - **Schedule**: Every 5 minutes
   - **Request Method**: POST
   - **Request Body**: `{"action": "process_sitemap_queue"}`
   - **Headers**: Add `X-Cron-Secret: your-secret-key`

#### Step 3: Create Processing Endpoint

Create `src/pages/api/webhooks/process-queue.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { processSitemapQueue } from '../../../scripts/process-sitemap-queue';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Processing sitemap queue via external cron...');
    const result = await processSitemapQueue();
    
    res.status(200).json({
      success: true,
      message: 'Queue processed successfully',
      processed: result.processedCount,
      failed: result.failedCount
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

#### Step 4: Set Environment Variable
```bash
CRON_SECRET=your-external-cron-secret
```

#### Step 5: Test and Monitor
1. Deploy to Vercel
2. Test manually: `curl -X POST -H "X-Cron-Secret: your-secret" https://your-app.vercel.app/api/webhooks/process-queue`
3. Monitor cron-job.org dashboard for execution history

---

## Option 3: Self-Hosted Worker (Alternative)

Run the queue processor on a separate always-on server or serverless platform.

### Using Railway.app (Free Tier):

#### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository

#### Step 2: Create Worker Script
Create `worker/process-queue.js`:

```javascript
require('dotenv').config();
const { processSitemapQueue } = require('../scripts/process-sitemap-queue');

async function run() {
  console.log('Worker starting sitemap queue processing...');
  
  try {
    const result = await processSitemapQueue();
    console.log('Worker completed:', result);
    
    // Schedule next run in 5 minutes
    setTimeout(run, 5 * 60 * 1000);
  } catch (error) {
    console.error('Worker error:', error);
    // Retry after 1 minute on error
    setTimeout(run, 60 * 1000);
  }
}

// Start the worker
run();
```

#### Step 3: Configure Railway
Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node worker/process-queue.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### Step 4: Set Environment Variables in Railway
- `DATABASE_URL`: Your Supabase connection string
- `SITEMAP_WEBHOOK_URL`: `https://travelling-technicians.ca/api/webhooks/sitemap-regenerate`
- `NODE_ENV`: `production`

#### Step 5: Deploy and Monitor
1. Deploy on Railway
2. Check logs in Railway dashboard
3. Worker will run continuously, processing every 5 minutes

---

## Security Considerations

### 1. **Authentication**
- Always use secret tokens for cron job endpoints
- Never expose processing endpoints publicly without authentication
- Rotate secrets regularly

### 2. **Rate Limiting**
- Implement rate limiting on cron endpoints
- Use Vercel's built-in rate limiting or middleware

### 3. **Error Handling**
- Log all cron job executions
- Set up alerts for failed executions
- Implement retry logic with exponential backoff

### 4. **Monitoring**
- Track execution times and success rates
- Monitor queue size and processing backlog
- Set up alerts for abnormal patterns

---

## Testing Your Implementation

### Local Testing:
```bash
# Test the queue processor directly
node scripts/process-sitemap-queue.js

# Test the API endpoint locally
curl -X POST http://localhost:3000/api/webhooks/process-queue \
  -H "X-Cron-Secret: test-secret" \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

### Production Testing:
```bash
# Test with actual production URL
curl -X POST https://travelling-technicians.ca/api/webhooks/process-queue \
  -H "X-Cron-Secret: your-production-secret" \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

### Verify Database Updates:
```sql
-- Check queue status
SELECT * FROM sitemap_regeneration_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check processed items
SELECT * FROM sitemap_regeneration_queue 
WHERE status = 'completed' 
ORDER BY processed_at DESC 
LIMIT 10;
```

---

## Troubleshooting

### Common Issues:

#### 1. **Cron Job Not Executing**
- Check Vercel plan (cron jobs require Pro/Enterprise)
- Verify `vercel.json` configuration
- Check deployment logs for errors

#### 2. **Authentication Failures**
- Verify `CRON_SECRET` environment variable matches
- Check request headers
- Test with curl to verify

#### 3. **Database Connection Issues**
- Verify Supabase connection string
- Check network connectivity from Vercel to Supabase
- Monitor Supabase dashboard for connection limits

#### 4. **Queue Not Processing**
- Check if triggers are firing correctly
- Verify queue table has entries
- Check processor logs for errors

#### 5. **Performance Issues**
- Monitor execution time (should be < 10 seconds)
- Check for long-running database queries
- Consider batching if queue grows large

---

## Recommended Approach

For travelling-technicians.ca, I recommend:

### **Short-term**: Option 2 (External Cron Service)
- Use **cron-job.org** free tier
- Quickest to implement
- No Vercel plan upgrade required
- Provides monitoring and alerting

### **Long-term**: Option 1 (Vercel Cron Jobs)
- Upgrade to Vercel Pro plan
- Most integrated solution
- Better performance and reliability
- Native Vercel monitoring

### Implementation Priority:
1. **Immediate**: Set up cron-job.org with basic endpoint
2. **Week 1**: Monitor and adjust schedule as needed
3. **Month 1**: Evaluate performance and consider upgrading to Vercel Pro

---

## Maintenance Checklist

### Daily:
- [ ] Check cron job execution logs
- [ ] Monitor queue processing success rate
- [ ] Verify sitemap cache invalidation

### Weekly:
- [ ] Review queue size and processing times
- [ ] Check for failed executions
- [ ] Rotate cron secrets if needed

### Monthly:
- [ ] Review overall system performance
- [ ] Update dependencies
- [ ] Backup queue processing configuration

---

## Support Resources

- **Vercel Cron Jobs Documentation**: https://vercel.com/docs/cron-jobs
- **cron-job.org Documentation**: https://cron-job.org/en/help/
- **Railway Documentation**: https://docs.railway.app/
- **Project Issue Tracking**: GitHub repository issues

---

## Emergency Procedures

### If Cron Jobs Stop Working:
1. **Immediate Action**: Run processor manually
   ```bash
   node scripts/process-sitemap-queue.js
   ```
2. **Diagnose**: Check external service status or Vercel dashboard
3. **Fallback**: Use alternative cron service as backup

### If Queue Backlog Grows:
1. **Increase Frequency**: Change schedule to every 2 minutes temporarily
2. **Manual Processing**: Run multiple instances manually
3. **Investigate**: Check for stuck database transactions

### If Security Breach Suspected:
1. **Rotate Secrets**: Immediately change all cron secrets
2. **Disable Endpoints**: Temporarily disable cron endpoints
3. **Audit Logs**: Review access logs for unauthorized requests

---

*Document last updated: January 2026*  
*For questions or updates, contact: ops@travelling-technicians.ca*