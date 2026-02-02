# Shadowing Analysis - Why getStaticPaths Isn't Being Called

## Investigation Results

**Files Found in `/src/pages/repair/`:**
```
[[...slug]].tsx                    ← Catch-all route (should handle everything)
[city]/                            ← Dynamic route folder
[city]/[service]/                  ← Nested dynamic route folder
[city]/[service]/index.tsx.archive ← Archived file
burnaby.tsx.archive                ← Archived static city files
chilliwack.tsx.archive
coquitlam.tsx.archive
index.backup.tsx.archive
new-westminster.tsx.archive
north-vancouver.tsx.archive
richmond.tsx.archive
vancouver.tsx.archive
west-vancouver.tsx.archive
```

**No Shadowing Files Found:**
- ✅ NO `src/pages/repair.tsx` (root level file)
- ✅ NO `src/pages/repair/index.tsx` (would take precedence for `/repair`)
- ✅ NO `.js` or `.jsx` shadow files
- ✅ All static city files archived (`.archive`)

## The Smoking Gun: `[city]/[service]/` Folders

**Problem:** The existence of `[city]/[service]/` dynamic route folders creates a **hierarchy conflict**:

```
src/pages/repair/
├── [[...slug]].tsx              ← Catch-all (LOWEST priority)
├── [city]/                      ← Dynamic route (HIGHER priority)
│   └── [service]/               ← Nested dynamic route (HIGHER priority)
│       └── index.tsx.archive    ← Archived but folder structure remains
```

## Next.js Route Priority Rules

1. **Exact match** (`/repair/burnaby.tsx`) - HIGHEST
2. **Dynamic routes** (`/repair/[city].tsx`) 
3. **Nested dynamic routes** (`/repair/[city]/[service]/index.tsx`)
4. **Catch-all routes** (`/repair/[[...slug]].tsx`) - LOWEST

## Why getStaticPaths Isn't Called

Because `[city]/[service]/` folders exist, Next.js:
1. **Routes `/repair/vancouver/screen-repair`** → `[city]/[service]/` folder
2. **Routes `/repair/burnaby/battery-replacement`** → `[city]/[service]/` folder  
3. **Never considers** the catch-all route for these paths
4. **Never calls** `getStaticPaths` because it thinks routes are handled

## Evidence

**Build logs show:**
- File-level log `🔍 [[...slug]].tsx FILE LOADED - TOP OF FILE` **never appears**
- `getStaticPaths` debug logs **never appear**
- Only 50 pages generated (down from 59 after archiving static files)
- Route table shows only `/repair` (root) for catch-all

**Timing analysis:**
- Collecting page data: 04:39:50.965
- Generating pages: 04:39:53.653
- Gap: 2.7 seconds (not enough for Supabase queries)

## Solution

**Archive or remove the `[city]/[service]/` folder structure:**

```bash
# Archive the nested dynamic route folders
mv src/pages/repair/[city]/[service]/ src/pages/repair/[city]/[service].archive/
```

**Or delete them completely:**
```bash
rm -rf src/pages/repair/[city]/[service]/
```

## Why This Happened

The `[city]/[service]/` folder structure was likely created during the previous ISR implementation. Even though `index.tsx` is archived, the **folder structure itself** still tells Next.js "this is a valid route pattern."

## Expected Result After Fix

Once `[city]/[service]/` folders are removed:
1. Next.js will have **no other route handlers** for `/repair/*`
2. Catch-all route `[[...slug]].tsx` will be the **only option**
3. `getStaticPaths` will be called at build time
4. All 3,224 routes will be fetched from database
5. File-level logs will appear in build output

## Verification

After deploying the fix, confirm success by checking for:
```
🔍 [[...slug]].tsx FILE LOADED - TOP OF FILE
🔥🔥🔥 getStaticPaths CALLED - ENTRY POINT
✅ Supabase client obtained successfully
📦 Fetching batch 1/4 (rows 0-999)...
...
🎉 Generated 3225 pre-rendered paths (100.0% coverage) in X.XXs
```

And final page count:
```
Generating static pages (0/3320) ...
✓ Generating static pages (3320/3320)
```
