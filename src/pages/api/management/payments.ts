import { requireAdminAuth } from '@/middleware/adminAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api/management/payments');

const VALID_PAYMENT_METHODS = ['cash', 'debit', 'credit', 'etransfer', 'paypal'] as const;
const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
const VALID_CURRENCIES = ['CAD', 'USD'] as const;

type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];
type PaymentStatus = typeof VALID_STATUSES[number];
type PaymentCurrency = typeof VALID_CURRENCIES[number];

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  status: PaymentStatus;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  currency: PaymentCurrency;
  bookings?: {
    id: string;
    booking_ref: string;
    customer_name: string;
    customer_email: string;
    status: string;
    final_price: number | null;
    quoted_price: number | null;
    device_models: { name: string } | null;
    services: { name: string; display_name: string } | null;
  };
}

interface ApiResponse {
  success: boolean;
  payments?: Payment[];
  payment?: Payment;
  message?: string;
  error?: string;
}

export default requireAdminAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const supabase = getServiceSupabase();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase);
      case 'POST':
        return await handlePost(req, res, supabase);
      case 'PUT':
        return await handlePut(req, res, supabase);
      case 'DELETE':
        return await handleDelete(req, res, supabase);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`,
        });
    }
  } catch (error) {
    apiLogger.error('Unexpected error in payments API', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process request',
    });
  }
});

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const { status, payment_method, booking_id } = req.query;

    apiLogger.info('Fetching payments', { status, payment_method, booking_id });

    let query = supabase
      .from('payments')
      .select(
        `*, bookings(id, booking_ref, customer_name, customer_email, status, final_price, quoted_price, device_models:model_id(name), services:service_id(name, display_name))`
      )
      .order('created_at', { ascending: false });

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }
    if (payment_method && typeof payment_method === 'string') {
      query = query.eq('payment_method', payment_method);
    }
    if (booking_id && typeof booking_id === 'string') {
      query = query.eq('booking_id', booking_id);
    }

    const { data: payments, error } = await query;

    if (error) {
      apiLogger.error('Error fetching payments', { error });
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch payments',
      });
    }

    apiLogger.info('Successfully fetched payments', { count: payments?.length || 0 });

    return res.status(200).json({
      success: true,
      payments: (payments as Payment[]) || [],
    });
  } catch (error) {
    apiLogger.error('Error in handleGet', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const {
      booking_id,
      amount,
      payment_method,
      transaction_id,
      notes,
      status = 'completed',
      currency = 'CAD',
    } = req.body;

    // Validate required fields
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: 'booking_id is required',
      });
    }
    if (amount == null || amount === '') {
      return res.status(400).json({
        success: false,
        error: 'amount is required',
      });
    }
    if (!payment_method) {
      return res.status(400).json({
        success: false,
        error: 'payment_method is required',
      });
    }

    // Validate enums
    if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
      });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }
    if (!VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({
        success: false,
        error: `Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`,
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'amount must be a non-negative number',
      });
    }

    // Check one_payment_per_booking constraint — verify no existing payment for this booking
    const { data: existing, error: checkError } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', booking_id)
      .maybeSingle();

    if (checkError) {
      apiLogger.error('Error checking existing payment', { error: checkError });
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing payment',
      });
    }

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A payment already exists for this booking. Only one payment per booking is allowed.',
      });
    }

    // Verify booking exists
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, booking_ref')
      .eq('id', booking_id)
      .maybeSingle();

    if (bookingError || !bookingData) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    apiLogger.info('Creating payment', {
      booking_id,
      amount: parsedAmount,
      payment_method,
      status,
    });

    const insertData: Record<string, unknown> = {
      booking_id,
      amount: parsedAmount,
      payment_method,
      status,
      currency,
      transaction_id: transaction_id || null,
      notes: notes || null,
    };

    // Set processed_at if status is completed
    if (status === 'completed') {
      insertData.processed_at = new Date().toISOString();
    }

    const { data: newPayment, error: insertError } = await supabase
      .from('payments')
      .insert(insertData)
      .select(
        `*, bookings(id, booking_ref, customer_name, customer_email, status, final_price, quoted_price, device_models:model_id(name), services:service_id(name, display_name))`
      )
      .single();

    if (insertError) {
      apiLogger.error('Error creating payment', { error: insertError });

      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'A payment already exists for this booking.',
        });
      }

      return res.status(500).json({
        success: false,
        error: insertError.message,
        message: 'Failed to create payment',
      });
    }

    apiLogger.info('Successfully created payment', { id: newPayment.id });

    return res.status(201).json({
      success: true,
      payment: newPayment as Payment,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    apiLogger.error('Error in handlePost', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment',
    });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Payment id is required as query parameter',
      });
    }

    const updateData: Record<string, unknown> = {};
    const { amount, payment_method, transaction_id, notes, status, currency } = req.body;

    if (amount != null) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          success: false,
          error: 'amount must be a non-negative number',
        });
      }
      updateData.amount = parsedAmount;
    }

    if (payment_method != null) {
      if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
        return res.status(400).json({
          success: false,
          error: `Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`,
        });
      }
      updateData.payment_method = payment_method;
    }

    if (transaction_id !== undefined) {
      updateData.transaction_id = transaction_id || null;
    }

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (currency != null) {
      if (!VALID_CURRENCIES.includes(currency)) {
        return res.status(400).json({
          success: false,
          error: `Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`,
        });
      }
      updateData.currency = currency;
    }

    if (status != null) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      updateData.status = status;

      // If status changes to completed, set processed_at
      if (status === 'completed') {
        // Fetch existing payment to check if processed_at is already set
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('processed_at')
          .eq('id', id)
          .single();

        if (!existingPayment?.processed_at) {
          updateData.processed_at = new Date().toISOString();
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    apiLogger.info('Updating payment', { id, fields: Object.keys(updateData) });

    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select(
        `*, bookings(id, booking_ref, customer_name, customer_email, status, final_price, quoted_price, device_models:model_id(name), services:service_id(name, display_name))`
      )
      .single();

    if (updateError) {
      apiLogger.error('Error updating payment', { error: updateError });
      return res.status(500).json({
        success: false,
        error: updateError.message,
        message: 'Failed to update payment',
      });
    }

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    apiLogger.info('Successfully updated payment', { id });

    return res.status(200).json({
      success: true,
      payment: updatedPayment as Payment,
      message: 'Payment updated successfully',
    });
  } catch (error) {
    apiLogger.error('Error in handlePut', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment',
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  supabase: ReturnType<typeof getServiceSupabase>
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Payment id is required as query parameter',
      });
    }

    apiLogger.info('Deleting payment', { id });

    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      apiLogger.error('Error deleting payment', { error: deleteError });
      return res.status(500).json({
        success: false,
        error: deleteError.message,
        message: 'Failed to delete payment',
      });
    }

    apiLogger.info('Successfully deleted payment', { id });

    return res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    apiLogger.error('Error in handleDelete', { error });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
    });
  }
}
