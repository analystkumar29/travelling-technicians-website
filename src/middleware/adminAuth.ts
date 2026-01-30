/**
 * Admin Authentication Middleware
 * 
 * Protects admin API endpoints by verifying JWT tokens
 * Must be used with endpoints that require admin privileges
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/pages/api/management/login';
import { logger } from '@/utils/logger';

const authLogger = logger.createModuleLogger('adminAuth');

/**
 * Authentication result from token verification
 */
export interface AuthResult {
  isAuthenticated: boolean;
  username?: string;
  isAdmin?: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Extract and verify JWT token from request
 */
export function verifyAdminToken(req: NextApiRequest): AuthResult {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      authLogger.debug('No Authorization header provided');
      return {
        isAuthenticated: false,
        error: 'Authorization header required',
        statusCode: 401
      };
    }

    // Check Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      authLogger.debug('Invalid Authorization header format');
      return {
        isAuthenticated: false,
        error: 'Bearer token required',
        statusCode: 401
      };
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token || token.trim() === '') {
      authLogger.debug('Empty token provided');
      return {
        isAuthenticated: false,
        error: 'Token cannot be empty',
        statusCode: 401
      };
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      authLogger.debug('Invalid or expired token');
      return {
        isAuthenticated: false,
        error: 'Invalid or expired token',
        statusCode: 401
      };
    }

    // Verify admin privileges
    if (!decoded.isAdmin) {
      authLogger.debug(`User ${decoded.username} is not an admin`);
      return {
        isAuthenticated: false,
        username: decoded.username,
        error: 'Admin privileges required',
        statusCode: 403
      };
    }

    authLogger.debug(`Authenticated admin user: ${decoded.username}`);
    
    return {
      isAuthenticated: true,
      username: decoded.username,
      isAdmin: decoded.isAdmin
    };

  } catch (error) {
    authLogger.error('Token verification error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication error',
      statusCode: 500
    };
  }
}

/**
 * Higher-order function to wrap API handlers with admin authentication
 */
export function requireAdminAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Verify authentication
    const authResult = verifyAdminToken(req);
    
    if (!authResult.isAuthenticated) {
      // Log failed attempt
      const clientIP = req.headers['x-forwarded-for'] as string || 
                      req.headers['x-real-ip'] as string || 
                      req.connection.remoteAddress || 
                      'unknown';
      
      authLogger.warn(`Unauthorized access attempt from IP: ${clientIP}`, {
        error: authResult.error,
        path: req.url,
        method: req.method
      });

      // Return appropriate error response
      return res.status(authResult.statusCode || 401).json({
        success: false,
        error: authResult.error || 'Authentication required',
        message: 'Admin authentication required'
      });
    }

    // Add user info to request object for handler use
    (req as any).user = {
      username: authResult.username,
      isAdmin: authResult.isAdmin
    };

    // Proceed to the actual handler
    return handler(req, res);
  };
}

/**
 * Middleware function for use in API routes
 * Can be used directly instead of the higher-order function
 */
export default function adminAuthMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const authResult = verifyAdminToken(req);
  
  if (!authResult.isAuthenticated) {
    // Log failed attempt
    const clientIP = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string || 
                    req.connection.remoteAddress || 
                    'unknown';
    
    authLogger.warn(`Unauthorized access attempt from IP: ${clientIP}`, {
      error: authResult.error,
      path: req.url,
      method: req.method
    });

    return res.status(authResult.statusCode || 401).json({
      success: false,
      error: authResult.error || 'Authentication required',
      message: 'Admin authentication required'
    });
  }

  // Add user info to request object
  (req as any).user = {
    username: authResult.username,
    isAdmin: authResult.isAdmin
  };

  next();
}

/**
 * Utility function to check if user is authenticated (for conditional logic)
 */
export function isAdminAuthenticated(req: NextApiRequest): boolean {
  const authResult = verifyAdminToken(req);
  return authResult.isAuthenticated;
}

/**
 * Get authenticated user info (for use in handlers)
 */
export function getAuthenticatedUser(req: NextApiRequest): { username: string; isAdmin: boolean } | null {
  const authResult = verifyAdminToken(req);
  
  if (authResult.isAuthenticated && authResult.username && authResult.isAdmin) {
    return {
      username: authResult.username,
      isAdmin: authResult.isAdmin
    };
  }
  
  return null;
}