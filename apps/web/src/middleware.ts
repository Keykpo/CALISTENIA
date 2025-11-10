import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request as any });
  const { pathname } = request.nextUrl;

  // Routes that REQUIRE authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/workouts',
    '/exercises',
    '/plans',
    '/achievements',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without authentication
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // No longer redirect to assessment - the dashboard modal will handle it
  // All authenticated users can access the dashboard
  // The dashboard component will show the assessment modal if needed

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
