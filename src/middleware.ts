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
  // Create a response object that we'll modify as needed
  const res = NextResponse.next();
  
  try {
    // Get the hostname for cookie domain management
    const hostname = req.headers.get('host') || '';
    const isDevEnvironment = process.env.NODE_ENV === 'development';
    const isPreviewDeployment = Boolean(process.env.VERCEL_ENV === 'preview');
    
    // Create a Supabase client for the middleware
    // For your version of auth-helpers-nextjs, we need to use the standard syntax
    const supabase = createMiddlewareClient({ req, res });
    
    // Verify session is valid during navigation
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If there was an error getting the session, log it
    if (error) {
      console.error('Middleware auth error:', error.message);
      
      // Add diagnostic headers (only visible to the application)
      res.headers.set('x-auth-error', error.message);
    }
    
    // Check for custom auth cookie that we set in the client
    // This helps with cross-domain authentication
    const hasAuthCookie = req.cookies.get('tt_auth_check')?.value === 'true';
    const hasAuthDomainInStorage = req.cookies.get('tt_cross_domain')?.value === 'true';
    
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

    // For protected paths, verify authentication
    if (isProtectedPath) {
      // Enhanced session validation including our custom auth cookies
      const isAuthenticated = (session && session.user?.id) || 
                              (hasAuthCookie && hasAuthDomainInStorage);
      
      // If no session or invalid session, redirect to login
      if (!isAuthenticated) {
        console.log(`Middleware: Protected path ${path} accessed without valid session, redirecting to login`);
        
        // Store intended path for redirect after login
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirect', path);
        
        // Set cookies to help with debugging
        // For Cookie options, we'll set them directly
        const cookieOptions = {
          path: '/',
          sameSite: 'lax' as 'lax',
          secure: !isDevEnvironment,
          httpOnly: false, // Allow client-side access
          maxAge: 60 * 5 // 5 minutes
        };

        // For Vercel previews or production, handle domain differently
        if (!isDevEnvironment && !hostname.includes('vercel.app')) {
          // @ts-ignore - TypeScript doesn't know about domain property
          cookieOptions.domain = '.travelling-technicians.ca';
        }
        
        res.cookies.set('auth_redirect_reason', 'protected_path_access', cookieOptions);
        
        return NextResponse.redirect(redirectUrl);
      }
      
      // If authenticated, add header with user ID (if available)
      if (session?.user?.id) {
        res.headers.set('x-auth-user-id', session.user.id);
      }
    }
    
    // If user is authenticated but session is corrupted, redirect to error page
    if (session && (!session.user || !session.user.id || !session.user.email)) {
      console.log('Middleware: Detected corrupted auth state', { 
        userId: session.user?.id,
        hasEmail: Boolean(session.user?.email)
      });
      
      // Only redirect to error if not on homepage (to prevent loops)
      if (path !== '/' && path !== '') {
        // Session is corrupted - redirect to error page with reset option
        const errorUrl = new URL('/auth/error', req.url);
        errorUrl.searchParams.set('error', 'invalid_session');
        errorUrl.searchParams.set('action', 'reset');
        
        // Set cookies to help with debugging
        const cookieOptions = {
          path: '/',
          sameSite: 'lax' as 'lax',
          secure: !isDevEnvironment,
          httpOnly: false,
          maxAge: 60 * 5 // 5 minutes
        };
  
        // For Vercel previews or production, handle domain differently  
        if (!isDevEnvironment && !hostname.includes('vercel.app')) {
          // @ts-ignore - TypeScript doesn't know about domain property
          cookieOptions.domain = '.travelling-technicians.ca';
        }
        
        res.cookies.set('auth_error_reason', 'corrupted_session', cookieOptions);
        
        return NextResponse.redirect(errorUrl);
      }
    }
    
    return res;
  } catch (error) {
    console.error('Middleware unexpected error:', error);
    
    // If there's an error in the middleware, don't block navigation
    // but add a header to indicate the auth check failed
    const response = NextResponse.next();
    response.headers.set('x-auth-validation-failed', 'true');
    return response;
  }
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all pages except static assets, api routes, and auth-related pages
    '/((?!_next/static|_next/image|favicon.ico|api/public|auth/callback|images|favicons).*)',
  ],
}; 