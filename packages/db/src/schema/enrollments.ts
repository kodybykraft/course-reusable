import { pgTable, text, varchar, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.js';
import { users } from './users.js';

export const courseEnrollments = pgTable(
  'course_enrollments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('active'), // active, completed, paused, expired
    source: varchar('source', { length: 20 }).notNull().default('purchase'), // purchase, free, admin, coupon
    enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    expiresAt: timestamp('expires_at'),
    lastAccessedAt: timestamp('last_accessed_at'),
  },
  (table) => [
    unique('course_enrollment_unique').on(table.courseId, table.studentId),
    index('course_enrollments_course_id_idx').on(table.courseId),
    index('course_enrollments_student_id_idx').on(table.studentId),
    index('course_enrollments_status_idx').on(table.status),
  ],
);

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one }) => ({
  course: one(courses, { fields: [courseEnrollments.courseId], references: [courses.id] }),
  student: one(users, { fields: [courseEnrollments.studentId], references: [users.id] }),
}));
