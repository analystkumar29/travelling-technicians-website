# Fixing Authentication Redirect Build Errors

This document explains how to fix the build error related to the Supabase client configuration and authentication redirects.

## Error Description

The error occurs during build with the following message:

```
Type error: Object literal may only specify known properties, and 'redirectTo' does not exist in type '{ autoRefreshToken?: boolean | undefined; storageKey?: string | undefined; persistSession?: boolean | undefined; detectSessionInUrl?: boolean | undefined; storage?: SupportedStorage | undefined; flowType?: AuthFlowType | undefined; debug?: boolean | ... 1 more ... | undefined; lock?: LockFunc | undefined; }'.
```

This happens because the `redirectTo` property is being used directly in the auth configuration object, but it should be set differently depending on your Supabase JS client version.

## Solution

The solution has 3 parts:

1. Fix the Supabase client configuration in `src/utils/supabaseClient.ts`
2. Set up the correct environment variables
3. Make sure you have a callback page at `/auth/callback`

### Step 1: Update Supabase Client Configuration

Replace the current Supabase client initialization with:

```typescript
// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    cookieOptions: {
      domain: undefined,
      path: '/',
      sameSite: 'lax',
      secure: true
    },
    flowType: 'pkce'
  },
  global: {
    fetch: undefined, 
    headers: { 
      'X-Client-Info': 'travelling-technicians-website' 
    }
  }
});

// After creating the client, manually set the redirect URL
// This line ensures the authentication process still uses our custom domain
supabase.auth.setConfig({
  site_url: getSiteUrl()
});
```

For the admin/service client:

```typescript
return createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    cookieOptions: {
      domain: undefined,
      path: '/',
      sameSite: 'lax',
      secure: true
    },
    flowType: 'pkce'
  },
  global: {
    headers: { 
      'X-Client-Info': 'travelling-technicians-admin' 
    }
  }
});
```

### Step 2: Set Up Environment Variables

Add the following to your `.env.local` file for local development:

```
# For local development
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
```

Add the following to your Vercel project environment variables for production:

```
NEXT_PUBLIC_WEBSITE_URL=https://travelling-technicians.ca
```

### Step 3: Verify Callback Page

Make sure you have a callback page at `src/pages/auth/callback.tsx` to handle authentication redirects. If you don't have this file, you need to create it.

## Verification

After making these changes:

1. Run `node check-auth-config.js` to verify your configuration
2. Run `node test-auth-url.js` to test URL generation
3. Try to build your project locally with `npm run build`

## Supabase Email Templates

Don't forget to update your Supabase email templates as described in the `README-EMAIL-TEMPLATES.md` file, and configure the SMTP settings in the Supabase dashboard as shown in the screenshot.

## SMTP Configuration

For SendGrid, use the following SMTP settings:

- Host: smtp.sendgrid.net
- Port: 465 (or 587 if 465 doesn't work)
- Username: apikey
- Password: [Your SendGrid API Key]
- Sender Email: info@travelling-technicians.ca
- Sender Name: The Travelling Technicians 