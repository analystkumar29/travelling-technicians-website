# The Travelling Technicians Website

A modern, responsive website for a doorstep device repair service business serving the Lower Mainland area in British Columbia.

## Project Overview

The Travelling Technicians website is designed to showcase a mobile phone and laptop repair service that differentiates itself by offering doorstep repair services. Customers can book repair services online, and technicians travel to the customer's location to perform repairs.

### Key Features

- ✅ **Doorstep Service Emphasis**: Clear communication of mobile repair services
- ✅ **Comprehensive Services Pages**: Detailed mobile and laptop repair options
- ✅ **Complete Online Booking System**: Multi-step booking form with verification
- ✅ **Booking Verification System**: Secure token-based verification
- ✅ **Self-Service Rescheduling**: Customer booking management
- ✅ **Postal Code Checker**: Service area verification
- ✅ **Interactive Map**: Visual representation of service areas
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Email Confirmation System**: Automated notifications via SendGrid

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Email Service**: SendGrid
- **Deployment**: Vercel
- **Maps**: Leaflet for interactive maps
- **Forms**: React Hook Form
- **Authentication**: Token-based verification system

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account for database
- SendGrid account for emails
- Google Maps API key for address autocomplete

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/travelling-technicians.git
   cd travelling-technicians
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SENDGRID_API_KEY=your_sendgrid_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VERIFICATION_SECRET=your_verification_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/pages` - Contains all pages of the website
- `/src/components` - Reusable UI components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and libraries
- `/src/services` - Service-related functionality
- `/src/types` - TypeScript type definitions
- `/src/styles` - Global styles and Tailwind configuration
- `/public` - Static assets (images, fonts, etc.)

## Key Pages

- **Home**: Landing page with key value propositions
- **Services**: Mobile and laptop repair service details
- **Book Online**: Multi-step booking form
- **Service Areas**: Map and postal code checker
- **Verify Booking**: Token-based booking verification
- **Reschedule Booking**: Self-service booking management
- **Contact**: Contact form and business information
- **About**: Company information and team

## API Endpoints

- `/api/bookings/create` - Create new booking records
- `/api/send-confirmation` - Send booking confirmation emails
- `/api/verify-booking` - Verify booking tokens
- `/api/send-reschedule-confirmation` - Send rescheduling confirmation emails

## Database Schema

The project uses Supabase with the following main tables:

- **bookings** - Stores all booking information
- **customers** - Customer contact information
- **services** - Available repair services
- **service_areas** - Geographical service coverage

## Deployment

The site is deployed on Vercel and can be accessed at [travelling-technicians.ca](https://travelling-technicians.ca).

### Deployment Process

1. Push changes to the main branch
2. Vercel automatically builds and deploys the site
3. Environment variables are configured in the Vercel dashboard

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## Future Enhancements

- User accounts for customers
- Technician profiles and selection
- Real-time availability calendar
- Blog system for device repair tips
- Advanced analytics dashboard

## Version

Current version: 1.0.0

## License

This project is proprietary and not licensed for public use.
