import { createCourseMiddleware } from '@course/next';

export default createCourseMiddleware();

export const config = {
  matcher: ['/admin/:path*', '/api/course/admin/:path*'],
};
