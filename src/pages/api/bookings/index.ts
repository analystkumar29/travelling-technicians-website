import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

// Helper function to generate a unique reference code
function generateReferenceCode(): string {
  const prefix = 'TT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      console.log('Fetching bookings with related data...');
      
      // Get Supabase client with service role
      const supabase = getServiceSupabase();
      
      // Fetch all bookings with RELATED DATA from V2 schema
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          device_models!model_id(
            id,
            name,
            slug,
            brand_id,
            type_id,
            brands!brand_id(id, name, slug),
            device_types!type_id(id, name, slug)
          ),
          services!service_id(
            id,
            name,
            display_name,
            device_type_id
          ),
          service_locations!location_id(
            id,
            city_name,
            slug
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
      
      // Transform bookings to match frontend expectations
      const transformedBookings = (bookings || []).map((booking: any) => ({
        ...booking,
        // Flatten device information
        device_type: booking.device_models?.device_types?.name || null,
        device_brand: booking.device_models?.brands?.name || null,
        device_model: booking.device_models?.name || null,
        // Flatten service information
        service_type: booking.services?.display_name || booking.services?.name || null,
        // Flatten location information
        address: booking.customer_address || null,
        city: booking.service_locations?.city_name || null,
        postal_code: booking.booking_ref ? null : null,
        province: null,
        // Keep reference number
        reference_number: booking.booking_ref || '',
        // Keep status (if it exists, otherwise default to pending)
        status: booking.status || 'pending'
      }));
      
      console.log(`Found ${transformedBookings?.length || 0} bookings`);
      
      return res.status(200).json({
        success: true,
        bookings: transformedBookings || [],
        cached: false
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
