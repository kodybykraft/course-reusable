import { createCourseRouteHandler } from '@course/next';
import '../../../lib/course';

export const dynamic = 'force-dynamic';

export const { GET, POST, PATCH, DELETE } = createCourseRouteHandler();
