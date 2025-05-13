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
      address: fullAddress // Add the formatted address to the email data
    };
    
    // Get the proper base URL depending on environment
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}${EMAIL_API_PATH}`;
    
    emailLogger.debug('Making API request to send email', { 
      url: fullUrl,
      isServer: typeof window === 'undefined'
    });
    
    // Send the email using the API with full URL
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Email API responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    emailLogger.info('Email sent successfully', { 
      reference: data.referenceNumber,
      success: result.success
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