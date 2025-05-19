import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Authentication Middleware
 * 
 * This middleware handles authentication validation during navigation.
 * It verifies that protected routes are only accessible with valid auth,
 * and ensures auth state doesn't become corrupted during navigation.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req, res });
    
    // Verify session is valid during navigation
    const { data: { session } } = await supabase.auth.getSession();
  
    // Get path from URL
    const path = req.nextUrl.pathname;
    
    // Define protected paths that require authentication
    const protectedPaths = [
      '/account',
      '/my-bookings',
      '/my-warranties',
      '/profile',
    ];
    
    // Check if current path is protected
    const isProtectedPath = protectedPaths.some(protectedPath => 
      path.startsWith(protectedPath) || path === protectedPath
    );

    // If path is protected but user is not authenticated, redirect to login
    if (isProtectedPath && !session) {
      // Store intended path for redirect after login
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', path);
      
      return NextResponse.redirect(redirectUrl);
    }
    
    // If user is authenticated but session is invalid, redirect to error page
    if (session && !session.user?.id) {
      // Session is corrupted - redirect to error page with reset option
      const errorUrl = new URL('/auth/error', req.url);
      errorUrl.searchParams.set('error', 'invalid_session');
      errorUrl.searchParams.set('action', 'reset');
      
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    
    // If there's an error in the middleware, don't block navigation
    // but add a header to indicate the auth check failed
    const response = NextResponse.next();
    response.headers.set('x-auth-validation-failed', 'true');
    return response;
  }
  
  return res;
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all pages except static assets, api routes, and auth-related pages
    '/((?!_next/static|_next/image|favicon.ico|api/public|auth/callback|images|favicons).*)',
  ],
}; 