import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - fetch all services
  if (req.method === 'GET') {
    try {
      const deviceType = req.query.deviceType as string;
      const activeOnly = req.query.active === 'true';
      
      // Build filter conditions
      const where = {
        ...(deviceType && { deviceType }),
        ...(activeOnly && { active: true }),
      };
      
      const services = await prisma.service.findMany({
        where,
        orderBy: { name: 'asc' },
      });
      
      return res.status(200).json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
  }
  
  // POST - create a new service
  if (req.method === 'POST') {
    try {
      const { name, description, deviceType, basePrice, doorstepAvailable, estimatedTime } = req.body;
      
      // Basic validation
      if (!name || !deviceType || basePrice === undefined) {
        return res.status(400).json({ error: 'Name, deviceType, and basePrice are required' });
      }
      
      // Create new service
      const service = await prisma.service.create({
        data: {
          name,
          description,
          deviceType,
          basePrice: parseFloat(basePrice),
          doorstepAvailable: doorstepAvailable !== false, // Default to true
          estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : null,
          active: true,
        },
      });
      
      return res.status(201).json(service);
    } catch (error) {
      console.error('Error creating service:', error);
      return res.status(500).json({ error: 'Failed to create service' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 