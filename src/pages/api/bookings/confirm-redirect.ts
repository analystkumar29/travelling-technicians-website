import { NextApiRequest, NextApiResponse } from 'next';
import { format } from 'date-fns';
import { normalizeBookingData } from '@/services/transformers/bookingTransformer';
import { logger } from '@/utils/logger';

// Logger for this module
const apiLogger = logger.createModuleLogger('bookings/confirm-redirect');

/**
 * Format a time slot from "09-11" format to "9:00 AM - 11:00 AM"
 */
function formatTimeSlot(timeSlot: string): string {
  if (!timeSlot || !timeSlot.includes('-')) {
    return timeSlot || 'Time not available';
  }

  try {
    const [start, end] = timeSlot.split('-');
    const startHour = parseInt(start);
    const endHour = parseInt(end);
    
    if (isNaN(startHour) || isNaN(endHour)) {
      return timeSlot;
    }
    
    const startTime = startHour < 12 ? 
      `${startHour}:00 AM` : 
      `${startHour === 12 ? 12 : startHour - 12}:00 PM`;
      
    const endTime = endHour < 12 ? 
      `${endHour}:00 AM` : 
      `${endHour === 12 ? 12 : endHour - 12}:00 PM`;
      
    return `${startTime} - ${endTime}`;
  } catch (e) {
    apiLogger.error('Error formatting time slot', { timeSlot, error: e });
    return timeSlot || 'Time not available';
  }
}

/**
 * Format a date string to a user-friendly format
 */
function formatDate(dateStr: string): string {
  if (!dateStr) {
    return 'Date not available';
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing alternative format
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const newDate = new Date(year, month - 1, day);
        return format(newDate, 'EEEE, MMMM d, yyyy');
      }
      return dateStr;
    }
    return format(date, 'EEEE, MMMM d, yyyy');
  } catch (e) {
    apiLogger.error('Error formatting date', { dateStr, error: e });
    return dateStr || 'Date not available';
  }
}

/**
 * Get display name for a device type considering model name
 */
function getDeviceDisplay(deviceType: string, brand?: string, model?: string): string {
  if (!deviceType) return 'Device information not available';
  
  // Check for tablet first based on model name
  const modelLower = (model || '').toLowerCase();
  const isTablet = deviceType === 'tablet' || 
    (deviceType === 'mobile' && (
      modelLower.includes('tab') || 
      modelLower.includes('pad') ||
      modelLower.includes('ipad') ||
      modelLower.includes('surface')
    ));
  
  if (isTablet) {
    return `Tablet - ${brand || ''} ${model || ''}`.trim();
  }
  
  if (deviceType === 'mobile') {
    return `Mobile Phone - ${brand || ''} ${model || ''}`.trim();
  }
  
  if (deviceType === 'laptop') {
    return `Laptop - ${brand || ''} ${model || ''}`.trim();
  }
  
  return `${brand || ''} ${model || ''}`.trim() || 'Device information not available';
}

/**
 * Format service type from snake_case to display format
 */
function formatServiceType(serviceType: string): string {
  if (!serviceType) return 'Service information not available';
  
  return serviceType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      apiLogger.warn('Method not allowed', { method: req.method });
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const rawBookingData = req.body;
    if (!rawBookingData) {
      apiLogger.warn('No booking data provided');
      return res.status(400).json({ success: false, error: 'No booking data provided' });
    }

    apiLogger.info('Processing booking confirmation redirect', { 
      reference: rawBookingData.reference_number || 'Not provided'
    });

    // Normalize the booking data using our transformer
    const normalizedData = normalizeBookingData(rawBookingData);
    
    if (!normalizedData) {
      apiLogger.error('Failed to normalize booking data');
      return res.status(400).json({ success: false, error: 'Invalid booking data format' });
    }
    
    // Format date and time
    const formattedDate = formatDate(
      normalizedData.appointment.date
    );
    
    const formattedTime = formatTimeSlot(
      normalizedData.appointment.time
    );
    
    // Format device display name
    const deviceInfo = getDeviceDisplay(
      normalizedData.device.type,
      normalizedData.device.brand,
      normalizedData.device.model
    );
    
    // Format service type
    const serviceInfo = formatServiceType(normalizedData.service.type);
    
    // Format address
    const address = normalizedData.location.address || 'Address not provided';
    
    // Build the redirect URL with parameters
    const params = new URLSearchParams({
      ref: normalizedData.referenceNumber,
      device: deviceInfo,
      service: serviceInfo,
      date: formattedDate,
      time: formattedTime,
      address: address,
      email: normalizedData.customer.email
    });

    const redirectUrl = `/booking-confirmation?${params.toString()}`;
    
    apiLogger.info('Generated confirmation redirect', { 
      reference: normalizedData.referenceNumber, 
      redirectUrl 
    });

    return res.status(200).json({ 
      success: true, 
      redirectUrl 
    });
  } catch (error) {
    apiLogger.error('Error generating confirmation redirect', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate confirmation redirect',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 