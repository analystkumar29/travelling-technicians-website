# Route Conflict Diagnosis - getStaticPaths Not Called

## Problem Summary
The `getStaticPaths` function in `src/pages/repair/[[...slug]].tsx` was NOT being called during build, preventing the generation of 3,224 database-driven repair pages.

## Root Cause: Route Priority Conflict

### Files Found in `/src/pages/repair/`:
```
[[...slug]].tsx                          ← Catch-all route (LOWEST priority)
burnaby.tsx                              ← Static route (HIGHEST priority)  
chilliwack.tsx                           ← Static route
coquitlam.tsx                            ← Static route
index.backup.tsx                         ← Static route
new-westminster.tsx                      ← Static route
north-vancouver.tsx                      ← Static route
richmond.tsx                             ← Static route
vancouver.tsx                            ← Static route
west-vancouver.tsx                       ← Static route
[city]/[service]/index.tsx.archive       ← Archived (doesn't affect routing)
```

### Next.js Route Priority Rules

Next.js evaluates routes in this order:
1. **Static routes** (e.g., `/repair/vancouver.tsx`) - **HIGHEST PRIORITY**
2. **Dynamic routes** (e.g., `/repair/[city].tsx`)
3. **Catch-all routes** (e.g., `/repair/[[...slug]].tsx`) - **LOWEST PRIORITY**

### Why getStaticPaths Wasn't Called

Because **static files exist** for cities like `burnaby.tsx`, `vancouver.tsx`, etc., Next.js:
1. Routes `/repair/burnaby` → `burnaby.tsx` (static file wins)
2. Routes `/repair/vancouver` → `vancouver.tsx` (static file wins)
3. **Never considers** the catch-all route for these paths
4. **Never calls** `getStaticPaths` because it thinks all routes are handled

## Evidence from Build Logs

### What We Expected:
```
🔥🔥🔥 getStaticPaths CALLED - ENTRY POINT
🔧 Attempting to get Supabase client...
✅ Supabase client obtained successfully
🚀 Starting pagination-based route generation...
📊 Total routes in database: 3224
```

### What Actually Happened:
**Complete silence** - zero console logs from `getStaticPaths`, proving it was never executed.

### Build Statistics:
- **Total pages generated**: 59
- **Expected pages**: ~3,320
- **Missing pages**: 3,261 (98.2% of content)

## Solution

Archive or delete the static city files to allow the catch-all route to handle all paths:

```bash
# Archive static city files
mv src/pages/repair/burnaby.tsx src/pages/repair/burnaby.tsx.archive
mv src/pages/repair/chilliwack.tsx src/pages/repair/chilliwack.tsx.archive
mv src/pages/repair/coquitlam.tsx src/pages/repair/coquitlam.tsx.archive
mv src/pages/repair/new-westminster.tsx src/pages/repair/new-westminster.tsx.archive
mv src/pages/repair/north-vancouver.tsx src/pages/repair/north-vancouver.tsx.archive
mv src/pages/repair/richmond.tsx src/pages/repair/richmond.tsx.archive
mv src/pages/repair/vancouver.tsx src/pages/repair/vancouver.tsx.archive
mv src/pages/repair/west-vancouver.tsx src/pages/repair/west-vancouver.tsx.archive
mv src/pages/repair/index.backup.tsx src/pages/repair/index.backup.tsx.archive
```

After archiving these files, the catch-all route will be the only option, forcing Next.js to call `getStaticPaths` and generate all 3,224 pages.

## Why This Happened

The static city files were likely created during initial development before the database-driven routing system was implemented. They represent the "old way" of doing things and are now blocking the new dynamic system.

## Expected Result After Fix

Once static files are archived:
1. Next.js will recognize `[[...slug]].tsx` as the only handler
2. `getStaticPaths` will be called at build time
3. All 3,224 routes will be fetched from database
4. Pages will be pre-rendered successfully
5. Build logs will show pagination progress

## Verification

After deploying the fix, confirm success by checking for these logs:
```
🔥🔥🔥 getStaticPaths CALLED - ENTRY POINT
✅ Supabase client obtained successfully
📦 Fetching batch 1/4 (rows 0-999)...
✓ Batch 1: Added 1000 routes (total: 1000)
...
🎉 Generated 3225 pre-rendered paths (100.0% coverage) in X.XXs
```

And final page count:
```
Generating static pages (0/3320) ...
✓ Generating static pages (3320/3320)
```
