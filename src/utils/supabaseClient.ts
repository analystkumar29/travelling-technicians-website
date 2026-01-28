import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Create a module logger
const supabaseLogger = logger.createModuleLogger('supabaseClient');

// Supabase client configuration
// All environment variables are required - no fallbacks allowed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  supabaseLogger.error('NEXT_PUBLIC_SUPABASE_URL is not set');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  supabaseLogger.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
}

// Log supabase configuration (without exposing keys)
supabaseLogger.debug(`NEXT_PUBLIC_SUPABASE_URL is configured: ${supabaseUrl.substring(0, 10)}...`);
supabaseLogger.debug('NEXT_PUBLIC_SUPABASE_ANON_KEY is configured');

// Function to get the correct site URL
export const getSiteUrl = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, check for explicit URL or use Vercel URL with https://
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  
  // Check for site URL in multiple environment variables for backward compatibility
  const mainSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    'https://www.travelling-technicians.ca';
  
  // If this is a Vercel preview deployment, use the Vercel URL
  if (vercelUrl && process.env.VERCEL_ENV === 'preview') {
    return `https://${vercelUrl}`;
  }
  
  // For production, use the main site URL
  return mainSiteUrl;
};

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: { 
      'X-Client-Info': 'travelling-technicians-website' 
    }
  }
});

// Create service role client (admin access) for server-side operations
export const getServiceSupabase = () => {
  if (!supabaseServiceKey) {
    supabaseLogger.error('SUPABASE_SERVICE_ROLE_KEY is not set');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for server-side operations');
  }
  
  if (!supabaseUrl) {
    supabaseLogger.error('NEXT_PUBLIC_SUPABASE_URL is not set');
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required for server-side operations');
  }
  
  supabaseLogger.debug('Creating service role client with explicit fetch binding');
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: fetch.bind(globalThis),
      headers: {
        'X-Client-Info': 'travelling-technicians-server'
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

// Database types
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

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);
      
    if (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
    
    return { success: true, message: 'Supabase connection successful!' };
  } catch (err: any) {
    console.error('Supabase connection test error:', err);
    return { success: false, message: err.message };
  }
}; 