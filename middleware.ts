import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Only apply middleware to admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Skip for login page
    if (req.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // For now, let the client-side authentication handle the protection
    // We'll rely on the admin layout to check authentication
    // This avoids complex token handling in middleware
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};