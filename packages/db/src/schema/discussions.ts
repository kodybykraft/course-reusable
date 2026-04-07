import { pgTable, text, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.js';
import { courseLessons } from './lessons.js';
import { users } from './users.js';

export const courseDiscussions = pgTable(
  'course_discussions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    content: text('content').notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isPinned: boolean('is_pinned').notNull().default(false),
    isLocked: boolean('is_locked').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index('course_discussions_course_id_idx').on(table.courseId),
    index('course_discussions_author_idx').on(table.authorId),
    index('course_discussions_created_at_idx').on(table.createdAt),
  ],
);

export const courseDiscussionReplies = pgTable(
  'course_discussion_replies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    discussionId: text('discussion_id')
      .notNull()
      .references(() => courseDiscussions.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    parentReplyId: text('parent_reply_id').references((): any => courseDiscussionReplies.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_discussion_replies_discussion_idx').on(table.discussionId),
  ],
);

export const courseLessonComments = pgTable(
  'course_lesson_comments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    parentCommentId: text('parent_comment_id').references((): any => courseLessonComments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_lesson_comments_lesson_idx').on(table.lessonId),
  ],
);

export const courseStudentProfiles = pgTable(
  'course_student_profiles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    displayName: varchar('display_name', { length: 100 }),
    avatar: text('avatar'),
    bio: text('bio'),
    isPublic: boolean('is_public').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
);

// Relations
export const courseDiscussionsRelations = relations(courseDiscussions, ({ one, many }) => ({
  course: one(courses, { fields: [courseDiscussions.courseId], references: [courses.id] }),
  author: one(users, { fields: [courseDiscussions.authorId], references: [users.id] }),
  replies: many(courseDiscussionReplies),
}));

export const courseDiscussionRepliesRelations = relations(courseDiscussionReplies, ({ one }) => ({
  discussion: one(courseDiscussions, { fields: [courseDiscussionReplies.discussionId], references: [courseDiscussions.id] }),
  author: one(users, { fields: [courseDiscussionReplies.authorId], references: [users.id] }),
}));

export const courseLessonCommentsRelations = relations(courseLessonComments, ({ one }) => ({
  lesson: one(courseLessons, { fields: [courseLessonComments.lessonId], references: [courseLessons.id] }),
  author: one(users, { fields: [courseLessonComments.authorId], references: [users.id] }),
}));

export const courseStudentProfilesRelations = relations(courseStudentProfiles, ({ one }) => ({
  student: one(users, { fields: [courseStudentProfiles.studentId], references: [users.id] }),
}));
