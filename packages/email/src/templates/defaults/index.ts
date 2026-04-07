import { eq } from 'drizzle-orm';
import { emailTemplates } from '@course/db';
import type { Database } from '@course/db';
import { enrollmentConfirmationTemplate } from './enrollment-confirmation.js';
import { courseCompletedTemplate } from './course-completed.js';
import { certificateIssuedTemplate } from './certificate-issued.js';
import { quizPassedTemplate } from './quiz-passed.js';
import { lessonUnlockedTemplate } from './lesson-unlocked.js';
import { abandonedCourseTemplate } from './abandoned-course.js';

export {
  enrollmentConfirmationTemplate,
  courseCompletedTemplate,
  certificateIssuedTemplate,
  quizPassedTemplate,
  lessonUnlockedTemplate,
  abandonedCourseTemplate,
};

const defaultTemplates = [
  enrollmentConfirmationTemplate,
  courseCompletedTemplate,
  certificateIssuedTemplate,
  quizPassedTemplate,
  lessonUnlockedTemplate,
  abandonedCourseTemplate,
];

/**
 * Seeds the database with default email templates.
 * Only inserts templates whose category does not already exist in the DB.
 * Returns the number of templates that were seeded.
 */
export async function seedDefaultTemplates(db: Database): Promise<number> {
  let seeded = 0;

  for (const template of defaultTemplates) {
    const existing = await db.query.emailTemplates.findFirst({
      where: eq(emailTemplates.category, template.category),
    });

    if (!existing) {
      const variableMatches = template.htmlContent.match(/\{\{(\w+)\}\}/g) ?? [];
      const variables = [...new Set(variableMatches.map((m) => m.replace(/\{\{|\}\}/g, '')))];

      await db.insert(emailTemplates).values({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        category: template.category,
        variables,
      });

      seeded++;
    }
  }

  return seeded;
}
