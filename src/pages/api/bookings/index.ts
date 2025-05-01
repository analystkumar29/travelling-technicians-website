import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for bookings (shared with create.ts)
declare global {
  var bookings: any[];
}

if (!global.bookings) {
  global.bookings = [];
}

// Helper function to generate a unique reference code
function generateReferenceCode(): string {
  const prefix = 'TT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Return all bookings
      return res.status(200).json({
        success: true,
        bookings: global.bookings,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 