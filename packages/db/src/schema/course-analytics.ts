import { pgTable, text, varchar, integer, numeric, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.js';
import { users } from './users.js';

export const courseAnalyticsEvents = pgTable(
  'course_analytics_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventName: varchar('event_name', { length: 100 }).notNull(),
    studentId: text('student_id').references(() => users.id, { onDelete: 'set null' }),
    courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }),
    lessonId: text('lesson_id'),
    properties: jsonb('properties'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_analytics_events_name_idx').on(table.eventName),
    index('course_analytics_events_student_idx').on(table.studentId),
    index('course_analytics_events_course_idx').on(table.courseId),
    index('course_analytics_events_created_at_idx').on(table.createdAt),
  ],
);

export const courseEngagementStats = pgTable(
  'course_engagement_stats',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' })
      .unique(),
    enrollmentCount: integer('enrollment_count').notNull().default(0),
    completionCount: integer('completion_count').notNull().default(0),
    avgCompletionRate: numeric('avg_completion_rate', { precision: 5, scale: 2 }).default('0'),
    avgWatchTime: integer('avg_watch_time').notNull().default(0), // seconds
    avgRating: numeric('avg_rating', { precision: 3, scale: 2 }).default('0'),
    reviewCount: integer('review_count').notNull().default(0),
    revenue: integer('revenue').notNull().default(0), // cents
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
);

// Relations
export const courseAnalyticsEventsRelations = relations(courseAnalyticsEvents, ({ one }) => ({
  student: one(users, { fields: [courseAnalyticsEvents.studentId], references: [users.id] }),
  course: one(courses, { fields: [courseAnalyticsEvents.courseId], references: [courses.id] }),
}));

export const courseEngagementStatsRelations = relations(courseEngagementStats, ({ one }) => ({
  course: one(courses, { fields: [courseEngagementStats.courseId], references: [courses.id] }),
}));
