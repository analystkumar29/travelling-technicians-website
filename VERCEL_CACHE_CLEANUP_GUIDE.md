# Vercel Cache Cleanup Guide for Travelling Technicians

## 🚨 Problem: Email links still using `url6811.travelling-technicians.ca`

The debug endpoint shows `"hasUrl6811": true`, meaning there's still an environment variable containing `url6811` in Vercel's production environment.

## 🔧 Safe Cleanup Procedure

### **Step 1: Check Current Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**: "travelling-technicians-website"
3. **Go to Settings** → **Environment Variables**
4. **Check ALL variables** for `url6811`:
   - Production environment
   - Preview environment  
   - Development environment

### **Step 2: Remove Problematic Variables**

**SAFETY FIRST**: Before deleting, **take screenshots** of all current environment variables.

1. **Delete ANY variable containing `url6811`**
2. **Verify these variables are set correctly**:
   ```
   NEXT_PUBLIC_WEBSITE_URL = https://www.travelling-technicians.ca
   NEXT_PUBLIC_FRONTEND_URL = https://www.travelling-technicians.ca
   NEXT_PUBLIC_SITE_URL = https://www.travelling-technicians.ca
   ```

### **Step 3: Clear Vercel Cache**

Vercel has multiple cache layers. Clear them all:

#### **A. Deployments Cache**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"Redeploy"** (three dots menu)
4. Select **"Clear Cache & Redeploy"**

#### **B. Edge Network Cache**
1. Go to **Settings** → **Domains**
2. For each domain (`www.travelling-technicians.ca`, `travelling-technicians.ca`):
   - Click the domain
   - Find **"Clear Cache"** option
   - Clear all edge cache

#### **C. Build Cache**
1. Go to **Settings** → **General**
2. Find **"Build & Development Settings"**
3. Enable **"Automatically clear build cache"**
4. Save changes

### **Step 4: Force Fresh Deployment**

```bash
# Create a dummy commit to trigger fresh build
git commit --allow-empty -m "Trigger fresh Vercel deployment"
git push
```

### **Step 5: Verify Cache is Cleared**

#### **Test 1: Check Environment Variables**
```bash
# Wait 5 minutes for deployment, then test:
curl "https://www.travelling-technicians.ca/api/debug/env-check"
```
Should show: `"hasUrl6811": false`

#### **Test 2: Check URL Generation**
```bash
curl "https://www.travelling-technicians.ca/api/debug/url-check"
```
Should show URLs using `https://www.travelling-technicians.ca`

#### **Test 3: Create Test Booking**
1. Make a real booking through the website
2. Check the email that arrives
3. Verify link: `https://www.travelling-technicians.ca/verify-booking?...`

## 🛡️ Safety Precautions

### **Before Deleting ANYTHING:**
1. **Take screenshots** of all environment variables
2. **Export variables** (Vercel has export option)
3. **Note down** any API keys or secrets

### **Critical Variables to PRESERVE:**
- `SENDGRID_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PASSWORD_HASH`
- `BOOKING_VERIFICATION_SECRET`
- `JWT_SECRET`

### **If Something Breaks:**
1. **Check deployment logs** in Vercel
2. **Use the debug endpoints** to diagnose
3. **Restore from screenshots** if needed

## 🔍 Debug Endpoints Available

### **1. Environment Variable Check**
```
https://www.travelling-technicians.ca/api/debug/env-check
```
Shows ALL environment variables containing `url6811`

### **2. URL Generation Check**
```
https://www.travelling-technicians.ca/api/debug/url-check
```
Shows what URLs are being generated

## 📋 Post-Cleanup Checklist

- [ ] No `url6811` variables in Vercel
- [ ] All URL variables use `https://www.travelling-technicians.ca`
- [ ] Fresh deployment completed
- [ ] Debug endpoints show correct URLs
- [ ] New booking emails have correct links
- [ ] Old emails still work (with redirect)

## ⚠️ Important Notes

1. **Existing emails cannot be fixed** - Already sent emails will still have `url6811` links
2. **Users must click through SSL warning** for old emails
3. **New emails should work correctly** after cleanup
4. **The redirect will still work** - `url6811` → `www.travelling-technicians.ca`

## 🆘 Emergency Recovery

If the site breaks after cleanup:

1. **Check deployment logs** in Vercel
2. **Use debug endpoints** to identify missing variables
3. **Restore variables** from screenshots
4. **Contact support** if needed: support@vercel.com

## ✅ Success Criteria

The cleanup is successful when:
1. `api/debug/env-check` shows `"hasUrl6811": false`
2. `api/debug/url-check` shows correct URLs
3. **NEW** booking emails have `https://www.travelling-technicians.ca` links
4. Site functions normally