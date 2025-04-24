import type { NextApiRequest, NextApiResponse } from 'next';

type VerificationData = {
  token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token }: VerificationData = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification token is required' 
      });
    }

    // In a production environment, you would:
    // 1. Query your database for the booking with this token
    // 2. Check if the token is valid and not expired
    // 3. Mark the booking as verified in your database
    
    // For demo purposes, we'll simulate a successful verification
    // with a simple validation check
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple token validation (in production, you'd check against database)
    if (token.startsWith('TT') && token.length >= 10) {
      // Successful verification
      return res.status(200).json({ 
        success: true,
        message: 'Booking has been successfully verified',
        bookingId: token
      });
    } else {
      // Failed verification
      return res.status(400).json({ 
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    /* In a production implementation:
    
    // Check if booking exists and token is valid
    const booking = await prisma.booking.findUnique({
      where: {
        verificationToken: token,
      },
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found or verification token is invalid' 
      });
    }
    
    // Check if token is expired (e.g., 24-hour expiry)
    const tokenCreatedAt = new Date(booking.tokenCreatedAt);
    const now = new Date();
    const tokenAgeHours = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);
    
    if (tokenAgeHours > 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification token has expired' 
      });
    }
    
    // Mark booking as verified
    await prisma.booking.update({
      where: { id: booking.id },
      data: { 
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
    
    return res.status(200).json({ 
      success: true,
      message: 'Booking has been successfully verified',
      bookingId: booking.id
    });
    */
    
  } catch (error) {
    console.error('Error verifying booking:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An unexpected error occurred during verification' 
    });
  }
} 