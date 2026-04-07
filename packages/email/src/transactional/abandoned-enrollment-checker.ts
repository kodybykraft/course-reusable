import { eq, and, lt, sql } from 'drizzle-orm';
import { courseEnrollments, courseLessonProgress } from '@course/db';
import type { Database } from '@course/db';
import type { TransactionalEmailService } from './transactional-email-service.js';

// Track which enrollments have already received nudge emails.
// Resets on server restart — at worst sends one duplicate after deploy.
const sentEnrollmentIds = new Set<string>();

/**
 * Finds inactive enrollments (no lesson progress in 7+ days) and sends nudge emails.
 * Only targets active (non-completed) enrollments.
 */
export async function checkAbandonedCourses(
  db: Database,
  emailService: TransactionalEmailService,
): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find active enrollments where the most recent progress entry is older than 7 days
  const enrollments = await db.query.courseEnrollments.findMany({
    where: and(
      eq(courseEnrollments.status, 'active'),
      lt(courseEnrollments.enrolledAt, sevenDaysAgo),
    ),
  });

  let sent = 0;

  for (const enrollment of enrollments) {
    if (sentEnrollmentIds.has(enrollment.id)) continue;

    // Check last activity
    const recentProgress = await db.query.courseLessonProgress.findFirst({
      where: eq(courseLessonProgress.enrollmentId, enrollment.id),
      orderBy: (p, { desc }) => [desc(p.lastAccessedAt)],
    });

    // Skip if they've been active recently
    if (recentProgress && recentProgress.lastAccessedAt > sevenDaysAgo) continue;

    // Calculate completion percentage
    const totalLessonsResult = await db.execute(
      sql`SELECT count(*) as count FROM course_lessons cl
          JOIN course_modules cm ON cl.module_id = cm.id
          WHERE cm.course_id = ${enrollment.courseId}`,
    );
    const completedResult = await db.execute(
      sql`SELECT count(*) as count FROM course_lesson_progress
          WHERE enrollment_id = ${enrollment.id} AND status = 'completed'`,
    );

    const totalLessons = Number((totalLessonsResult as any).rows?.[0]?.count ?? 0);
    const completedLessons = Number((completedResult as any).rows?.[0]?.count ?? 0);
    const percentComplete = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Don't nudge if they haven't started
    if (completedLessons === 0) continue;

    try {
      await emailService.sendAbandonedCourseNudge(enrollment.id, percentComplete);
      sentEnrollmentIds.add(enrollment.id);
      sent++;
    } catch (err) {
      console.error(`[email] Failed to send abandoned course nudge for enrollment ${enrollment.id}:`, err);
    }
  }

  return sent;
}
