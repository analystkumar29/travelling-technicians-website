import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { requireAdminAuth } from '@/middleware/adminAuth';

// Helper function to generate a unique reference code
function generateReferenceCode(): string {
  const prefix = 'TT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      console.log('============ BOOKINGS API DEBUG ============');
      console.log('1. Method: GET - Fetching bookings...');
      
      // Check environment variables
      console.log('2. Environment Check:', {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
        NODE_ENV: process.env.NODE_ENV,
        NODE_VERSION: process.version
      });
      
      try {
        // Get Supabase client with service role
        console.log('3. Initializing Supabase client...');
        const supabase = getServiceSupabase();
        console.log('4. Supabase client created successfully ✅');
        
        // Fetch all bookings with related data using Supabase joins
        console.log('5. Executing query: SELECT bookings.* with related data...');
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            device_models (
              name,
              brand_id,
              type_id
            ),
            services (
              name,
              display_name
            ),
            service_locations (
              city_name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('6. ❌ Database error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return res.status(500).json({
            success: false,
            error: error.message,
            errorDetails: {
              details: error.details,
              hint: error.hint,
              code: error.code
            }
          });
        }
        
        // Return bookings as-is without transformation
        // Frontend can map IDs to names as needed, or make separate queries
        console.log(`7. ✅ Query successful! Found ${bookings?.length || 0} bookings`);
        console.log('============ END DEBUG ============');
        
        return res.status(200).json({
          success: true,
          bookings: bookings || [],
          cached: false
        });
        
      } catch (supabaseError: any) {
        console.error('❌ Supabase operation failed:', {
          name: supabaseError.name,
          message: supabaseError.message,
          cause: supabaseError.cause,
          stack: supabaseError.stack
        });
        
        // Check if it's a fetch error
        if (supabaseError.message?.includes('fetch failed')) {
          console.error('🔴 FETCH ERROR DETECTED:');
          console.error('This usually means:');
          console.error('- Network connectivity issue');
          console.error('- DNS resolution problem');
          console.error('- SSL/TLS certificate issue');
          console.error('- Firewall blocking the request');
          console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        }
        
        throw supabaseError;
      }
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    
  } catch (error: any) {
    console.error('❌ TOP-LEVEL API ERROR:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      errorType: error.name,
      details: error.cause?.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Wrap the handler with admin authentication
export default requireAdminAuth(handler);