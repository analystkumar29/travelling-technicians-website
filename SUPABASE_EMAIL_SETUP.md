# Supabase Email Configuration Guide

This guide explains how to properly configure Supabase authentication emails for The Travelling Technicians website.

## Problem: Emails Linking to localhost:3000

When users receive authentication emails (signup confirmation, password reset), the links are pointing to `localhost:3000` instead of the production website. This happens because Supabase uses the site URL provided during the authentication flow.

## Solution: Configure Site URL in Environment Variables

### 1. Set Environment Variables

You already have the environment variable set in your production environment (Vercel):

```
NEXT_PUBLIC_WEBSITE_URL=https://travelling-technicians.ca
```

If you're using a different domain, replace it with your actual production domain.

### 2. Verify Vercel Project Settings

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Confirm that `NEXT_PUBLIC_WEBSITE_URL` is set correctly
4. Redeploy your application if necessary

### 3. Update Local Development Environment (Optional)

For consistent behavior in development, add to your `.env.local` file:

```
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
```

## Professional Email Templates

We've created professional email templates that match The Travelling Technicians branding. To apply these:

### 1. Access Supabase Dashboard

1. Log into your [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Navigate to Authentication > Email Templates

### 2. Apply Custom Templates

There are three email templates to configure:

#### Confirmation Email
Used when users sign up to verify their email address.

1. Select the "Confirm Signup" template
2. Replace the existing template with the HTML from `supabase-email-templates.html` (first template)
3. Save changes

#### Password Reset Email
Used when users request a password reset.

1. Select the "Reset Password" template
2. Replace the existing template with the HTML from `supabase-email-templates.html` (second template)
3. Save changes

#### Magic Link Email
Used for passwordless login (if enabled).

1. Select the "Magic Link" template
2. Replace the existing template with the HTML from `supabase-email-templates.html` (third template)
3. Save changes

### 3. Test Email Flow

After applying these changes:

1. Try signing up with a new test email
2. Verify the links in the email point to your production domain
3. Test the password reset flow
4. Confirm that the emails look professional with proper branding

## Additional Recommendations

1. **SMTP Configuration**: For production use, configure a custom SMTP server in Supabase for better email deliverability
2. **Email Sender**: Update the "Email Sender Name" in Supabase Authentication settings to "The Travelling Technicians" 
3. **Reply-To Address**: Set up a support email address as the reply-to address

These changes will significantly improve the user experience and professionalism of your authentication emails. 