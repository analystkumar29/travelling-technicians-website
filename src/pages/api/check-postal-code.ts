import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Postal code is required' });
  }
  
  try {
    // Format the postal code (remove spaces, convert to uppercase)
    const formattedCode = (code as string).replace(/\s+/g, '').toUpperCase();
    
    // Check if the postal code exists and is active
    const postalCode = await prisma.postalCode.findFirst({
      where: {
        code: formattedCode,
        active: true,
      },
      include: {
        serviceArea: {
          select: {
            city: true,
            province: true,
            active: true,
          },
        },
      },
    });
    
    // Check if postal code exists and service area is active
    if (postalCode && postalCode.serviceArea.active) {
      return res.status(200).json({
        isServiceable: true,
        postalCode: formattedCode,
        city: postalCode.serviceArea.city,
        province: postalCode.serviceArea.province,
      });
    }
    
    // Check if any postal code in our database starts with the same first 3 characters (FSA)
    if (formattedCode.length >= 3) {
      const fsa = formattedCode.substring(0, 3);
      const similarPostalCodes = await prisma.postalCode.findMany({
        where: {
          code: {
            startsWith: fsa,
          },
          active: true,
          serviceArea: {
            active: true,
          },
        },
        include: {
          serviceArea: {
            select: {
              city: true,
            },
          },
        },
        take: 5, // Limit to 5 results
      });
      
      if (similarPostalCodes.length > 0) {
        return res.status(200).json({
          isServiceable: false,
          message: "This exact postal code is not in our service area, but we serve nearby areas.",
          similarAreas: similarPostalCodes.map(pc => ({
            postalCode: pc.code,
            city: pc.serviceArea.city,
          })),
        });
      }
    }
    
    // No matches found
    return res.status(200).json({
      isServiceable: false,
      message: "Sorry, we don't currently service this area.",
    });
    
  } catch (error) {
    console.error('Error checking postal code:', error);
    return res.status(500).json({ error: 'Failed to check postal code' });
  }
} 