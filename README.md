# The Travelling Technicians Website

The official website for The Travelling Technicians, a doorstep device repair service operating in the Lower Mainland, BC. The website features an online booking system, service information, and location-based service verification.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **APIs**: Google Maps for location services, SendGrid for email notifications
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual API keys and credentials

4. Run the development server:
   ```
   npm run dev
   ```

## Environment Variables

The application requires several environment variables to be set:

- **Database**: `DATABASE_URL`, `DIRECT_URL`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Google Maps**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **SendGrid**: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`, `SENDGRID_TEMPLATE_ID`
- **Website Config**: `NEXT_PUBLIC_WEBSITE_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_API_URL`

See `.env.example` for all required variables.

## Deployment

The site is deployed to Vercel with automatic deployments from the main branch.

## Current Implementation Status

The site is currently in version 1.0.0 with an in-memory implementation for data storage. Database integration is planned for future releases.
