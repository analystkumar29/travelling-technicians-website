# Diagnostic Logging Guide for quoted_price Issue

## What We've Added

Enhanced logging has been added to track `quoted_price` through the entire form flow:

### 1. **useEffect Hook Logging** (Line ~175)
When pricing data is received, you should see:
```
🔍 [useEffect] pricingData changed: { pricingData: {...}, final_price: 309, isDefined: true }
💰 [useEffect] Setting quoted_price from pricingData: { final_price: 309 }
📝 [useEffect] Calling methods.setValue with quoted_price: 309
✅ [useEffect] quoted_price after setValue: { quoted_price: 309, allFormValues: {...}, hasQuotedPrice: true }
```

### 2. **handleFinalSubmit Logging** (Line ~232)
When you submit the form, you should see:
```
📤 [handleFinalSubmit] Starting final submission...
📋 [handleFinalSubmit] Raw form values: { quoted_price: 309, quotedPriceState: 309, hasFormQuotedPrice: true, allKeys: [...] }
✅ [handleFinalSubmit] Processed booking data before submission: { ..., quoted_price: 309, hasQuotedPrice: true }
🎯 [handleFinalSubmit] Final data to be sent to API: { ..., quoted_price: 309, ... }
```

## How to Check the Logs

### In Browser Console:
1. **Open DevTools**: Press `F12` or `Cmd+Option+I` (Mac)
2. **Go to Console tab**
3. **Perform a booking (select device/service/tier/etc)**
4. **Look for the emoji logs** above (💰, ✅, 📤, 🎯, etc)

### What Each Log Tells Us:

| Log | What It Means |
|-----|---------------|
| 🔍 pricingData changed | Price API returned data |
| ❌ pricingData is not ready | Price calculation hasn't completed yet |
| 💰 Setting quoted_price | Found final_price in pricing data |
| 📝 Calling methods.setValue | Registering field with react-hook-form |
| ✅ quoted_price after setValue | Verified field is registered |
| 📤 Starting final submission | User clicked Submit button |
| 📋 Raw form values | Shows form state before processing |
| ✅ Processed booking data | Shows data being sent to API |
| 🎯 Final data to be sent | Exact data going to API endpoint |

## Debugging Checklist

### Step 1: Does useEffect run?
- Select a device/brand/model/service
- Check console for 🔍 log
- **If you see it**: ✅ Pricing data is being received
- **If you don't see it**: ❌ Pricing calculation failed

### Step 2: Does quoted_price get set?
- After Step 1, look for 💰 and ✅ logs
- Check the value shown in 💰 log
- **If value is 309 or similar**: ✅ Price was captured
- **If value is undefined**: ❌ Issue with pricingData

### Step 3: Does the form receive the value?
- Look for ✅ log showing `hasQuotedPrice: true`
- **If true**: ✅ Form field is registered
- **If false**: ❌ react-hook-form not registering field

### Step 4: Is it sent to API?
- Click Submit button
- Look for 📤, 📋, ✅, and 🎯 logs
- Check if `quoted_price: 309` appears in 🎯 log
- **If yes**: ✅ Data being sent correctly
- **If no**: ❌ Data is being lost somewhere

### Step 5: Check API response
- Look at Network tab in DevTools
- Find POST request to `/api/bookings/create`
- Check Request body for `quoted_price` field
- **If present**: ✅ API received it
- **If missing**: ❌ Lost during transmission

## Common Issues and Solutions

### Issue 1: 🔍 log never appears
**Possible causes:**
- Device/brand/model not selected
- Pricing API not responding
- Service IDs not being populated

**Solution:**
- Ensure all required fields are selected before pricing calculation starts
- Check Network tab for `/api/pricing/calculate` request
- Verify it's returning a 304 (not modified) or 200 status

### Issue 2: 💰 log shows undefined final_price
**Possible causes:**
- pricingData object doesn't have final_price property
- API returned error or empty response

**Solution:**
- Check what pricingData object contains in 🔍 log
- Compare with expected structure from pricing API response

### Issue 3: ✅ log shows hasQuotedPrice: false
**Possible causes:**
- methods.setValue() not working
- react-hook-form not initialized
- Field name mismatch

**Solution:**
- Verify 'quoted_price' field name in form registration
- Check if form.watch() shows the field
- Try using form.getValues('quoted_price') in console

### Issue 4: 🎯 log shows quoted_price: undefined in final data
**Possible causes:**
- quotedPrice state is undefined
- quotedPriceState variable lost between render and submission
- useEffect never ran

**Solution:**
- Check if 💰 log was printed before submission
- Verify timing: did you select pricing options before submitting?
- Check if page reloaded, losing state

## Manual Test Steps

1. **Clear browser cache** (DevTools → Application → Clear Site Data)
2. **Hard refresh** the page (Cmd+Shift+R or Ctrl+Shift+R)
3. **Open DevTools Console** before interacting with form
4. **Select Mobile phone, any brand (e.g., Apple)**
5. **Select a model (e.g., iPhone 16 Pro Max)**
6. **Select a service (e.g., Screen Replacement)**
7. **Wait 2 seconds** for pricing to load
8. **Look for 🔍 and 💰 logs** in console
9. **Complete rest of form**
10. **Click Submit**
11. **Look for 📤, 📋, ✅, 🎯 logs** in console
12. **Check Network tab** for POST request with quoted_price

## Next Steps

Once you've run through the diagnostic checklist:

1. **Take a screenshot** of the console showing the logs
2. **Note any missing logs** - which emoji logs appear and which don't?
3. **Check Network tab** - is quoted_price in the request body?
4. **Report findings** - this will help pinpoint exactly where the issue is

## If Issue Persists

If quoted_price is still not being saved after these diagnostics:
- The issue is likely in the form field registration
- We may need to explicitly register the field
- Or we may need to handle it separately from react-hook-form

**Save the console output** and we can analyze it together!
