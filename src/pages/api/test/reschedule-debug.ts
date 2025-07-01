import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const debugLogger = logger.createModuleLogger('test/reschedule-debug');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;
    
    debugLogger.info('Starting reschedule debug test', { reference });
    
    const results = {
      step1_environment: {} as any,
      step2_supabase_client: {} as any,
      step3_booking_fetch: {} as any,
      step4_booking_update: {} as any,
      errors: [] as string[]
    };

    // Step 1: Check environment variables
    try {
      results.step1_environment = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasVerificationSecret: !!process.env.BOOKING_VERIFICATION_SECRET,
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      };
    } catch (error) {
      results.errors.push(`Step 1 error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 2: Test Supabase client creation
    try {
      const supabase = getServiceSupabase();
      results.step2_supabase_client = {
        clientCreated: !!supabase,
        success: true
      };
    } catch (error) {
      results.step2_supabase_client = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.errors.push(`Step 2 error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 3: Test booking fetch (if reference provided)
    if (reference && typeof reference === 'string') {
      try {
        const supabase = getServiceSupabase();
        const { data, error } = await supabase
          .from('bookings')
          .select('id, reference_number, customer_name, status')
          .eq('reference_number', reference)
          .single();

        results.step3_booking_fetch = {
          success: !error,
          hasData: !!data,
          bookingId: data?.id,
          bookingStatus: data?.status,
          error: error?.message,
          errorCode: error?.code
        };

        if (error) {
          results.errors.push(`Step 3 error: ${error.message} (${error.code})`);
        }
      } catch (error) {
        results.step3_booking_fetch = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.errors.push(`Step 3 error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      results.step3_booking_fetch = {
        skipped: true,
        reason: 'No reference provided. Add ?reference=YOUR_BOOKING_REFERENCE to test'
      };
    }

    // Step 4: Test booking update (only if we have a valid booking)
    if (reference && typeof reference === 'string' && results.step3_booking_fetch.success) {
      try {
        const supabase = getServiceSupabase();
        // Test update without actually changing anything significant
        const { data, error } = await supabase
          .from('bookings')
          .update({ notes: `Debug test at ${new Date().toISOString()}` })
          .eq('reference_number', reference)
          .select('id, reference_number')
          .single();

        results.step4_booking_update = {
          success: !error,
          hasData: !!data,
          error: error?.message,
          errorCode: error?.code
        };

        if (error) {
          results.errors.push(`Step 4 error: ${error.message} (${error.code})`);
        }
      } catch (error) {
        results.step4_booking_update = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.errors.push(`Step 4 error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      results.step4_booking_update = {
        skipped: true,
        reason: 'No valid booking found in step 3'
      };
    }

    debugLogger.info('Reschedule debug test completed', { 
      totalErrors: results.errors.length,
      reference
    });

    return res.status(200).json({
      success: results.errors.length === 0,
      message: 'Reschedule booking debug test completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    debugLogger.error('Unexpected error in reschedule debug', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 