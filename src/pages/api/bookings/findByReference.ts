import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    console.log('Finding booking by reference:', reference);

    if (!reference) {
      return res.status(400).json({ error: 'Reference number is required' });
    }

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // Fetch booking by reference number
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', reference)
      .single();
    
    if (error) {
      console.error('Error finding booking:', error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'Booking not found' 
        });
      }
      throw error;
    }
    
    console.log('Found booking:', booking ? 'Yes' : 'No');
    
    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error finding booking:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find booking' 
    });
  }
} 