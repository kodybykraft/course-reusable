import { pgTable, text, varchar, integer, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courseEnrollments } from './enrollments.js';
import { courseLessons } from './lessons.js';
import { users } from './users.js';

export const courseLessonProgress = pgTable(
  'course_lesson_progress',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text('enrollment_id')
      .notNull()
      .references(() => courseEnrollments.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('not_started'), // not_started, in_progress, completed
    watchTime: integer('watch_time').notNull().default(0), // seconds watched
    completedAt: timestamp('completed_at'),
    lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
  },
  (table) => [
    unique('course_lesson_progress_unique').on(table.enrollmentId, table.lessonId),
    index('course_lesson_progress_enrollment_idx').on(table.enrollmentId),
    index('course_lesson_progress_lesson_idx').on(table.lessonId),
  ],
);

export const courseBookmarks = pgTable(
  'course_bookmarks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    note: text('note'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_bookmarks_student_idx').on(table.studentId),
  ],
);

export const courseNotes = pgTable(
  'course_notes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    videoTimestamp: integer('video_timestamp'), // seconds into video
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index('course_notes_student_lesson_idx').on(table.studentId, table.lessonId),
  ],
);

// Relations
export const courseLessonProgressRelations = relations(courseLessonProgress, ({ one }) => ({
  enrollment: one(courseEnrollments, { fields: [courseLessonProgress.enrollmentId], references: [courseEnrollments.id] }),
  lesson: one(courseLessons, { fields: [courseLessonProgress.lessonId], references: [courseLessons.id] }),
}));

export const courseBookmarksRelations = relations(courseBookmarks, ({ one }) => ({
  student: one(users, { fields: [courseBookmarks.studentId], references: [users.id] }),
  lesson: one(courseLessons, { fields: [courseBookmarks.lessonId], references: [courseLessons.id] }),
}));

export const courseNotesRelations = relations(courseNotes, ({ one }) => ({
  student: one(users, { fields: [courseNotes.studentId], references: [users.id] }),
  lesson: one(courseLessons, { fields: [courseNotes.lessonId], references: [courseLessons.id] }),
}));
