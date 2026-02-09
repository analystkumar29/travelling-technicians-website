/**
 * Technician Authentication Middleware (Server-Side)
 * Mirrors src/middleware/adminAuth.ts pattern
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

const techAuthLogger = logger.createModuleLogger('technicianAuth');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

export interface TechnicianTokenPayload {
  technicianId: string;
  role: 'technician';
  name: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT for technician sessions
 */
export function generateTechnicianToken(technicianId: string, name: string, rememberMe = false): string {
  if (!ADMIN_JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET environment variable is required');
  }

  const expDays = rememberMe ? 90 : 30;

  const payload: TechnicianTokenPayload = {
    technicianId,
    role: 'technician',
    name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expDays * 24 * 60 * 60),
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', ADMIN_JWT_SECRET)
    .update(`${header}.${payloadB64}`)
    .digest('base64url');

  return `${header}.${payloadB64}.${signature}`;
}

/**
 * Verify technician JWT token
 */
export function verifyTechnicianToken(token: string): TechnicianTokenPayload | null {
  if (!ADMIN_JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET environment variable is required');
  }

  try {
    const [header, payload, signature] = token.split('.');

    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as TechnicianTokenPayload;

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (decoded.role !== 'technician') {
      return null;
    }

    return decoded;
  } catch (error) {
    techAuthLogger.error('Technician token verification error:', error);
    return null;
  }
}

/**
 * Higher-order function to wrap API handlers with technician authentication
 */
export function requireTechnicianAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    if (!token || token.trim() === '') {
      return res.status(401).json({ error: 'Token cannot be empty' });
    }

    const decoded = verifyTechnicianToken(token);

    if (!decoded) {
      const clientIP = req.headers['x-forwarded-for'] as string ||
        req.headers['x-real-ip'] as string ||
        req.connection?.remoteAddress ||
        'unknown';

      techAuthLogger.warn(`Unauthorized technician access attempt from IP: ${clientIP}`, {
        path: req.url,
        method: req.method
      });

      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach technician info to request
    (req as any).technician = decoded;

    return handler(req, res);
  };
}
