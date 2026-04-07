import { eq, and, desc, sql } from 'drizzle-orm';
import { courseLessonProgress, courseEnrollments, courseLessons, courseModules } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class ProgressService {
  constructor(private db: Database) {}

  async trackLessonProgress(enrollmentId: string, lessonId: string, status: string, watchTime?: number) {
    const existing = await this.db.query.courseLessonProgress.findFirst({
      where: and(eq(courseLessonProgress.enrollmentId, enrollmentId), eq(courseLessonProgress.lessonId, lessonId)),
    });

    if (existing) {
      const updates: Record<string, unknown> = { status, lastAccessedAt: new Date() };
      if (watchTime !== undefined) updates.watchTime = watchTime;
      if (status === 'completed' && !existing.completedAt) updates.completedAt = new Date();
      await this.db.update(courseLessonProgress).set(updates).where(eq(courseLessonProgress.id, existing.id));
      return this.db.query.courseLessonProgress.findFirst({ where: eq(courseLessonProgress.id, existing.id) });
    }

    const [progress] = await this.db.insert(courseLessonProgress).values({
      enrollmentId,
      lessonId,
      status,
      watchTime: watchTime ?? 0,
      completedAt: status === 'completed' ? new Date() : null,
    }).returning();

    if (status === 'in_progress') {
      await eventBus.emit('lesson.started', { lessonId, enrollmentId });
    }
    if (status === 'completed') {
      await eventBus.emit('lesson.completed', { lessonId, enrollmentId });
    }

    return progress;
  }

  async markLessonComplete(enrollmentId: string, lessonId: string) {
    await this.trackLessonProgress(enrollmentId, lessonId, 'completed');

    // Check if all lessons in the course are completed
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, enrollmentId),
    });
    if (!enrollment) return;

    const modules = await this.db.query.courseModules.findMany({
      where: eq(courseModules.courseId, enrollment.courseId),
    });

    let totalLessons = 0;
    for (const mod of modules) {
      const [count] = await this.db.select({ count: sql<number>`count(*)` }).from(courseLessons).where(eq(courseLessons.moduleId, mod.id));
      totalLessons += Number(count.count);
    }

    const [completedCount] = await this.db.select({ count: sql<number>`count(*)` }).from(courseLessonProgress).where(
      and(eq(courseLessonProgress.enrollmentId, enrollmentId), eq(courseLessonProgress.status, 'completed')),
    );

    if (Number(completedCount.count) >= totalLessons && totalLessons > 0) {
      await this.db.update(courseEnrollments).set({ status: 'completed', completedAt: new Date() }).where(eq(courseEnrollments.id, enrollmentId));
      await eventBus.emit('enrollment.completed', { enrollmentId, courseId: enrollment.courseId, studentId: enrollment.studentId });
    }
  }

  async getLessonProgress(enrollmentId: string, lessonId: string) {
    return this.db.query.courseLessonProgress.findFirst({
      where: and(eq(courseLessonProgress.enrollmentId, enrollmentId), eq(courseLessonProgress.lessonId, lessonId)),
    });
  }

  async getCourseProgress(enrollmentId: string) {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, enrollmentId),
    });
    if (!enrollment) throw new NotFoundError('Enrollment', enrollmentId);

    const modules = await this.db.query.courseModules.findMany({
      where: eq(courseModules.courseId, enrollment.courseId),
    });

    let totalLessons = 0;
    for (const mod of modules) {
      const [count] = await this.db.select({ count: sql<number>`count(*)` }).from(courseLessons).where(eq(courseLessons.moduleId, mod.id));
      totalLessons += Number(count.count);
    }

    const lessons = await this.db.query.courseLessonProgress.findMany({
      where: eq(courseLessonProgress.enrollmentId, enrollmentId),
    });

    const completedLessons = lessons.filter((l) => l.status === 'completed').length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, percentage, lessons };
  }

  async getStudentDashboard(studentId: string) {
    const enrollments = await this.db.query.courseEnrollments.findMany({
      where: eq(courseEnrollments.studentId, studentId),
      with: { course: true },
      orderBy: desc(courseEnrollments.enrolledAt),
    });

    const results = [];
    for (const enrollment of enrollments) {
      const progress = await this.getCourseProgress(enrollment.id);
      results.push({
        enrollment,
        course: enrollment.course,
        progress: progress.percentage,
        lastAccessed: enrollment.lastAccessedAt,
      });
    }

    return results;
  }
}
