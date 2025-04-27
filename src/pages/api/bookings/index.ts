import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

// Helper function to generate a unique reference code
function generateReferenceCode(): string {
  const timestamp = Date.now().toString();
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TT${timestamp.slice(-5)}${randomPart}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - fetch all bookings (with filtering)
  if (req.method === 'GET') {
    try {
      const { status, userId, serviceId, date } = req.query;
      
      // Build filter conditions
      const where = {
        ...(status && { status: status as string }),
        ...(userId && { userId: parseInt(userId as string, 10) }),
        ...(serviceId && { serviceId: parseInt(serviceId as string, 10) }),
        ...(date && { bookingDate: new Date(date as string) }),
      };
      
      const bookings = await prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              name: true,
              deviceType: true,
              basePrice: true,
            },
          },
          device: {
            select: {
              brand: true,
              model: true,
            },
          },
        },
        orderBy: { bookingDate: 'desc' },
      });
      
      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }
  
  // POST - create a new booking
  if (req.method === 'POST') {
    try {
      const {
        userId,
        serviceId,
        deviceId,
        address,
        postalCode,
        city,
        province,
        bookingDate,
        bookingTimeSlot,
        notes,
        issue,
      } = req.body;
      
      // Basic validation
      if (!userId || !serviceId || !address || !postalCode || !city || !bookingDate || !bookingTimeSlot) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: 'userId, serviceId, address, postalCode, city, bookingDate, bookingTimeSlot'
        });
      }
      
      // Generate a unique reference code
      const referenceCode = generateReferenceCode();
      
      // Create new booking
      const booking = await prisma.booking.create({
        data: {
          referenceCode,
          userId: parseInt(userId, 10),
          serviceId: parseInt(serviceId, 10),
          deviceId: deviceId ? parseInt(deviceId, 10) : undefined,
          address,
          postalCode,
          city,
          province: province || 'BC',
          bookingDate: new Date(bookingDate),
          bookingTimeSlot,
          status: 'pending',
          notes,
          issue,
        },
        include: {
          service: {
            select: {
              name: true,
              basePrice: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      
      return res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 