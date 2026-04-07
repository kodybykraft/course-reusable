import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courseLessons } from './lessons.js';
import { users } from './users.js';

export const courseQuizzes = pgTable(
  'course_quizzes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => courseLessons.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    passingScore: integer('passing_score').notNull().default(70), // percentage
    maxAttempts: integer('max_attempts'), // null = unlimited
    timeLimit: integer('time_limit'), // minutes, null = no limit
    shuffleQuestions: boolean('shuffle_questions').notNull().default(false),
    showCorrectAnswers: boolean('show_correct_answers').notNull().default(true),
    requiredForCompletion: boolean('required_for_completion').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_quizzes_lesson_id_idx').on(table.lessonId),
  ],
);

export const courseQuizQuestions = pgTable(
  'course_quiz_questions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quizId: text('quiz_id')
      .notNull()
      .references(() => courseQuizzes.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(), // multiple_choice, true_false, fill_blank, essay
    content: text('content').notNull(),
    options: jsonb('options').$type<Array<{ label: string; value: string }>>(),
    correctAnswer: text('correct_answer'), // null for essay
    explanation: text('explanation'),
    points: integer('points').notNull().default(1),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('course_quiz_questions_quiz_id_idx').on(table.quizId),
  ],
);

export const courseQuizAttempts = pgTable(
  'course_quiz_attempts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quizId: text('quiz_id')
      .notNull()
      .references(() => courseQuizzes.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    score: integer('score'), // percentage
    passed: boolean('passed'),
    answers: jsonb('answers').$type<Array<{ questionId: string; answer: string; correct: boolean; points: number }>>(),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('course_quiz_attempts_quiz_id_idx').on(table.quizId),
    index('course_quiz_attempts_student_id_idx').on(table.studentId),
  ],
);

// Relations
export const courseQuizzesRelations = relations(courseQuizzes, ({ one, many }) => ({
  lesson: one(courseLessons, { fields: [courseQuizzes.lessonId], references: [courseLessons.id] }),
  questions: many(courseQuizQuestions),
  attempts: many(courseQuizAttempts),
}));

export const courseQuizQuestionsRelations = relations(courseQuizQuestions, ({ one }) => ({
  quiz: one(courseQuizzes, { fields: [courseQuizQuestions.quizId], references: [courseQuizzes.id] }),
}));

export const courseQuizAttemptsRelations = relations(courseQuizAttempts, ({ one }) => ({
  quiz: one(courseQuizzes, { fields: [courseQuizAttempts.quizId], references: [courseQuizzes.id] }),
  student: one(users, { fields: [courseQuizAttempts.studentId], references: [users.id] }),
}));
