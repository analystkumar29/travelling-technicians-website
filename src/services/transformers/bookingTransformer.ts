import type { 
  BookingData, 
  CreateBookingRequest, 
  DeviceType, 
  BookingStatus,
  Appointment,
  Location
} from '../../types/booking';

/**
 * Transforms API booking data to the application's domain model
 * 
 * This function handles the conversion of snake_case API fields to 
 * the camelCase structured domain model, and normalizes field names
 * that may vary between API responses.
 */
export function normalizeBookingData(apiData: any): BookingData {
  // Handle potential missing data
  if (!apiData) {
    throw new Error('Cannot normalize empty booking data');
  }
  
  // Normalize the device type (handle 'tablet' mapping)
  const normalizedDeviceType = determineDeviceType(
    apiData.device_type,
    apiData.device_model
  );
  
  // Create the normalized booking data structure
  return {
    id: apiData.id,
    referenceNumber: apiData.reference_number,
    
    customer: {
      name: apiData.customer_name,
      email: apiData.customer_email,
      phone: apiData.customer_phone,
    },
    
    device: {
      type: normalizedDeviceType,
      brand: apiData.device_brand || '',
      model: apiData.device_model || '',
    },
    
    service: {
      type: apiData.service_type,
      description: apiData.issue_description,
    },
    
    appointment: {
      date: apiData.booking_date || apiData.appointment_date,
      time: apiData.booking_time || apiData.appointment_time,
      confirmed: apiData.status !== 'pending',
    } as Appointment,
    
    location: {
      address: apiData.address,
      postalCode: apiData.postal_code,
      city: apiData.city,
      province: apiData.province,
    } as Location,
    
    status: (apiData.status as BookingStatus) || 'pending',
    notes: apiData.notes,
    
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at,
    
    // Include technician info if available
    ...(apiData.technician_id ? {
      technician: {
        id: apiData.technician_id,
        name: apiData.technician_name || 'Assigned Technician',
        phone: apiData.technician_phone,
      }
    } : {})
  } as BookingData;
}

/**
 * Transforms the application's domain model to API format
 * 
 * This function is used when sending data to the API. It converts
 * the structured domain model to the flat snake_case format expected
 * by the API, and handles special cases like the tablet device type.
 */
export function denormalizeBookingData(bookingData: Partial<CreateBookingRequest>): Record<string, any> {
  // Handle tablet device type for API compatibility
  const apiDeviceType = bookingData.deviceType === 'tablet' ? 'mobile' : bookingData.deviceType;
  
  return {
    ...(bookingData.deviceType && { device_type: apiDeviceType }),
    ...(bookingData.deviceBrand && { device_brand: bookingData.deviceBrand }),
    ...(bookingData.deviceModel && { device_model: bookingData.deviceModel }),
    ...(bookingData.serviceType && { service_type: bookingData.serviceType }),
    ...(bookingData.issueDescription && { issue_description: bookingData.issueDescription }),
    
    ...(bookingData.appointmentDate && { booking_date: bookingData.appointmentDate }),
    ...(bookingData.appointmentTime && { booking_time: bookingData.appointmentTime }),
    
    ...(bookingData.customerName && { customer_name: bookingData.customerName }),
    ...(bookingData.customerEmail && { customer_email: bookingData.customerEmail }),
    ...(bookingData.customerPhone && { customer_phone: bookingData.customerPhone }),
    
    ...(bookingData.address && { address: bookingData.address }),
    ...(bookingData.postalCode && { postal_code: bookingData.postalCode }),
  };
}

/**
 * Determines the correct device type based on the API data
 * 
 * This handles the special case where tablets are stored as 'mobile'
 * in the database but need to be displayed as 'tablet' in the UI.
 */
function determineDeviceType(deviceType: string, deviceModel?: string): DeviceType {
  // If it's explicitly a tablet, return tablet
  if (deviceType === 'tablet') {
    return 'tablet';
  }
  
  // If it's a mobile device, check if it's actually a tablet
  if (deviceType === 'mobile' && deviceModel) {
    const modelLower = deviceModel.toLowerCase();
    if (
      modelLower.includes('ipad') ||
      modelLower.includes('tab') ||
      modelLower.includes('surface') ||
      modelLower.includes('tablet')
    ) {
      return 'tablet';
    }
  }
  
  // Otherwise return the original type or default to mobile
  return (deviceType as DeviceType) || 'mobile';
} 