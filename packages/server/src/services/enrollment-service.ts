import { eq, desc, and, sql } from 'drizzle-orm';
import { courseEnrollments, courses } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class EnrollmentService {
  constructor(private db: Database) {}

  async list(filter?: { courseId?: string; studentId?: string; status?: string }, pagination?: { page?: number; pageSize?: number }) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (filter?.courseId) conditions.push(eq(courseEnrollments.courseId, filter.courseId));
    if (filter?.studentId) conditions.push(eq(courseEnrollments.studentId, filter.studentId));
    if (filter?.status) conditions.push(eq(courseEnrollments.status, filter.status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.courseEnrollments.findMany({
        where,
        with: { course: true, student: true },
        limit: pageSize,
        offset,
        orderBy: desc(courseEnrollments.enrolledAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseEnrollments).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, id),
      with: { course: true },
    });
    if (!enrollment) throw new NotFoundError('Enrollment', id);
    return enrollment;
  }

  async enroll(courseId: string, studentId: string, source: string = 'free') {
    const existing = await this.db.query.courseEnrollments.findFirst({
      where: and(eq(courseEnrollments.courseId, courseId), eq(courseEnrollments.studentId, studentId)),
    });
    if (existing) throw new ValidationError('Student is already enrolled in this course');

    const [enrollment] = await this.db.insert(courseEnrollments).values({
      courseId,
      studentId,
      source,
      status: 'active',
    }).returning();

    await eventBus.emit('enrollment.created', { enrollmentId: enrollment.id, courseId, studentId });
    return enrollment;
  }

  async unenroll(enrollmentId: string) {
    await this.getById(enrollmentId);
    await this.db.delete(courseEnrollments).where(eq(courseEnrollments.id, enrollmentId));
  }

  async complete(enrollmentId: string) {
    const enrollment = await this.getById(enrollmentId);
    await this.db.update(courseEnrollments).set({ status: 'completed', completedAt: new Date() }).where(eq(courseEnrollments.id, enrollmentId));
    await eventBus.emit('enrollment.completed', { enrollmentId, courseId: enrollment.courseId, studentId: enrollment.studentId });
    return this.getById(enrollmentId);
  }

  async pause(enrollmentId: string) {
    await this.getById(enrollmentId);
    await this.db.update(courseEnrollments).set({ status: 'paused' }).where(eq(courseEnrollments.id, enrollmentId));
    return this.getById(enrollmentId);
  }

  async resume(enrollmentId: string) {
    await this.getById(enrollmentId);
    await this.db.update(courseEnrollments).set({ status: 'active' }).where(eq(courseEnrollments.id, enrollmentId));
    return this.getById(enrollmentId);
  }

  async checkAccess(courseId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: and(
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.studentId, studentId),
        eq(courseEnrollments.status, 'active'),
      ),
    });
    return !!enrollment;
  }

  async getStudentCourses(studentId: string) {
    return this.db.query.courseEnrollments.findMany({
      where: eq(courseEnrollments.studentId, studentId),
      with: { course: true },
      orderBy: desc(courseEnrollments.enrolledAt),
    });
  }
}
