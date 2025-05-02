/**
 * Utility functions for formatting booking-related data
 */

/**
 * Format a time slot from format like "09-11" to "9:00 AM - 11:00 AM"
 */
export function formatTimeSlot(timeSlot: string): string {
  if (!timeSlot || !timeSlot.includes('-')) {
    return timeSlot || '';
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
    console.error('Error formatting time slot:', e);
    return timeSlot;
  }
}

/**
 * Format a service type from snake_case to Title Case
 */
export function formatServiceType(serviceType: string): string {
  if (!serviceType) return '';
  
  return serviceType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get a display name for a device type, considering brand and model
 */
export function getDeviceTypeDisplay(deviceType: string, brand?: string, model?: string): string {
  if (!deviceType) return '';
  
  const brandStr = brand ? `${brand} ` : '';
  const modelStr = model || '';
  
  // Check if it's a tablet based on model name
  if (deviceType === 'mobile' && model && 
      (model.toLowerCase().includes('ipad') || 
       model.toLowerCase().includes('tab') || 
       model.toLowerCase().includes('surface'))) {
    return `Tablet - ${brandStr}${modelStr}`;
  }
  
  const deviceTypeDisplay = deviceType === 'mobile' 
    ? 'Mobile Phone' 
    : deviceType === 'laptop' 
      ? 'Laptop' 
      : deviceType === 'tablet' 
        ? 'Tablet' 
        : deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  
  return `${deviceTypeDisplay} - ${brandStr}${modelStr}`.trim();
}

/**
 * Format a date string to a user-friendly format (Month Day, Year)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr;
  }
}

/**
 * Format a reference number with proper spacing
 */
export function formatReferenceNumber(reference: string): string {
  if (!reference) return '';
  
  // For references like TTR-123456-789, add spaces
  if (reference.includes('-')) {
    return reference;
  }
  
  // For references like TT12345678, add dashes
  if (reference.length >= 10 && reference.startsWith('TT')) {
    return `${reference.substring(0, 2)}-${reference.substring(2, 8)}-${reference.substring(8)}`;
  }
  
  return reference;
} 