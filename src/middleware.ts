import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Import compatible version for @supabase/auth-helpers-nextjs 0.10.0
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Authentication Middleware
 * 
 * This middleware handles authentication validation during navigation.
 * It verifies that protected routes are only accessible with valid auth,
 * and ensures auth state doesn't become corrupted during navigation.
 */
export async function middleware(req: NextRequest) {
  // Create initial response
  const res = NextResponse.next();
  
  try {
    // Get hostname and environment info
    const hostname = req.headers.get('host') || '';
    const isDevEnvironment = process.env.NODE_ENV === 'development';
    
    // Create Supabase client for middleware (with older API format)
    const supabase = createMiddlewareSupabaseClient({ req, res });
    
    // Get session using supabase client
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Middleware auth error:', error.message);
      res.headers.set('x-auth-error', error.message);
    }
    
    // Get cookie values directly instead of using .value property
    const ttAuthCheck = req.cookies.get('tt_auth_check');
    const ttCrossDomain = req.cookies.get('tt_cross_domain');
    
    const hasAuthCookie = ttAuthCheck === 'true';
    const hasAuthDomainInStorage = ttCrossDomain === 'true';
    
    // Get path from URL
    const path = req.nextUrl.pathname;
    
    // Define protected paths
    const protectedPaths = [
      '/account',
      '/my-bookings',
      '/my-warranties',
      '/profile',
    ];
    
    // Check if path is protected
    const isProtectedPath = protectedPaths.some(protectedPath => 
      path.startsWith(protectedPath) || path === protectedPath
    );

    // Handle protected paths
    if (isProtectedPath) {
      const isAuthenticated = (session && session.user?.id) || 
                              (hasAuthCookie && hasAuthDomainInStorage);
      
      if (!isAuthenticated) {
        console.log(`Middleware: Protected path ${path} accessed without valid session, redirecting to login`);
        
        // Redirect to login
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirect', path);
        
        // Set debug cookie
        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.cookies.set('auth_redirect_reason', 'protected_path_access', {
          path: '/',
          secure: !isDevEnvironment,
          httpOnly: false,
          maxAge: 60 * 5 // 5 minutes
        });
        
        // Set domain for non-dev environments
        if (!isDevEnvironment && !hostname.includes('vercel.app')) {
          redirectResponse.cookies.set('auth_redirect_reason', 'protected_path_access', {
            path: '/',
            secure: true,
            httpOnly: false,
            maxAge: 60 * 5,
            domain: '.travelling-technicians.ca'
          });
        }
        
        return redirectResponse;
      }
      
      // Add user ID to header if available
      if (session?.user?.id) {
        res.headers.set('x-auth-user-id', session.user.id);
      }
    }
    
    // Handle corrupted sessions
    if (session && (!session.user || !session.user.id || !session.user.email)) {
      console.log('Middleware: Detected corrupted auth state');
      
      // Only redirect if not on homepage (to prevent loops)
      if (path !== '/' && path !== '') {
        // Create error URL
        const errorUrl = new URL('/auth/error', req.url);
        errorUrl.searchParams.set('error', 'invalid_session');
        errorUrl.searchParams.set('action', 'reset');
        
        // Set debug cookie
        const errorResponse = NextResponse.redirect(errorUrl);
        errorResponse.cookies.set('auth_error_reason', 'corrupted_session', {
          path: '/',
          secure: !isDevEnvironment,
          httpOnly: false,
          maxAge: 60 * 5
        });
        
        // Set domain for non-dev environments
        if (!isDevEnvironment && !hostname.includes('vercel.app')) {
          errorResponse.cookies.set('auth_error_reason', 'corrupted_session', {
            path: '/',
            secure: true,
            httpOnly: false,
            maxAge: 60 * 5,
            domain: '.travelling-technicians.ca'
          });
        }
        
        return errorResponse;
      }
    }
    
    return res;
  } catch (error) {
    console.error('Middleware unexpected error:', error);
    
    // Return next response with error header
    const response = NextResponse.next();
    response.headers.set('x-auth-validation-failed', 'true');
    return response;
  }
}

// Configure matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/public|auth/callback|images|favicons).*)',
  ],
}; 