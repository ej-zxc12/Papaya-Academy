import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is under portal login
  if (pathname.startsWith('/portal/login')) {
    return NextResponse.next();
  }

  // Check if the path is under teacher portal
  if (pathname.startsWith('/teacher')) {
    // Allow access to login page for backward compatibility
    if (pathname === '/teacher/login') {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }

    // Check for teacher session
    const session = request.cookies.get('teacherSession');
    
    if (!session) {
      // Redirect to unified login if no session
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }

    // Validate session (you might want to decode JWT or check against database)
    try {
      const sessionData = JSON.parse(session.value);
      if (!sessionData.teacher || !sessionData.teacher.id) {
        return NextResponse.redirect(new URL('/portal/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  // Check if the path is under principal portal
  if (pathname.startsWith('/principal')) {
    // Allow access to login page for backward compatibility
    if (pathname === '/principal/login') {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }

    // Check for principal session
    const session = request.cookies.get('principalSession');
    
    if (!session) {
      // Redirect to unified login if no session
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }

    // Validate session
    try {
      const sessionData = JSON.parse(session.value);
      if (!sessionData.principal || !sessionData.principal.id) {
        return NextResponse.redirect(new URL('/portal/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/principal/:path*', '/portal/:path*']
};
