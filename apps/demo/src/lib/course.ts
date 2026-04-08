import { createCourse } from '@course/next';

// Guard: don't crash if DATABASE_URL is missing (demo mode)
export const course = process.env.DATABASE_URL
  ? createCourse({ databaseUrl: process.env.DATABASE_URL })
  : null;
