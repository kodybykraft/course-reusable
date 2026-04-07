import { pgTable, text, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.js';
import { courseLessons } from './lessons.js';

export const courseModules = pgTable(
  'course_modules',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    position: integer('position').notNull().default(0),
    releaseDate: timestamp('release_date'), // drip content
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_modules_course_id_idx').on(table.courseId),
    index('course_modules_position_idx').on(table.position),
  ],
);

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, { fields: [courseModules.courseId], references: [courses.id] }),
  lessons: many(courseLessons),
}));
