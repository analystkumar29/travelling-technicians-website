import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - fetch all service areas
  if (req.method === 'GET') {
    try {
      const serviceAreas = await prisma.serviceArea.findMany({
        where: {
          active: true,
        },
        include: {
          postalCodes: {
            where: {
              active: true,
            },
            select: {
              code: true,
            },
          },
        },
        orderBy: {
          city: 'asc',
        },
      });
      
      return res.status(200).json(serviceAreas);
    } catch (error) {
      console.error('Error fetching service areas:', error);
      return res.status(500).json({ error: 'Failed to fetch service areas' });
    }
  }
  
  // POST - create a new service area
  if (req.method === 'POST') {
    try {
      const { city, province, postalCodes } = req.body;
      
      // Basic validation
      if (!city) {
        return res.status(400).json({ error: 'City is required' });
      }
      
      // Create new service area
      const serviceArea = await prisma.serviceArea.create({
        data: {
          city,
          province: province || 'BC',
          postalCodes: {
            create: postalCodes ? postalCodes.map((code: string) => ({
              code: code.replace(/\s+/g, '').toUpperCase(), // Remove spaces and convert to uppercase
              active: true,
            })) : [],
          },
        },
        include: {
          postalCodes: true,
        },
      });
      
      return res.status(201).json(serviceArea);
    } catch (error) {
      console.error('Error creating service area:', error);
      return res.status(500).json({ error: 'Failed to create service area' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 