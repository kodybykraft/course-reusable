import { pgTable, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courseEnrollments } from './enrollments.js';
import { courses } from './courses.js';

export const courseCertificateTemplates = pgTable(
  'course_certificate_templates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    htmlTemplate: text('html_template').notNull(),
    courseId: text('course_id').references(() => courses.id, { onDelete: 'set null' }), // null = default template
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
);

export const courseCertificates = pgTable(
  'course_certificates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text('enrollment_id')
      .notNull()
      .references(() => courseEnrollments.id, { onDelete: 'cascade' }),
    templateId: text('template_id').references(() => courseCertificateTemplates.id, { onDelete: 'set null' }),
    uniqueCode: varchar('unique_code', { length: 50 }).notNull().unique(),
    certificateUrl: text('certificate_url'),
    issuedAt: timestamp('issued_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_certificates_enrollment_idx').on(table.enrollmentId),
    index('course_certificates_code_idx').on(table.uniqueCode),
  ],
);

// Relations
export const courseCertificateTemplatesRelations = relations(courseCertificateTemplates, ({ one }) => ({
  course: one(courses, { fields: [courseCertificateTemplates.courseId], references: [courses.id] }),
}));

export const courseCertificatesRelations = relations(courseCertificates, ({ one }) => ({
  enrollment: one(courseEnrollments, { fields: [courseCertificates.enrollmentId], references: [courseEnrollments.id] }),
  template: one(courseCertificateTemplates, { fields: [courseCertificates.templateId], references: [courseCertificateTemplates.id] }),
}));
