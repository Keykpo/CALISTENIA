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

  // If authenticated, check assessment completion for protected routes
  if (token && token.sub && isProtectedRoute) {
    // Routes that should be accessible even without assessment
    const allowedWithoutAssessment = [
      '/onboarding/assessment',
      '/onboarding/results',
      '/auth/signout',
      '/profile', // Allow profile access
    ];

    const isAllowedRoute = allowedWithoutAssessment.some(route =>
      pathname.startsWith(route)
    );

    // Check if user has completed assessment (from token)
    const hasCompletedAssessment = token.hasCompletedAssessment || false;

    // CRITICAL: Redirect to assessment ONLY if:
    // 1. User hasn't completed assessment
    // 2. User is on a protected route that requires assessment
    // 3. User is NOT already on an allowed route
    if (!hasCompletedAssessment && !isAllowedRoute) {
      return NextResponse.redirect(new URL('/onboarding/assessment', request.url));
    }
  }

  // If authenticated and assessment completed, prevent access to assessment page
  if (token && token.hasCompletedAssessment && pathname === '/onboarding/assessment') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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
