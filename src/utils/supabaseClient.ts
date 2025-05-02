import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Create a module logger
const supabaseLogger = logger.createModuleLogger('supabaseClient');

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Function to get admin client with service role (only use on the server)
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!serviceRoleKey) {
    supabaseLogger.error('SUPABASE_SERVICE_ROLE_KEY is not set');
  } else {
    supabaseLogger.debug('SUPABASE_SERVICE_ROLE_KEY is configured');
  }
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
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