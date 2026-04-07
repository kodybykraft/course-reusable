import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courseModules } from './modules.js';

export const courseLessons = pgTable(
  'course_lessons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    moduleId: text('module_id')
      .notNull()
      .references(() => courseModules.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    contentType: varchar('content_type', { length: 20 }).notNull().default('video'), // video, text, pdf, audio, embed
    position: integer('position').notNull().default(0),
    releaseDate: timestamp('release_date'), // drip content
    isFree: boolean('is_free').notNull().default(false), // preview lesson
    estimatedDuration: integer('estimated_duration'), // minutes
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_lessons_module_id_idx').on(table.moduleId),
    index('course_lessons_position_idx').on(table.position),
  ],
);

export const courseLessonContent = pgTable(
  'course_lesson_content',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(), // video, text, pdf, audio, embed, download
    url: text('url'), // video URL, PDF URL, audio URL
    content: text('content'), // markdown/HTML for text lessons
    duration: integer('duration'), // seconds for video/audio
    fileSize: integer('file_size'), // bytes
    embedCode: text('embed_code'), // for external embeds
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('course_lesson_content_lesson_id_idx').on(table.lessonId),
  ],
);

export const courseLessonResources = pgTable(
  'course_lesson_resources',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    url: text('url').notNull(),
    fileType: varchar('file_type', { length: 20 }), // pdf, zip, doc, etc.
    fileSize: integer('file_size'),
  },
);

// Relations
export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  module: one(courseModules, { fields: [courseLessons.moduleId], references: [courseModules.id] }),
  content: many(courseLessonContent),
  resources: many(courseLessonResources),
}));

export const courseLessonContentRelations = relations(courseLessonContent, ({ one }) => ({
  lesson: one(courseLessons, { fields: [courseLessonContent.lessonId], references: [courseLessons.id] }),
}));

export const courseLessonResourcesRelations = relations(courseLessonResources, ({ one }) => ({
  lesson: one(courseLessons, { fields: [courseLessonResources.lessonId], references: [courseLessons.id] }),
}));
