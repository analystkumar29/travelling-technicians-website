# PHASE 4: Testing - Admin Panel is_active Management

## 📋 Testing Checklist

### 4.1 Manual Testing - Individual Toggle

**Test Case 1.1: Deactivate Single Pricing Record**
```
Steps:
1. Navigate to /management/pricing
2. Find an ACTIVE pricing record (green "Active" badge)
3. Click the "Deactivate" button in Actions column
4. Confirm the confirmation dialog
5. Wait for success message

Expected Results:
✅ Success message appears: "Pricing deactivated successfully"
✅ Page reloads and record still visible
✅ Status badge changes to red "Inactive"
✅ "Deactivate" button changes to "Activate"
✅ Record disappears when "Active Only" filter applied
```

**Test Case 1.2: Activate Single Pricing Record**
```
Steps:
1. Find an INACTIVE pricing record (red "Inactive" badge)
2. Click the "Activate" button in Actions column
3. Confirm the confirmation dialog
4. Wait for success message

Expected Results:
✅ Success message appears: "Pricing activated successfully"
✅ Status badge changes to green "Active"
✅ "Activate" button changes to "Deactivate"
✅ Record disappears when "Inactive Only" filter applied
```

---

### 4.2 Manual Testing - Filter Functionality

**Test Case 2.1: Filter by Active Status**
```
Steps:
1. Navigate to pricing table
2. Apply "Active Only" filter from Status dropdown
3. Verify results
4. Change to "Inactive Only"
5. Verify results
6. Change to "All Status"

Expected Results:
✅ "Active Only" shows only green badges
✅ "Inactive Only" shows only red badges
✅ "All Status" shows all records
✅ Record count updates correctly
✅ Pagination works with filters applied
```

**Test Case 2.2: Combined Filters**
```
Steps:
1. Select Device Type = "Mobile"
2. Select Brand = "Apple"
3. Select Status = "Active Only"
4. Verify results

Expected Results:
✅ Only Apple Mobile devices shown
✅ Only active records visible
✅ Record count reflects combined filters
✅ "Clear Filters" button resets all to "All"
```

---

### 4.3 Manual Testing - Bulk Operations

**Test Case 3.1: Bulk Deactivate Multiple Records**
```
Steps:
1. In pricing table, check 3 records' checkboxes
2. Verify "3 pricing record(s) selected" message appears
3. Click "Deactivate Selected" button
4. Confirm dialog
5. Wait for success message

Expected Results:
✅ Blue selection bar appears with count and buttons
✅ "3 pricing record(s) deactivated successfully" message
✅ All 3 records now show red "Inactive" badge
✅ Selection clears automatically
✅ Blue selection bar disappears
```

**Test Case 3.2: Bulk Activate Multiple Records**
```
Steps:
1. Filter by "Inactive Only"
2. Select 5 inactive records
3. Click "Activate Selected"
4. Confirm dialog

Expected Results:
✅ "5 pricing record(s) activated successfully" message
✅ All 5 records change to green "Active" badge
✅ Records disappear from "Inactive Only" filter
✅ Reappear when filter changed to "Active Only"
```

**Test Case 3.3: Select/Deselect All with Header Checkbox**
```
Steps:
1. Click header checkbox to select all on current page
2. Verify all visible rows are checked
3. Click header checkbox again to deselect all
4. Verify all checkboxes cleared

Expected Results:
✅ Header checkbox toggles all visible records
✅ Counter updates to show total selected
✅ "Select/Deselect All" works across pages
✅ Clear Selection button works
```

---

### 4.4 Manual Testing - Database Trigger

**Test Case 4.1: Verify Route Deactivation on Pricing Deactivation**
```
Database Check:
1. Deactivate a pricing record in admin panel
2. Run query:
   SELECT id, is_active FROM dynamic_routes 
   WHERE route LIKE '%[pricing-id]%' 
   LIMIT 1;

Expected Results:
✅ Corresponding dynamic_route has is_active = false
✅ Trigger fired automatically (check database logs)
```

**Test Case 4.2: Verify Frontend Behavior with Deactivated Routes**
```
Frontend Check:
1. Deactivate an iPhone 16 Screen Replacement pricing
2. Visit booking form at /book
3. Filter by:
   - Device Type: Mobile
   - Brand: Apple
   - Model: iPhone 16
   - Service: Screen Replacement

Expected Results:
✅ This service NO LONGER appears in booking form options
✅ No broken references in the form
✅ Other active services still visible
```

**Test Case 4.3: Verify Sitemap Excludes Inactive Routes**
```
Sitemap Check:
1. Deactivate several pricing records (5+)
2. Visit /sitemap.xml
3. Search for deactivated route slugs

Expected Results:
✅ Deactivated routes NOT in sitemap
✅ Active routes still present
✅ Sitemap validates (no broken links)
✅ SEO crawlers won't index deactivated pages
```

---

### 4.5 Performance Testing

**Test Case 5.1: Bulk Update Performance**
```
Steps:
1. In pricing table, select 50+ records
2. Click "Deactivate Selected"
3. Measure response time
4. Check database logs for trigger execution

Expected Results:
✅ Request completes in < 2 seconds
✅ Success message appears
✅ All records updated correctly
✅ No timeout errors
✅ Database trigger executes for bulk operations
```

**Test Case 5.2: Filter Performance**
```
Steps:
1. Apply Status filter = "Active Only"
2. Measure page load time
3. Apply additional filters

Expected Results:
✅ Filter loads in < 500ms
✅ Index is_active query is optimized
✅ No lag when changing filters
✅ Pagination renders smoothly
```

---

## ✅ Testing Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Deactivate Single | ⏳ Pending | |
| 1.2 Activate Single | ⏳ Pending | |
| 2.1 Filter by Status | ⏳ Pending | |
| 2.2 Combined Filters | ⏳ Pending | |
| 3.1 Bulk Deactivate | ⏳ Pending | |
| 3.2 Bulk Activate | ⏳ Pending | |
| 3.3 Select All | ⏳ Pending | |
| 4.1 Route Deactivation | ⏳ Pending | |
| 4.2 Frontend Booking Form | ⏳ Pending | |
| 4.3 Sitemap Exclusion | ⏳ Pending | |
| 5.1 Bulk Performance | ⏳ Pending | |
| 5.2 Filter Performance | ⏳ Pending | |

---

## 🐛 Known Issues & Fixes

(To be filled after testing)

---

## 📝 Sign-Off

- **Tested By**: [Your Name]
- **Date**: YYYY-MM-DD
- **Status**: ⏳ PENDING / ✅ PASSED / ❌ FAILED

---

## 📚 Related Documentation

- [Admin Panel Implementation](./ADMIN_PANEL_IS_ACTIVE_IMPLEMENTATION_PLAN.md)
- [API Endpoints](../src/pages/api/management/)
- [Database Schema](../supabase/migrations/)
