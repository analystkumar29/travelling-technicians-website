import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { withErrorHandler } from '@/utils/apiErrorHandler';
import { apiCache } from '@/utils/cache';

// Helper function to generate a unique reference code
function generateReferenceCode(): string {
  const prefix = 'TT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Check cache first for recent bookings data
    const cacheKey = 'bookings:all';
    const cachedBookings = await apiCache.get(cacheKey);
    
    if (cachedBookings) {
      return res.status(200).json({
        success: true,
        bookings: cachedBookings,
        cached: true
      });
    }
    
    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Fetch all bookings from the database
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Cache the results for 5 minutes
    await apiCache.set(cacheKey, bookings, 5 * 60 * 1000);
    
    return res.status(200).json({
      success: true,
      bookings,
      cached: false
    });
  }

  // Method not allowed error will be handled by the error handler
  const error = new Error('Method not allowed');
  error.name = 'MethodNotAllowedError';
  throw error;
}

// Export the handler wrapped with error handling
export default withErrorHandler(handler, { 
  timeout: 30000, // 30 second timeout for booking operations
  includeDebug: process.env.NODE_ENV === 'development' 
}); 