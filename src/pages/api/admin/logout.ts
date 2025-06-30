import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';

// Create module logger
const authLogger = logger.createModuleLogger('AdminLogout');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    authLogger.debug('Admin logout requested');

    // Set cookie to expire immediately
    res.setHeader('Set-Cookie', 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    authLogger.error('Logout endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 