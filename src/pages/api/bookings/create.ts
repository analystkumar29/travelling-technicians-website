import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for bookings (for development)
const bookings: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      bookingReference,
      deviceType,
      brand,
      model,
      serviceType,
      issueDescription,
      address,
      postalCode,
      appointmentDate,
      appointmentTime,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    // Validate required fields
    if (!bookingReference || !deviceType || !serviceType || !appointmentDate || !appointmentTime || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create booking object
    const booking = {
      id: bookings.length + 1,
      reference: bookingReference,
      status: 'PENDING',
      device: {
        type: deviceType,
        brand,
        model,
      },
      service: {
        name: serviceType,
        deviceType,
        description: issueDescription || '',
      },
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      address: {
        fullAddress: address,
        postalCode,
        country: 'Canada',
      },
      bookingDate: appointmentDate,
      timeSlot: appointmentTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store booking in memory
    bookings.push(booking);

    return res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
} 