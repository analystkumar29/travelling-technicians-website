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
  if (req.method === 'GET') {
    try {
      // Get Supabase client with service role
      const supabase = getServiceSupabase();
      
      // Fetch all bookings from the database
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch bookings' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 