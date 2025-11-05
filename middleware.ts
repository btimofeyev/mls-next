import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  // Only apply middleware to admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Skip for login page
    if (req.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Create a response object
    let response = NextResponse.next({
      request: {
        headers: req.headers,
      },
    });

    // Create Supabase client with proper cookie handling for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Set cookie in request for current request
            req.cookies.set({
              name,
              value,
              ...options,
            });
            // Set cookie in response for subsequent requests
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            // Remove cookie in request for current request
            req.cookies.set({
              name,
              value: '',
              ...options,
            });
            // Remove cookie in response for subsequent requests
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Check authentication
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      // No valid session, redirect to login
      const redirectUrl = new URL('/admin/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has admin privileges
    const userMetadata = session.user.user_metadata;
    const isAdmin = userMetadata?.role === 'admin' || userMetadata?.is_admin === true;

    if (!isAdmin) {
      // User is not admin, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }

    // User is authenticated and authorized
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};