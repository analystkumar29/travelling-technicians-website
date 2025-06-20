import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/test-booking-update');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    apiLogger.info('Testing booking update functionality');

    // Get Supabase client with service role
    const supabase = getServiceSupabase();
    
    // First, get a booking to test with
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, reference_number, status')
      .limit(1);
    
    if (fetchError) {
      apiLogger.error('Error fetching test booking', { error: fetchError.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch test booking',
        error: fetchError.message
      });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bookings found to test with'
      });
    }

    const testBooking = bookings[0];
    apiLogger.info('Found test booking', { 
      id: testBooking.id, 
      reference: testBooking.reference_number,
      currentStatus: testBooking.status 
    });

    // Test the update by adding a test note (won't change the actual status)
    const testUpdateData = {
      notes: `Test update at ${new Date().toISOString()}`
    };

    const { data: updateResult, error: updateError } = await supabase
      .from('bookings')
      .update(testUpdateData)
      .eq('id', testBooking.id)
      .select();

    if (updateError) {
      apiLogger.error('Error updating test booking', { error: updateError.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to update test booking',
        error: updateError.message
      });
    }

    apiLogger.info('Test update successful', { 
      id: testBooking.id,
      updatedData: testUpdateData
    });

    return res.status(200).json({
      success: true,
      message: 'Booking update test successful',
      testBooking: {
        id: testBooking.id,
        reference_number: testBooking.reference_number,
        originalStatus: testBooking.status
      },
      updateResult: updateResult[0]
    });

  } catch (error) {
    apiLogger.error('Unexpected error in booking update test', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 