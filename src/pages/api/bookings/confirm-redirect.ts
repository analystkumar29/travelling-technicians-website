import { NextApiRequest, NextApiResponse } from 'next';
import { format } from 'date-fns';
import { getServiceDisplay } from '../../../utils/serviceHelpers';

type BookingData = {
  id?: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  province?: string;
  notes?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const bookingData: BookingData = req.body;
    if (!bookingData) {
      return res.status(400).json({ success: false, error: 'No booking data provided' });
    }

    // Format date
    let formattedDate = '';
    try {
      const dateParts = bookingData.appointment_date.split('-');
      const dateObj = new Date(
        parseInt(dateParts[0]), 
        parseInt(dateParts[1]) - 1, 
        parseInt(dateParts[2])
      );
      formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      formattedDate = bookingData.appointment_date;
    }

    // Format time
    let formattedTime = '';
    try {
      const [start, end] = bookingData.appointment_time.split('-');
      const startTime = parseInt(start) < 12 ? 
        `${parseInt(start)}:00 AM` : 
        `${parseInt(start) === 12 ? 12 : parseInt(start) - 12}:00 PM`;
      const endTime = parseInt(end) < 12 ? 
        `${parseInt(end)}:00 AM` : 
        `${parseInt(end) === 12 ? 12 : parseInt(end) - 12}:00 PM`;
      formattedTime = `${startTime} - ${endTime}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      formattedTime = bookingData.appointment_time;
    }

    // Format device info
    let deviceInfo = '';
    if (bookingData.device_type === 'tablet' || 
        (bookingData.device_type === 'mobile' && 
         (bookingData.device_model.toLowerCase().includes('tab') || 
          bookingData.device_model.toLowerCase().includes('pad') ||
          bookingData.device_model.toLowerCase().includes('ipad') ||
          bookingData.device_model.toLowerCase().includes('surface')))) {
      deviceInfo = `Tablet - ${bookingData.device_brand} ${bookingData.device_model}`;
    } else if (bookingData.device_type === 'mobile') {
      deviceInfo = `Mobile Phone - ${bookingData.device_brand} ${bookingData.device_model}`;
    } else if (bookingData.device_type === 'laptop') {
      deviceInfo = `Laptop - ${bookingData.device_brand} ${bookingData.device_model}`;
    } else {
      deviceInfo = `${bookingData.device_brand} ${bookingData.device_model}`;
    }

    // Format service info
    let serviceInfo = '';
    try {
      serviceInfo = getServiceDisplay(bookingData.service_type);
    } catch (e) {
      console.error('Error formatting service:', e);
      // Fallback formatting
      serviceInfo = bookingData.service_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Format address
    let address = '';
    if (bookingData.street_address) {
      address = `${bookingData.street_address}`;
      if (bookingData.city) address += `, ${bookingData.city}`;
      if (bookingData.province) address += `, ${bookingData.province}`;
      if (bookingData.postal_code) address += `, ${bookingData.postal_code}`;
      if (!address) address = 'Address information not provided';
    }

    // Generate a simple reference number
    const reference = `TTR-${Date.now().toString().substring(5)}-${Math.floor(Math.random() * 1000)}`;

    // Build the redirect URL with parameters
    const params = new URLSearchParams({
      ref: reference,
      device: deviceInfo,
      service: serviceInfo,
      date: formattedDate,
      time: formattedTime,
      address: address,
      email: bookingData.customer_email
    });

    const redirectUrl = `/confirmation.html?${params.toString()}`;
    
    return res.status(200).json({ 
      success: true, 
      redirectUrl 
    });
  } catch (error) {
    console.error('Error in confirm-redirect:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate confirmation redirect',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 