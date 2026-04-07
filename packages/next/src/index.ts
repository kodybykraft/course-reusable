// Course factory
export { createCourse, getCourse } from './create-course.js';
export type { CourseConfig, Course } from './create-course.js';

// Server actions
export { login, register, logout, validateToken } from './server-actions/auth-actions.js';

// Admin auth helpers
export { requireAdmin, requirePermission } from './admin-auth.js';
export type { AdminUser } from './admin-auth.js';

// Auth adapter types (re-export from @course/server)
export type { AuthAdapter, AuthUser } from '@course/server';

// Route handler factory
export { createCourseRouteHandler } from './route-handler.js';

// Middleware helpers
export { createCourseMiddleware, createCourseMiddlewareConfig } from './middleware.js';
