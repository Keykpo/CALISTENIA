import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request as any });
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/register', '/auth/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If authenticated, check assessment completion
  if (token && token.sub) {
    // Routes that should be accessible even without assessment
    const allowedWithoutAssessment = [
      '/onboarding/assessment',
      '/onboarding/results',
      '/auth/signout',
      '/api/',
    ];

    const isAllowedRoute = allowedWithoutAssessment.some(route =>
      pathname.startsWith(route)
    );

    // Check if user has completed assessment (from token or separate check)
    const hasCompletedAssessment = token.hasCompletedAssessment || false;

    // CRITICAL: Redirect to assessment ONLY if:
    // 1. User hasn't completed assessment
    // 2. User is NOT already on an allowed route
    // 3. User is NOT on an API route
    if (!hasCompletedAssessment && !isAllowedRoute && pathname !== '/onboarding/assessment') {
      return NextResponse.redirect(new URL('/onboarding/assessment', request.url));
    }

    // If assessment is completed and user tries to access assessment page
    if (hasCompletedAssessment && pathname === '/onboarding/assessment') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
