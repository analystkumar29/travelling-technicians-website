import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // For non-API routes, just continue with the request
  // CORS handling is configured in vercel.json
  return NextResponse.next();
}

// Configure the middleware to run only for API routes and OPTIONS requests
export const config = {
  matcher: [
    '/api/:path*', // Apply to all API routes
    {
      source: '/(.*)',
      has: [
        {
          type: 'header',
          key: 'Access-Control-Request-Method', // Match preflight OPTIONS requests
        },
      ],
    },
  ],
}; 