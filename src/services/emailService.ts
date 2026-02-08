import { logger } from '@/utils/logger';

// Create module logger
const emailLogger = logger.createModuleLogger('emailService');

// Get the base URL for API calls
function getBaseUrl() {
  // Check if we're in a browser or server environment
  if (typeof window !== 'undefined') {
    // In browser, use relative URL
    return '';
  }
  // In server, use absolute URL based on environment variables or a default
  return process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
}

// Email service configuration
const EMAIL_API_PATH = '/api/send-confirmation';

// Types
export interface BookingConfirmationEmailData {
  to: string;
  name: string;
  referenceNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  quotedPrice?: number;
  pricingTier?: string;
}

/**
 * Formats a date string (YYYY-MM-DD) to a user-friendly format
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    // Format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (!year || !month || !day) {
      return dateString; // Return original if format doesn't match expected
    }
    
    // Create date object with UTC methods to completely eliminate timezone issues
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Convert to weekday, month day, year format using UTC date
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Force UTC timezone for consistent display
    }).format(date);
  } catch (e) {
    emailLogger.warn('Error formatting date', { dateString, error: e });
    return dateString; // Return the original string if formatting fails
  }
}

/**
 * Formats a time slot (e.g., "09-11") to a user-friendly format
 */
function formatTimeSlot(timeSlot: string): string {
  if (!timeSlot || !timeSlot.includes('-')) return timeSlot;
  
  const [start, end] = timeSlot.split('-');
  
  try {
    const startHour = parseInt(start, 10);
    const endHour = parseInt(end, 10);
    
    const startSuffix = startHour >= 12 ? 'PM' : 'AM';
    const endSuffix = endHour >= 12 ? 'PM' : 'AM';
    
    const formattedStart = startHour > 12 ? startHour - 12 : startHour;
    const formattedEnd = endHour > 12 ? endHour - 12 : endHour;
    
    return `${formattedStart}${startSuffix} - ${formattedEnd}${endSuffix}`;
  } catch (e) {
    emailLogger.warn('Error formatting time slot', { timeSlot, error: e });
    return timeSlot; // Return the original string if formatting fails
  }
}

/**
 * Sends a booking confirmation email to the customer
 */
export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData): Promise<boolean> {
  try {
    emailLogger.info('Sending booking confirmation email', { 
      to: data.to,
      reference: data.referenceNumber
    });
    
    // Format date and time for better readability
    const formattedDate = formatDate(data.appointmentDate);
    const formattedTime = formatTimeSlot(data.appointmentTime);
    
    // Create formatted address if address components are available
    const fullAddress = data.address ? 
      `${data.address}, ${data.city || ''} ${data.postalCode || ''} ${data.province || ''}`.trim() : 
      '';
    
    // Prepare email data for SendGrid
    const emailData = {
      to: data.to,
      name: data.name,
      bookingReference: data.referenceNumber,
      bookingDate: formattedDate,
      bookingTime: formattedTime,
      service: data.service,
      deviceType: data.deviceType || 'mobile', // Use provided device type or default to mobile
      brand: data.deviceBrand, // Add brand information
      model: data.deviceModel, // Add model information
      address: fullAddress, // Add the formatted address to the email data
      quotedPrice: data.quotedPrice,
      pricingTier: data.pricingTier,
    };
    
    // Get the proper base URL depending on environment
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}${EMAIL_API_PATH}`;
    
    emailLogger.debug('Making API request to send email', { 
      url: fullUrl,
      isServer: typeof window === 'undefined'
    });
    
    // Log environment check (client-side may not have access to server env vars)
    const clientSideEnvCheck = process.env.SENDGRID_API_KEY;
    emailLogger.info('🔍 EMAIL SERVICE - Environment Check', {
      isServer: typeof window === 'undefined',
      clientSideHasSendGrid: !!clientSideEnvCheck,
      sendGridKeyPrefix: clientSideEnvCheck ? clientSideEnvCheck.substring(0, 3) + '...' : 'undefined',
      to: data.to,
      reference: data.referenceNumber
    });
    
    // Don't do client-side environment check - let the server API handle it
    emailLogger.info('🚀 EMAIL SERVICE - Proceeding to call email API endpoint', {
      url: fullUrl,
      emailData: {
        ...emailData,
        to: '[REDACTED]'
      }
    });
    
    // Send the email using the API with full URL
    emailLogger.info('🌐 EMAIL SERVICE - Making API request', {
      url: fullUrl,
      method: 'POST',
      dataKeys: Object.keys(emailData),
      reference: data.referenceNumber
    });

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    emailLogger.info('📡 EMAIL SERVICE - API response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      reference: data.referenceNumber,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      emailLogger.error('❌ EMAIL SERVICE - API error response', {
        status: response.status,
        errorData,
        reference: data.referenceNumber
      });
      throw new Error(errorData.message || `Email API responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    emailLogger.info('✅ EMAIL SERVICE - API success response', { 
      reference: data.referenceNumber,
      success: result.success,
      message: result.message,
      sentTo: result.sentTo,
      hasDebugInfo: !!result.debug,
      fullResult: result
    });
    
    return true;
  } catch (error) {
    emailLogger.error('Failed to send confirmation email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      to: data.to,
      reference: data.referenceNumber
    });
    
    return false;
  }
} 