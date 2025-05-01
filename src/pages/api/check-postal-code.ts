import { NextApiRequest, NextApiResponse } from 'next';

interface ServiceArea {
  postalCode: string;
  city: string;
  province: string;
  isServiceable: boolean;
}

// Hardcoded service areas for development
const serviceAreas: ServiceArea[] = [
  { postalCode: 'V5H', city: 'Burnaby', province: 'BC', isServiceable: true },
  { postalCode: 'V5J', city: 'Burnaby', province: 'BC', isServiceable: true },
  { postalCode: 'V3N', city: 'Burnaby', province: 'BC', isServiceable: true },
  { postalCode: 'V6E', city: 'Vancouver', province: 'BC', isServiceable: true },
  { postalCode: 'V6G', city: 'Vancouver', province: 'BC', isServiceable: true },
  { postalCode: 'V6H', city: 'Vancouver', province: 'BC', isServiceable: true },
  { postalCode: 'V3V', city: 'Surrey', province: 'BC', isServiceable: true },
  { postalCode: 'V3W', city: 'Surrey', province: 'BC', isServiceable: true },
  { postalCode: 'V7L', city: 'North Vancouver', province: 'BC', isServiceable: true },
  { postalCode: 'V7M', city: 'North Vancouver', province: 'BC', isServiceable: true },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Postal code is required' });
    }
    
    // Format postal code (remove spaces, uppercase)
    const formattedCode = code.replace(/\s+/g, '').toUpperCase();
    const prefix = formattedCode.substring(0, 3);
    
    // Check if the postal code prefix is in our service area
    const serviceArea: ServiceArea | undefined = serviceAreas.find(area => area.postalCode === prefix);
    
    if (serviceArea) {
      return res.status(200).json({
        isServiceable: true,
        city: serviceArea.city,
        province: serviceArea.province,
        message: `We service ${serviceArea.city}!`,
      });
    }
    
    // If not found, return without nearby areas since we don't have a matching city
    return res.status(200).json({
      isServiceable: false,
      message: 'Sorry, we don\'t service this area yet.',
    });
    
  } catch (error) {
    console.error('Error checking postal code:', error);
    return res.status(500).json({ error: 'Failed to check postal code' });
  }
} 