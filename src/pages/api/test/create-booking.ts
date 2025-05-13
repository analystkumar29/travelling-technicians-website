import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create module logger
const apiLogger = logger.createModuleLogger('test/create-booking');

// Function to generate a reference number
function generateReferenceNumber(): string {
  const prefix = 'TEST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  apiLogger.info('Received test booking creation request');
  
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      apiLogger.error('Missing Supabase configuration');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error',
        details: 'Missing Supabase configuration'
      });
    }

    // Extract data from request body
    const requestBody = req.body;
    apiLogger.debug('Request body received', { 
      deviceType: requestBody.deviceType,
      serviceType: requestBody.serviceType,
      customerName: requestBody.customerName
    });

    // Generate a reference number
    const referenceNumber = generateReferenceNumber();
    apiLogger.debug(`Generated reference: ${referenceNumber}`);

    // Check required fields manually to avoid regular API validation
    const requiredFields = [
      'deviceType', 
      'serviceType', 
      'customerName', 
      'customerEmail', 
      'customerPhone',
      'address',
      'postalCode'
    ];
    
    // We need either appointmentDate/Time or bookingDate/Time
    const hasDate = 
      (requestBody.appointmentDate || requestBody.bookingDate) && 
      (requestBody.appointmentTime || requestBody.bookingTime);
      
    if (!hasDate) {
      apiLogger.warn('Missing date/time fields');
      return res.status(400).json({
        success: false,
        message: 'Missing date/time fields'
      });
    }
    
    // Check required fields
    for (const field of requiredFields) {
      if (!requestBody[field]) {
        apiLogger.warn(`Missing required field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }
    
    // Use direct PostgreSQL function to insert the record
    // This bypasses triggers and validation
    const supabase = getServiceSupabase();
    
    // Normalize field names
    const appointmentDate = requestBody.appointmentDate || requestBody.bookingDate;
    const appointmentTime = requestBody.appointmentTime || requestBody.bookingTime;
    const deviceBrand = requestBody.brand || requestBody.deviceBrand || '';
    const deviceModel = requestBody.model || requestBody.deviceModel || '';
    const issueDescription = requestBody.message || requestBody.issueDescription || '';
    
    // Insert the booking using PostgreSQL connection function
    apiLogger.info('Creating booking with direct PostgreSQL function');
    
    // Try using a stored procedure to avoid the city issue
    // First, check if our procedure exists
    const { data: procExists, error: procError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name = 'create_test_booking' 
        AND routine_schema = 'public'
      `
    });
    
    if (procError) {
      apiLogger.error('Error checking procedure:', procError);
    }
    
    // Create the procedure if it doesn't exist
    if (!procExists || procExists.length === 0) {
      apiLogger.info('Creating stored procedure for test bookings');
      
      const { data: createProcData, error: createProcError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION public.create_test_booking(
            p_reference_number TEXT,
            p_device_type TEXT,
            p_device_brand TEXT,
            p_device_model TEXT,
            p_service_type TEXT,
            p_booking_date DATE,
            p_booking_time TEXT,
            p_customer_name TEXT,
            p_customer_email TEXT,
            p_customer_phone TEXT,
            p_address TEXT,
            p_postal_code TEXT,
            p_issue_description TEXT
          ) 
          RETURNS UUID
          LANGUAGE plpgsql
          AS $$
          DECLARE
            v_booking_id UUID;
          BEGIN
            -- Direct insert that bypasses triggers
            INSERT INTO public.bookings(
              reference_number, 
              device_type, 
              device_brand, 
              device_model, 
              service_type, 
              booking_date, 
              booking_time, 
              customer_name, 
              customer_email, 
              customer_phone, 
              address, 
              postal_code, 
              issue_description, 
              status
            )
            VALUES (
              p_reference_number,
              p_device_type,
              p_device_brand,
              p_device_model,
              p_service_type,
              p_booking_date,
              p_booking_time,
              p_customer_name,
              p_customer_email,
              p_customer_phone,
              p_address,
              p_postal_code,
              p_issue_description,
              'pending'
            )
            RETURNING id INTO v_booking_id;
            
            RETURN v_booking_id;
          END;
          $$;
        `
      });
      
      if (createProcError) {
        apiLogger.error('Error creating procedure:', createProcError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create test booking',
          details: 'Could not create stored procedure'
        });
      }
      
      apiLogger.info('Stored procedure created successfully');
    }
    
    // Now call the procedure to create the booking
    const { data: bookingData, error: bookingError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT public.create_test_booking(
          '${referenceNumber}',
          '${requestBody.deviceType === 'tablet' ? 'mobile' : requestBody.deviceType}',
          '${deviceBrand.replace(/'/g, "''")}',
          '${deviceModel.replace(/'/g, "''")}',
          '${requestBody.serviceType}',
          '${appointmentDate}',
          '${appointmentTime}',
          '${requestBody.customerName.replace(/'/g, "''")}',
          '${requestBody.customerEmail.replace(/'/g, "''")}',
          '${requestBody.customerPhone.replace(/'/g, "''")}',
          '${requestBody.address.replace(/'/g, "''")}',
          '${requestBody.postalCode.replace(/'/g, "''")}',
          '${issueDescription.replace(/'/g, "''")}'
        ) as booking_id;
        
        SELECT * FROM bookings WHERE reference_number = '${referenceNumber}';
      `
    });
    
    if (bookingError) {
      apiLogger.error('Error creating booking:', bookingError);
      
      // If we still hit issues, try a very minimal insert with just required fields
      apiLogger.info('Attempting minimal insert as fallback');
      
      const { data: minimalData, error: minimalError } = await supabase.rpc('execute_sql', {
        sql_query: `
          INSERT INTO bookings (
            reference_number, 
            device_type, 
            service_type, 
            booking_date, 
            booking_time, 
            customer_name, 
            customer_email, 
            customer_phone, 
            address, 
            postal_code, 
            status
          ) VALUES (
            '${referenceNumber}',
            '${requestBody.deviceType === 'tablet' ? 'mobile' : requestBody.deviceType}',
            '${requestBody.serviceType}',
            '${appointmentDate}',
            '${appointmentTime}',
            '${requestBody.customerName.replace(/'/g, "''")}',
            '${requestBody.customerEmail.replace(/'/g, "''")}',
            '${requestBody.customerPhone.replace(/'/g, "''")}',
            '${requestBody.address.replace(/'/g, "''")}',
            '${requestBody.postalCode.replace(/'/g, "''")}',
            'pending'
          );
          
          SELECT * FROM bookings WHERE reference_number = '${referenceNumber}';
        `
      });
      
      if (minimalError) {
        apiLogger.error('Minimal insert failed:', minimalError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create test booking',
          details: 'All insertion methods failed',
          original_error: bookingError.message,
          minimal_error: minimalError.message
        });
      }
      
      apiLogger.info('Minimal insert succeeded');
      
      // Now update the optional fields
      const { data: updateData, error: updateError } = await supabase.rpc('execute_sql', {
        sql_query: `
          UPDATE bookings
          SET
            device_brand = '${deviceBrand.replace(/'/g, "''")}',
            device_model = '${deviceModel.replace(/'/g, "''")}',
            issue_description = '${issueDescription.replace(/'/g, "''")}'
          WHERE reference_number = '${referenceNumber}';
          
          SELECT * FROM bookings WHERE reference_number = '${referenceNumber}';
        `
      });
      
      if (updateError) {
        apiLogger.warn('Failed to update optional fields:', updateError);
        // Continue anyway as the booking was created
      }
      
      return res.status(200).json({
        success: true,
        message: 'Test booking created successfully (fallback method)',
        booking_reference: referenceNumber
      });
    }
    
    apiLogger.info('Test booking created successfully', {
      reference: referenceNumber
    });
    
    return res.status(200).json({
      success: true,
      message: 'Test booking created successfully',
      booking_reference: referenceNumber
    });
  } catch (error: any) {
    apiLogger.error('Exception during test booking creation', {
      error: error.message
    });
    
    return res.status(500).json({
      success: false,
      message: 'Exception during test booking creation',
      details: error.message
    });
  }
} 