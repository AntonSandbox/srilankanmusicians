import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSession = request.cookies.get('wedding_admin_session');
  const hasValidSession = adminSession && adminSession.value;

  // Exact /admin path redirect
  if (pathname === '/admin') {
    if (hasValidSession) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If user is already logged in and tries to access the login page, redirect to dashboard
  if (pathname === '/admin/login' && hasValidSession) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Protect all other /admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasValidSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
