# Location Debugging Guide

## Problem Statement
The location automatic filling in the booking form or homepage is not retrieving location properly.

## Solution Implemented
Enhanced debugging system added to all location-related components to help diagnose issues.

## Components Updated

### 1. `src/utils/locationUtils.ts`
- Added debug utilities: `debugLog`, `debugError`, `debugWarn`, `debugSuccess`
- Updated `getCurrentLocationPostalCode()` with detailed logging
- Updated `checkServiceArea()` with structured logging
- Added timestamps and component prefixes

### 2. `src/components/AddressAutocomplete.tsx`
- Added same debug utilities at top of file
- Updated `fetchSuggestions()` with detailed API logging
- Updated `handleSuggestionClick()` with structured logging
- Added component mount debugging

## How to Debug Location Issues

### Step 1: Open Browser Console
1. Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools
2. Go to the "Console" tab

### Step 2: Test Location Detection
1. Go to homepage (`/`)
2. Click "Use My Current Location" button
3. Look for logs starting with `[LOCATION_UTILS]`

**Expected logs:**
```
[HH:MM:SS] [LOCATION_UTILS] Starting getCurrentLocationPostalCode
[HH:MM:SS] [LOCATION_UTILS] ✅ Browser geolocation successful { latitude: ..., longitude: ... }
[HH:MM:SS] [LOCATION_UTILS] Calling OpenStreetMap API { url: ... }
[HH:MM:SS] [LOCATION_UTILS] ✅ Successfully got postal code from OpenStreetMap { postalCode: "V5C 6R9" }
```

### Step 3: Test Address Autocomplete
1. Go to booking form
2. Start typing an address (e.g., "123 Main St")
3. Look for logs starting with `[ADDRESS_AUTOCOMPLETE]`

**Expected logs:**
```
[HH:MM:SS] [ADDRESS_AUTOCOMPLETE] Component mounted { hasApiKey: true, ... }
[HH:MM:SS] [ADDRESS_AUTOCOMPLETE] Fetching suggestions for input: { input: "123 Main", ... }
[HH:MM:SS] [ADDRESS_AUTOCOMPLETE] ✅ OpenStreetMap returned suggestions: { count: 3, ... }
```

### Step 4: Test Postal Code Validation
1. Enter a postal code (e.g., "V5C 6R9")
2. Look for logs from `checkServiceArea()`

**Expected logs:**
```
[HH:MM:SS] [LOCATION_UTILS] Checking service area for postal code: { postalCode: "V5C 6R9" }
[HH:MM:SS] [LOCATION_UTILS] ✅ Found match for 3-character FSA: { prefix: "V5C", result: {...} }
```

## Common Issues and Solutions

### Issue 1: "Geolocation is not supported by browser"
**Cause:** Browser doesn't support geolocation or permission denied
**Solution:**
- Check browser permissions (Settings > Privacy > Location)
- Try in a different browser
- Use manual address entry

### Issue 2: "OpenStreetMap API error"
**Cause:** Network issue or API rate limiting
**Solution:**
- Check internet connection
- Wait a few minutes and try again
- Use manual postal code entry

### Issue 3: "No postal code found in OpenStreetMap response"
**Cause:** Location doesn't have postal code in OpenStreetMap database
**Solution:**
- System falls back to rough location approximation
- Enter postal code manually

### Issue 4: "No service area match found"
**Cause:** Postal code not in our service area map
**Solution:**
- Check if postal code is in `POSTAL_CODE_MAP` in `locationUtils.ts`
- Add new postal code prefixes to the map

## Debug Features

### 1. Timestamped Logs
All logs include `[HH:MM:SS]` format for timing analysis

### 2. Component Prefixes
- `[LOCATION_UTILS]` - Core location utilities
- `[ADDRESS_AUTOCOMPLETE]` - Address input component
- `[POSTAL_CHECKER]` - Postal code validation component

### 3. Color-Coded Emojis
- ✅ Success - Green checkmark
- ⚠️ Warning - Yellow warning sign  
- ❌ Error - Red X

### 4. Structured Data
All logs include structured JSON objects with relevant data

## Testing Script
Run `node test-debugging.js` to see example debug output.

## Next Steps for Troubleshooting

If location still doesn't work after checking logs:

1. **Check Browser Permissions:** Ensure location access is allowed
2. **Test Different Postal Codes:** Try known working codes like "V5C 6R9"
3. **Check Network Requests:** Look for failed API calls in Network tab
4. **Verify Service Area Map:** Ensure postal code is in `POSTAL_CODE_MAP`
5. **Test on Different Devices:** Try mobile vs desktop

## Files Modified
- `src/utils/locationUtils.ts` - Enhanced debugging
- `src/components/AddressAutocomplete.tsx` - Enhanced debugging
- `test-debugging.js` - Example debug output
- `LOCATION_DEBUGGING_GUIDE.md` - This guide

The debugging system will now provide clear, actionable information about what's happening with location detection and why it might be failing.