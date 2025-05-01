import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // // Get the origin from the request headers
  // const origin = request.headers.get('origin') || '';
  
  // // Define allowed origins
  // const allowedOrigins = [
  //   'https://www.travelling-technicians.ca',
  //   'https://travelling-technicians.ca',
  //   'https://travelling-technicians-website-ig9shgpxi.vercel.app',
  //   'https://travelling-technicians-website-eio8ugrye.vercel.app',
  //   'http://localhost:3000'
  // ];
  
  // // Check if the request is for an API route
  // if (request.nextUrl.pathname.startsWith('/api/')) {
  //   // Create a response object to modify
  //   const response = NextResponse.next();
    
  //   // Set CORS headers for API routes
  //   response.headers.set('Access-Control-Allow-Credentials', 'true');
    
  //   // If the origin is in our allowed list, set it as the allowed origin
  //   // Otherwise, allow any origin with '*'
  //   if (allowedOrigins.includes(origin)) {
  //     response.headers.set('Access-Control-Allow-Origin', origin);
  //   } else {
  //     response.headers.set('Access-Control-Allow-Origin', '*');
  //   }
    
  //   // Set other CORS headers
  //   response.headers.set(
  //     'Access-Control-Allow-Methods',
  //     'GET, POST, PUT, DELETE, OPTIONS'
  //   );
  //   response.headers.set(
  //     'Access-Control-Allow-Headers',
  //     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  //   );
    
  //   // If it's an OPTIONS request (preflight), return a 200 response immediately
  //   if (request.method === 'OPTIONS') {
  //     return new NextResponse(null, {
  //       status: 200,
  //       headers: response.headers,
  //     });
  //   }
    
  //   return response;
  // }
  
  // For non-API routes, just continue with the request
  // This middleware currently does nothing if the above is commented out,
  // but we leave the structure in case other middleware logic is needed later.
  return NextResponse.next();
}

// Configure the middleware to run only for API routes and OPTIONS requests
export const config = {
  matcher: [
    '/api/:path*', // Apply to all API routes
    // The following complex matcher might not be necessary if vercel.json handles OPTIONS
    // We can simplify this if issues persist
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