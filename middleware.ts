import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Token verification function (duplicated from login API for middleware use)
function verifyToken(token: string): { username: string; isAdmin: boolean } | null {
  const JWT_SECRET = process.env.JWT_SECRET || process.env.BOOKING_VERIFICATION_SECRET;
  
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is required');
    return null;
  }
  
  try {
    const [header, payload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
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
    console.error('Token verification error:', error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  console.log('🔍 MIDDLEWARE CALLED:', request.nextUrl.pathname);
  
  // Test if middleware works at all
  if (request.nextUrl.pathname === '/test-middleware') {
    console.log('🧪 TEST MIDDLEWARE TRIGGERED');
    return NextResponse.json({ message: 'Middleware is working!' });
  }
  
  // Secure management routes with authentication check
  if (request.nextUrl.pathname.startsWith('/management')) {
    console.log('🔒 MANAGEMENT ROUTE DETECTED:', request.nextUrl.pathname);
    // Check for authentication token in cookies or headers
    const authToken = request.cookies.get('auth-token')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token, redirect to login
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify the token is valid and not expired
    const tokenData = verifyToken(authToken);
    if (!tokenData || !tokenData.isAdmin) {
      // Invalid or expired token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      loginUrl.searchParams.set('error', 'session_expired');
      
      // Clear the invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
    
    // Token is valid, allow access to management routes
    console.log(`Management access granted to: ${tokenData.username}`);
  }
  
  // Security headers for all routes
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 