import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface CourseMiddlewareOptions {
  apiBasePath?: string;
  adminBasePath?: string;
}

export function createCourseMiddleware(options?: CourseMiddlewareOptions) {
  const apiBase = options?.apiBasePath ?? '/api/course';
  const adminBase = options?.adminBasePath ?? '/admin';

  return function courseMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin API routes
    if (pathname.startsWith(`${apiBase}/admin`)) {
      const authHeader = request.headers.get('authorization');
      const token = request.cookies.get('course_token')?.value;

      if (!token && (!authHeader || !authHeader.startsWith('Bearer '))) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Missing or invalid Authorization header' },
          { status: 401 },
        );
      }
    }

    // /admin/* pages — require auth token (cookie or header)
    if (pathname.startsWith(adminBase)) {
      const token = request.cookies.get('course_token')?.value;
      const authHeader = request.headers.get('authorization');
      if (!token && !authHeader?.startsWith('Bearer ')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    return NextResponse.next();
  };
}

export function createCourseMiddlewareConfig(options?: CourseMiddlewareOptions) {
  const apiBase = options?.apiBasePath ?? '/api/course';
  const adminBase = options?.adminBasePath ?? '/admin';

  return {
    matcher: [`${adminBase}/:path*`, `${apiBase}/admin/:path*`],
  };
}
