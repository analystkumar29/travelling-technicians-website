# PHASE 5: Deployment & Rollout - Admin Panel is_active Management

## 📋 Deployment Checklist

---

## 5.1 Staging Deployment (Pre-Production Testing)

### Step 1: Database Migration
```bash
# 1. Create migration files (COMPLETED)
✅ supabase/migrations/20260305000000_create_is_active_indexes.sql

# 2. Apply migration to staging database
# Option A: Via Supabase Dashboard
- Navigate to SQL Editor
- Copy migration SQL
- Execute in staging environment

# Option B: Via CLI
supabase db push --db-url $STAGING_DB_URL

# 3. Verify indexes created
SELECT * FROM pg_indexes 
WHERE indexname LIKE 'idx_dynamic_pricing%';
```

### Step 2: Backend API Deployment
```bash
# 1. Files Modified/Created
✅ src/pages/api/management/dynamic-pricing.ts (PATCH endpoint updated)
✅ src/pages/api/management/bulk-status.ts (NEW endpoint)

# 2. Staging Deployment Steps
- Commit changes: git add . && git commit -m "feat: add is_active management endpoints"
- Push to staging branch: git push origin staging
- Vercel/deployment automatically triggers
- Monitor deployment logs for errors

# 3. Verify API Endpoints
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://staging.website.com/api/management/dynamic-pricing?limit=1

curl -X POST https://staging.website.com/api/management/bulk-status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["test-id"], "is_active": false}'
```

### Step 3: Frontend UI Deployment
```bash
# 1. File Modified
✅ src/pages/management/pricing.tsx (UI enhancements)

# 2. Build & Test
npm run build
npm run dev

# 3. Staging Deploy
- Changes auto-deployed via Vercel when merged to staging
- Verify /management/pricing loads without errors
- Test filter dropdown appears
- Test toggle buttons render correctly
```

### Step 4: Smoke Testing in Staging
```bash
# 1. Admin Panel Accessibility
✅ Can access /management/pricing
✅ Can log in with admin credentials
✅ Data loads from API
✅ No console errors

# 2. Basic Functionality
✅ Status filter dropdown appears
✅ Single toggle button works (deactivate one record)
✅ Bulk checkboxes appear
✅ Bulk action buttons visible

# 3. Database Integration
✅ PATCH request updates is_active
✅ POST request to bulk-status works
✅ Database trigger fires (route is_active updates)
✅ Filter refreshes after status change
```

### Step 5: Full Regression Testing in Staging
See: [PHASE4_TESTING_ACTIVE_STATUS.md](./PHASE4_TESTING_ACTIVE_STATUS.md)

---

## 5.2 Production Deployment

### Pre-Deployment Checklist
```
⏳ Code review approved
⏳ All tests passing
⏳ Staging testing completed
⏳ Rollback plan documented
⏳ Team notified of deployment
⏳ Monitoring alerts configured
⏳ Database backup taken
```

### Step 1: Database Migration (Production)
```bash
# 1. Backup Production Database
# Contact Supabase support or use automated backup

# 2. Apply Migration
# Option A: Via Supabase Dashboard
- Navigate to SQL Editor in production project
- Copy migration SQL
- Execute carefully (creates non-blocking indexes)

# Option B: Via CLI
supabase db push --db-url $PRODUCTION_DB_URL

# 3. Verify Migration Success
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE indexname LIKE 'idx_dynamic_pricing%';
-- Should return 3 or 4 indexes

# 4. Check Performance
EXPLAIN ANALYZE 
SELECT * FROM dynamic_pricing 
WHERE is_active = true 
LIMIT 10;
-- Should use index scan
```

### Step 2: API Deployment (Production)
```bash
# 1. Merge to main branch
git checkout main
git pull origin main
git merge staging

# 2. Tag release
git tag -a v3.4.0 -m "feat: add is_active management"
git push origin main --tags

# 3. Vercel Auto-Deployment
- Vercel automatically deploys on main branch push
- Monitor deployment progress in Vercel dashboard
- Check build logs for errors

# 4. Endpoint Health Check
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://www.website.com/api/management/dynamic-pricing?limit=1
# Should return 200 with pricing data
```

### Step 3: Frontend Deployment (Production)
```bash
# 1. Verify Build
npm run build
# Should complete without errors

# 2. Monitor Vercel Deployment
- Check Vercel dashboard for build status
- Wait for "Ready" status on all regions
- Verify deployment URL works

# 3. Test Admin Panel
- Visit https://www.website.com/management/pricing
- Verify UI renders correctly
- Check for any 404 or 500 errors
```

### Step 4: Production Smoke Test
```bash
# 1. Admin Access
✅ Can log in to admin panel
✅ /management/pricing loads
✅ Data displays without errors

# 2. Feature Functionality
✅ Status filter works
✅ Single pricing deactivation works
✅ Bulk operation works
✅ Database updates correctly

# 3. Frontend Integration
✅ Booking form respects is_active flag
✅ Deactivated services don't appear
✅ Routes return 404 for inactive entries

# 4. Monitoring
✅ Error logs show no critical errors
✅ API response times normal (< 500ms)
✅ Database performance healthy
```

---

## 5.3 Monitoring & Rollback

### Monitoring Setup
```bash
# 1. Error Tracking
- Monitor Sentry/error logs for API errors
- Watch for 400/500 responses from endpoints
- Check database slow query logs

# 2. Performance Metrics
- API response time: should be < 500ms
- Database query time: should be < 200ms
- Bulk operations: < 2s for 100 records

# 3. User Impact
- Monitor admin panel usage
- Check if users report issues
- Verify booking form functionality
```

### Rollback Plan (If Issues)

**Scenario: API errors after deployment**
```bash
# 1. Quick Rollback (Last 30 minutes)
- Go to Vercel Dashboard
- Select the deployment
- Click "Rollback to Previous"
- Wait for deployment complete

# 2. Manual Rollback
git revert HEAD
git push origin main
# Vercel auto-deploys the previous version

# 3. Database Rollback (If Migration Failed)
- Contact Supabase support
- Restore from backup
- Re-run migration after code fix
```

**Scenario: Database performance degradation**
```bash
# 1. Check Index Health
SELECT * FROM pg_stat_user_indexes 
WHERE indexrelname LIKE 'idx_dynamic_pricing%';

# 2. Drop problematic index
DROP INDEX IF EXISTS idx_dynamic_pricing_is_active;

# 3. Rebuild index
CREATE INDEX idx_dynamic_pricing_is_active 
ON dynamic_pricing(is_active);

# 4. Monitor query performance
EXPLAIN ANALYZE SELECT * FROM dynamic_pricing WHERE is_active = true;
```

**Scenario: Bulk operations causing timeouts**
```bash
# 1. Check active connections
SELECT pid, usename, query FROM pg_stat_activity 
WHERE query LIKE '%dynamic_pricing%';

# 2. Limit bulk operation size (in code)
- Max records per request: 100 (already implemented)
- Add rate limiting: 1 request per 5 seconds

# 3. Monitor bulk operation queue
SELECT COUNT(*) FROM pg_stat_statements 
WHERE query LIKE '%bulk-status%';
```

---

## 5.4 Post-Deployment Verification

### Checklist
```
✅ All APIs responding correctly
✅ Admin panel fully functional
✅ Booking form excludes inactive items
✅ Routes return 404 for inactive
✅ Sitemap excludes inactive routes
✅ No error logs in past 1 hour
✅ Performance metrics within normal range
✅ Users not reporting issues
```

### Success Criteria
```
Performance:
✅ API response time: < 500ms (average)
✅ Filter load time: < 200ms
✅ Bulk update: < 2s for 100 records

Functionality:
✅ All test cases passing
✅ No breaking changes
✅ Backward compatible

User Experience:
✅ Admin can toggle pricing status
✅ Bulk operations work smoothly
✅ Filters responsive and accurate
✅ Frontend reflects changes immediately

Data Integrity:
✅ Routes auto-deactivate via trigger
✅ No orphaned records
✅ Sitemap stays fresh
```

---

## 📊 Deployment Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Database Migration (Staging) | 5-10 min | ⏳ |
| API Deployment (Staging) | 3-5 min | ⏳ |
| UI Deployment (Staging) | 3-5 min | ⏳ |
| Smoke Testing (Staging) | 15-30 min | ⏳ |
| Full Testing (Staging) | 1-2 hours | ⏳ |
| Code Review | 30 min - 2 hours | ⏳ |
| Database Migration (Production) | 5-10 min | ⏳ |
| API Deployment (Production) | 3-5 min | ⏳ |
| UI Deployment (Production) | 3-5 min | ⏳ |
| Smoke Testing (Production) | 15-30 min | ⏳ |
| **Total Estimated Time** | **4-6 hours** | |

---

## 🚨 Risk Mitigation

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Database index performance | Low | High | Pre-test indexes in staging |
| Bulk operation timeout | Medium | Medium | Set 100-record limit, rate limiting |
| Trigger execution failure | Low | High | Test trigger in staging |
| Stale data in filters | Low | Medium | Reload data after update |
| Booking form broken links | Low | High | Test all service combos |

### Contingency Plans

```
If Database Migration Fails:
1. Rollback to previous migration
2. Investigate error in staging
3. Fix and re-test before retry

If API Endpoints Error:
1. Check API logs in Vercel
2. Verify database connection
3. Rollback code if needed
4. Redeploy after fix

If Performance Degrades:
1. Check index usage
2. Monitor slow queries
3. Optimize queries if needed
4. Scale database if necessary

If Users Report Issues:
1. Document issue with steps to reproduce
2. Check error logs for specific error
3. Create hotfix branch
4. Test fix in staging
5. Deploy hotfix
```

---

## 📝 Deployment Sign-Off

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Staging deployment successful
- [ ] Team notified
- [ ] Rollback plan documented

### Post-Deployment
- [ ] Production monitoring active
- [ ] All smoke tests passing
- [ ] Users notified if necessary
- [ ] Documentation updated
- [ ] Performance metrics normal

---

## 📚 Related Documentation

- [Implementation Plan](./ADMIN_PANEL_IS_ACTIVE_IMPLEMENTATION_PLAN.md)
- [Testing Guide](./PHASE4_TESTING_ACTIVE_STATUS.md)
- [API Documentation](../src/pages/api/management/)
- [Database Schema](../supabase/migrations/)

---

## ✅ Deployment Complete Checklist

```
Ready for Staging?
⏳ Phase 1 (API) complete
⏳ Phase 2 (UI) complete
⏳ Phase 3 (Database) complete
⏳ Phase 4 (Testing) complete

Ready for Production?
⏳ Staging tests passed
⏳ Code review approved
⏳ No critical issues found
⏳ Monitoring configured
⏳ Rollback plan ready
```
