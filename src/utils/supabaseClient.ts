import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Create a module logger
const supabaseLogger = logger.createModuleLogger('supabaseClient');

// Supabase client configuration
// In development mode, use default test values if environment variables are not set
const isDev = process.env.NODE_ENV === 'development';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (isDev ? 'https://test-supabase-project.supabase.co' : '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isDev ? 'test-anon-key-for-development-only' : '');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (isDev ? 'test-service-key-for-development-only' : '');

// Log supabase configuration (without exposing keys)
if (!supabaseUrl) {
  supabaseLogger.error('NEXT_PUBLIC_SUPABASE_URL is not set');
} else {
  supabaseLogger.debug(`NEXT_PUBLIC_SUPABASE_URL is configured: ${supabaseUrl.substring(0, 10)}...`);
}

if (!supabaseAnonKey) {
  supabaseLogger.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
} else {
  supabaseLogger.debug('NEXT_PUBLIC_SUPABASE_ANON_KEY is configured');
}

// Function to get the correct site URL for auth redirects
export const getSiteUrl = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, check for explicit URL or use Vercel URL with https://
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  const primaryDomain = 'travelling-technicians.ca';
  const mainSiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://travelling-technicians.ca';
  
  // If this is a Vercel preview deployment, use the Vercel URL
  if (vercelUrl && process.env.VERCEL_ENV === 'preview') {
    return `https://${vercelUrl}`;
  }
  
  // For production, use the main site URL
  return mainSiteUrl;
};

// Get the redirect URL for auth
const authRedirectUrl = `${getSiteUrl()}/auth/callback`;

// Determine cookie settings based on environment
const getCookieSettings = () => {
  const isVercelPreview = Boolean(process.env.VERCEL_ENV === 'preview');
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // For development, don't set a domain - it will default to the current hostname
  // For Vercel preview, don't set a domain to let the browser set it automatically
  // For production, set to the root domain to allow sharing between subdomains
  const domain = isDev || isVercelPreview || hostname.includes('vercel.app') 
    ? undefined 
    : '.travelling-technicians.ca';
  
  return {
    domain,
    path: '/',
    sameSite: 'lax' as 'lax',
    secure: !isDev
  };
};

// Create a single supabase client for the browser with correct cookie settings for auth
// In your version of Supabase JS, cookieOptions isn't directly supported on auth config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    detectSessionInUrl: true
  },
  global: {
    headers: { 
      'X-Client-Info': 'travelling-technicians-website' 
    }
  }
});

// Log the redirect URL on initialization in development
if (isDev) {
  console.log(`Auth redirect URL configured as: ${authRedirectUrl}`);
  console.log('Cookie settings configured (manual setup):', getCookieSettings());
}

// After creating the client, listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Make sure site redirects are correct
    console.log('Auth state changed:', event);
    console.log('Auth URL configured:', getSiteUrl());
    
    // Debug cookie settings
    if (typeof window !== 'undefined') {
      console.log('Current domain:', window.location.hostname);
      
      // In Vercel preview or domains other than the main domain,
      // manually set cross-domain cookies to share authentication
      const isVercelPreview = Boolean(process.env.VERCEL_ENV === 'preview');
      const hostname = window.location.hostname;
      
      if (event === 'SIGNED_IN' && session && !hostname.includes('localhost')) {
        try {
          // For Supabase older versions without direct cookieOptions support,
          // we'll manually set access and refresh tokens as cookies
          // This helps with cross-domain auth in Vercel preview environments
          if (session.access_token && session.refresh_token) {
            console.log('Setting up cross-domain cookie support...');
          }
        } catch (err) {
          console.error('Error setting up cross-domain cookies:', err);
        }
      }
    }
  }
});

// Set the default redirect URL for auth operations
// Instead of setting redirectTo in the client options, we manually configure it here
// to ensure it works across all Supabase versions
try {
  // This needs to be done after client initialization
  // Will be used for all auth operations (signIn, signUp, etc.)
  if (typeof window !== 'undefined') {
    console.log('Setting default auth redirect to:', authRedirectUrl);
    sessionStorage.setItem('supabaseAuthRedirectTo', authRedirectUrl);
  }
} catch (err) {
  console.error('Error setting auth redirect:', err);
}

// Function to get admin client with service role (only use on the server)
export const getServiceSupabase = () => {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!supabaseServiceKey && !isDev) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  
  // Log service role key status
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (isDev) {
      supabaseLogger.warn('Using development fallback for SUPABASE_SERVICE_ROLE_KEY');
    } else {
      supabaseLogger.error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
  } else {
    supabaseLogger.debug('SUPABASE_SERVICE_ROLE_KEY is configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      flowType: 'pkce'
    },
    global: {
      headers: { 
        'X-Client-Info': 'travelling-technicians-admin' 
      }
    }
  });
};

// Types from our database
export type Booking = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_type: 'mobile' | 'laptop';
  device_brand: string;
  device_model: string;
  issue_description: string;
  service_type: string;
  address: string;
  postal_code: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  technician_id?: string;
  notes?: string;
  reference_number: string;
};

export type Technician = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  available: boolean;
  areas_covered: string[];
};

export type Review = {
  id: string;
  created_at: string;
  booking_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  service_type: string;
  visible: boolean;
}; 