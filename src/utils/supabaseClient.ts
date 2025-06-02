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
  // For production, always set to root domain to allow sharing between www and non-www
  const domain = isDev || isVercelPreview || hostname.includes('vercel.app') 
    ? undefined 
    : '.travelling-technicians.ca';  // Note the leading dot to support all subdomains
  
  return {
    domain,
    path: '/',
    sameSite: 'lax' as 'lax',
    secure: !isDev,
    maxAge: 60 * 60 * 24 * 30  // 30 days in seconds
  };
};

// Add enhanced logging
const debug = {
  log: (message: string, ...data: any[]) => {
    console.log(`[SUPABASE] ${message}`, ...data);
  },
  error: (message: string, ...data: any[]) => {
    console.error(`[SUPABASE] ${message}`, ...data);
  },
  warn: (message: string, ...data: any[]) => {
    console.warn(`[SUPABASE] ${message}`, ...data);
  }
};

// Create a custom auth storage adapter to support cross-domain cookies
class CrossDomainCookieStorage {
  constructor() {
    if (typeof window === 'undefined') {
      debug.warn('CrossDomainCookieStorage should only be used in browser environments');
    }
  }

  // Get cookie by name
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  // Set cookie with domain
  private setCookie(name: string, value: string, options: any = {}): void {
    if (typeof document === 'undefined') return;
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    // For development, don't set a domain - it will default to the current hostname
    // For production, always set to root domain to allow sharing between www and non-www
    const domain = isDev || hostname.includes('vercel.app') 
      ? undefined 
      : '.travelling-technicians.ca';  // Note the leading dot to support all subdomains
    
    // Build cookie string
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (domain) cookieString += `; domain=${domain}`;
    cookieString += `; path=${options.path || '/'}`;
    cookieString += `; max-age=${options.maxAge || 60 * 60 * 24 * 30}`; // 30 days default
    cookieString += `; samesite=${options.sameSite || 'lax'}`;
    
    if (options.secure !== false) cookieString += `; secure`;
    
    debug.log(`Setting cross-domain cookie: ${name} with domain ${domain || 'default'}`);
    document.cookie = cookieString;
  }

  // Delete cookie
  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    // Need to set for both the current domain and the root domain
    const domain = isDev || hostname.includes('vercel.app') 
      ? undefined 
      : '.travelling-technicians.ca';
    
    // Delete with same options as when set
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax; secure`;
    
    // Also try to delete from the specific domain
    if (domain) {
      document.cookie = `${name}=; domain=${domain}; path=/; max-age=0; samesite=lax; secure`;
    }
    
    debug.log(`Deleted cookie: ${name} from domain ${domain || 'default'}`);
  }

  // Required methods for Supabase Auth storage adapter
  getItem(key: string): string | null {
    return this.getCookie(key);
  }

  setItem(key: string, value: string): void {
    this.setCookie(key, value, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      secure: !isDev
    });
  }

  removeItem(key: string): void {
    this.deleteCookie(key);
  }
}

// Create a single supabase client for the browser with custom storage adapter
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Ensures the session is saved between page loads/refreshes
    autoRefreshToken: true, // Automatically refreshes the token before it expires
    flowType: 'pkce',
    detectSessionInUrl: true, // Detects the session in the URL after authentication redirects
    storage: typeof window !== 'undefined' ? new CrossDomainCookieStorage() : undefined
  },
  global: {
    headers: { 
      'X-Client-Info': 'travelling-technicians-website' 
    }
  }
});

// Log the redirect URL on initialization in development
if (isDev) {
  debug.log(`Auth redirect URL configured as: ${authRedirectUrl}`);
  debug.log('Cookie settings configured:', getCookieSettings());
}

// After creating the client, listen for auth state changes
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    debug.log('Auth state changed:', event);
    
    try {
      // Get the hostname for domain handling
      const hostname = window.location.hostname;
      
      // Configure auth URL based on current environment
      const authUrl = hostname.includes('travelling-technicians.ca') 
        ? 'https://travelling-technicians.ca' 
        : authRedirectUrl;
      
      debug.log('Auth URL configured:', authUrl);
      debug.log('Current domain:', hostname);
      
      // Handle sign out by removing cookies on both specific domains
      if (event === 'SIGNED_OUT') {
        debug.log('Signed out detected, cleaning up cookies');
        
        // Delete cookies on current domain
        document.cookie = `sb-access-token=; path=/; expires=${new Date(0).toUTCString()}; SameSite=Lax; Secure`;
        document.cookie = `sb-refresh-token=; path=/; expires=${new Date(0).toUTCString()}; SameSite=Lax; Secure`;
        
        // Delete cookies on root domain
        if (hostname.includes('travelling-technicians.ca')) {
          document.cookie = `sb-access-token=; domain=.travelling-technicians.ca; path=/; expires=${new Date(0).toUTCString()}; SameSite=Lax; Secure`;
          document.cookie = `sb-refresh-token=; domain=.travelling-technicians.ca; path=/; expires=${new Date(0).toUTCString()}; SameSite=Lax; Secure`;
        }
      }
      
      // If we're in a cross-domain scenario (www vs non-www), set up cookie sharing
      if (session && hostname.includes('travelling-technicians.ca')) {
        debug.log('Setting up cross-domain support for session', session.user?.email);
        
        // Set cross-domain cookies with root domain (.travelling-technicians.ca)
        const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
        document.cookie = `tt-auth-check=true; path=/; domain=.travelling-technicians.ca; max-age=${maxAge}; SameSite=Lax; Secure`;
        document.cookie = `tt-user-id=${session.user?.id || ''}; path=/; domain=.travelling-technicians.ca; max-age=${maxAge}; SameSite=Lax; Secure`;
      }
    } catch (err) {
      debug.error('Error in auth state change handler:', err);
    }
  });
}

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

// Export additional function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const start = Date.now();
    debug.log('Testing Supabase connection...');
    
    // Simple test query to check database connectivity
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      debug.error('Connection test failed:', error.message);
      return { success: false, error: error.message, latency: Date.now() - start };
    }
    
    debug.log('Connection test successful, latency:', Date.now() - start, 'ms');
    return { success: true, latency: Date.now() - start };
  } catch (err) {
    debug.error('Connection test exception:', err);
    return { success: false, error: String(err), latency: -1 };
  }
}; 