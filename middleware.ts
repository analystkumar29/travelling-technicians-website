import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow admin routes to pass through without authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
} 