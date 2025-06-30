import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

// Create module logger
const authLogger = logger.createModuleLogger('AdminAuth');

// Environment variables for admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

// Rate limiting storage (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Clean up old attempts (run every hour)
setInterval(() => {
  const now = Date.now();
  Array.from(loginAttempts.entries()).forEach(([ip, data]) => {
    if (now - data.lastAttempt > 60 * 60 * 1000) { // 1 hour
      loginAttempts.delete(ip);
    }
  });
}, 60 * 60 * 1000);

/**
 * Hash password with salt for secure storage
 */
function hashPassword(password: string, salt: string = ''): string {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash
 */
function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  const newHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === newHash;
}

/**
 * Generate JWT-like token for admin sessions
 */
function generateToken(username: string): string {
  if (!ADMIN_JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET environment variable is required');
  }
  
  const payload = {
    username,
    isAdmin: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
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
 * Verify JWT-like token
 */
function verifyToken(token: string): { username: string; isAdmin: boolean } | null {
  if (!ADMIN_JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET environment variable is required');
  }
  
  try {
    const [header, payload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      username: decodedPayload.username,
      isAdmin: decodedPayload.isAdmin
    };
  } catch (error) {
    authLogger.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check rate limiting for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  
  // Reset if more than 15 minutes passed
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  const maxAttempts = 5;
  const allowed = attempts.count < maxAttempts;
  
  return {
    allowed,
    remaining: Math.max(0, maxAttempts - attempts.count)
  };
}

/**
 * Record failed login attempt
 */
function recordFailedAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(ip, attempts);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { username, password } = req.body;
    
    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string || 
                    req.connection.remoteAddress || 
                    'unknown';

    authLogger.debug(`Login attempt from IP: ${clientIP}`);

    // Check rate limiting
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      authLogger.debug(`Rate limit exceeded for IP: ${clientIP}`);
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please wait 15 minutes.',
        remaining: rateLimit.remaining
      });
    }

    // Validate input
    if (!username || !password) {
      recordFailedAttempt(clientIP);
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check credentials
    if (username !== ADMIN_USERNAME) {
      recordFailedAttempt(clientIP);
      authLogger.debug(`Invalid username attempt: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If no password hash is set, use default for development
    if (!ADMIN_PASSWORD_HASH) {
      authLogger.debug('No ADMIN_PASSWORD_HASH set, using default password');
      if (password !== 'admin123') {
        recordFailedAttempt(clientIP);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } else {
      // Verify against stored hash
      if (!verifyPassword(password, ADMIN_PASSWORD_HASH)) {
        recordFailedAttempt(clientIP);
        authLogger.debug('Password verification failed');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Generate authentication token
    const token = generateToken(username);
    
    authLogger.debug(`Successful login for user: ${username}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username,
        isAdmin: true
      }
    });

  } catch (error) {
    authLogger.error('Login endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Export helper functions for use in middleware
export { verifyToken, hashPassword }; 