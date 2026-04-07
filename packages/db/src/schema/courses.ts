import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { courseModules } from './modules.js';
import { courseEnrollments } from './enrollments.js';
import { courseProducts } from './commerce.js';
import { courseReviews } from './commerce.js';

export const courseCategories = pgTable(
  'course_categories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    parentId: text('parent_id').references((): any => courseCategories.id, { onDelete: 'set null' }),
    position: integer('position').notNull().default(0),
  },
  (table) => [
    index('course_categories_slug_idx').on(table.slug),
  ],
);

export const courses = pgTable(
  'course_courses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    subtitle: varchar('subtitle', { length: 500 }),
    description: text('description'),
    thumbnail: text('thumbnail'),
    instructorId: text('instructor_id').references(() => users.id, { onDelete: 'set null' }),
    categoryId: text('category_id').references(() => courseCategories.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, published, archived
    level: varchar('level', { length: 20 }).default('beginner'), // beginner, intermediate, advanced
    language: varchar('language', { length: 10 }).default('en'),
    estimatedDuration: integer('estimated_duration'), // minutes
    isFeatured: boolean('is_featured').notNull().default(false),
    metadata: jsonb('metadata'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('course_courses_slug_idx').on(table.slug),
    index('course_courses_status_idx').on(table.status),
    index('course_courses_instructor_idx').on(table.instructorId),
    index('course_courses_category_idx').on(table.categoryId),
  ],
);

export const coursePrerequisites = pgTable(
  'course_prerequisites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    requiredCourseId: text('required_course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
  },
);

// Relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, { fields: [courses.instructorId], references: [users.id] }),
  category: one(courseCategories, { fields: [courses.categoryId], references: [courseCategories.id] }),
  prerequisites: many(coursePrerequisites),
  modules: many(courseModules),
  enrollments: many(courseEnrollments),
  products: many(courseProducts),
  reviews: many(courseReviews),
}));

export const courseCategoriesRelations = relations(courseCategories, ({ one, many }) => ({
  parent: one(courseCategories, { fields: [courseCategories.parentId], references: [courseCategories.id] }),
  courses: many(courses),
}));

export const coursePrerequisitesRelations = relations(coursePrerequisites, ({ one }) => ({
  course: one(courses, { fields: [coursePrerequisites.courseId], references: [courses.id] }),
  requiredCourse: one(courses, { fields: [coursePrerequisites.requiredCourseId], references: [courses.id] }),
}));
