import { pgTable, text, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courseLessons } from './lessons.js';
import { users } from './users.js';

export const courseAssignments = pgTable(
  'course_assignments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    dueDate: timestamp('due_date'),
    maxFileSize: integer('max_file_size'), // bytes
    allowedFileTypes: text('allowed_file_types'), // comma-separated: pdf,doc,zip
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_assignments_lesson_id_idx').on(table.lessonId),
  ],
);

export const courseSubmissions = pgTable(
  'course_submissions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => courseAssignments.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url'),
    content: text('content'),
    grade: integer('grade'), // 0-100
    feedback: text('feedback'),
    gradedBy: text('graded_by').references(() => users.id, { onDelete: 'set null' }),
    submittedAt: timestamp('submitted_at').notNull().defaultNow(),
    gradedAt: timestamp('graded_at'),
  },
  (table) => [
    index('course_submissions_assignment_id_idx').on(table.assignmentId),
    index('course_submissions_student_id_idx').on(table.studentId),
  ],
);

// Relations
export const courseAssignmentsRelations = relations(courseAssignments, ({ one, many }) => ({
  lesson: one(courseLessons, { fields: [courseAssignments.lessonId], references: [courseLessons.id] }),
  submissions: many(courseSubmissions),
}));

export const courseSubmissionsRelations = relations(courseSubmissions, ({ one }) => ({
  assignment: one(courseAssignments, { fields: [courseSubmissions.assignmentId], references: [courseAssignments.id] }),
  student: one(users, { fields: [courseSubmissions.studentId], references: [users.id] }),
  grader: one(users, { fields: [courseSubmissions.gradedBy], references: [users.id] }),
}));
