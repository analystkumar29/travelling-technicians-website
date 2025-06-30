# Professional Email Templates for Authentication

This document provides step-by-step instructions for configuring professional email templates for authentication emails in Supabase.

## Overview

We've created professional email templates for The Travelling Technicians website that match your brand identity and provide a better user experience. These templates include:

1. **Account Confirmation Emails** - Sent when users sign up to verify their email address
2. **Password Reset Emails** - Sent when users request to reset their password
3. **Magic Link Emails** - Sent for passwordless login (if enabled)

## Implementation Steps

### Step 1: Access Supabase Dashboard

1. Log into your [Supabase Dashboard](https://app.supabase.io)
2. Select your project 
3. Navigate to **Authentication > Email Templates**

### Step 2: Configure Email Templates

#### For the Confirmation Email:

1. In the Supabase dashboard, select the **Confirm Signup** template
2. Replace the existing HTML with the first template from the `supabase-email-templates.html` file
3. Update the Subject line to: `Confirm Your Email - The Travelling Technicians`
4. Click Save

#### For the Password Reset Email:

1. Select the **Reset Password** template
2. Replace the existing HTML with the second template from the `supabase-email-templates.html` file
3. Update the Subject line to: `Reset Your Password - The Travelling Technicians`
4. Click Save

#### For the Magic Link Email (if using passwordless login):

1. Select the **Magic Link** template
2. Replace the existing HTML with the third template from the `supabase-email-templates.html` file
3. Update the Subject line to: `Sign In Link - The Travelling Technicians`
4. Click Save

### Step 3: Configure Email Sender Information

1. Navigate to **Authentication > Settings**
2. Find the **Email Settings** section
3. Update the **Sender Name** to: `The Travelling Technicians`
4. Set the **Sender Email** to your official support or noreply email address
5. Optionally, set up a custom SMTP server for better deliverability

### Step 4: Test the Email Flow

After applying the templates:

1. Create a test user account with a real email address
2. Check that the confirmation email arrives with proper formatting and branding
3. Try the password reset flow to ensure it works correctly
4. Verify that the links in the emails point to your production domain (not localhost)

## Troubleshooting

If you encounter any issues:

- **Links still pointing to localhost**: Verify that the `NEXT_PUBLIC_WEBSITE_URL` environment variable is set correctly in Vercel
- **Images not displaying**: Ensure the logo path is correct and accessible from the public internet
- **Emails not being received**: Check spam folders and verify SMTP settings if using a custom mail server

## Customization

You can further customize these templates by:

1. Updating colors to match your brand (search for `#0076be` in the templates)
2. Changing the logo URL to your specific logo location
3. Modifying the content to match your brand voice
4. Adding social media links in the footer

## Maintenance

These templates should be reviewed periodically to ensure they remain up-to-date with your brand guidelines. Update the copyright year annually.

---

For any questions or assistance, contact your development team. 