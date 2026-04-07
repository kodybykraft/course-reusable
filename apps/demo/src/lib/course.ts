import { createCourse } from '@course/next';

export const course = createCourse({
  databaseUrl: process.env.DATABASE_URL!,
});
