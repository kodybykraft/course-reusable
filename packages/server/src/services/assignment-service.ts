import { eq, desc, and, sql } from 'drizzle-orm';
import { courseAssignments, courseSubmissions } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class AssignmentService {
  constructor(private db: Database) {}

  async getByLessonId(lessonId: string) {
    return this.db.query.courseAssignments.findFirst({
      where: eq(courseAssignments.lessonId, lessonId),
    });
  }

  async getById(id: string) {
    const assignment = await this.db.query.courseAssignments.findFirst({
      where: eq(courseAssignments.id, id),
    });
    if (!assignment) throw new NotFoundError('Assignment', id);
    return assignment;
  }

  async create(input: {
    lessonId: string; title: string; description?: string;
    dueDate?: Date; maxFileSize?: number; allowedFileTypes?: string;
  }) {
    const [assignment] = await this.db.insert(courseAssignments).values({
      lessonId: input.lessonId,
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      maxFileSize: input.maxFileSize ?? null,
      allowedFileTypes: input.allowedFileTypes ?? null,
    }).returning();

    return assignment;
  }

  async update(id: string, input: Partial<{
    title: string; description: string; dueDate: Date;
    maxFileSize: number; allowedFileTypes: string;
  }>) {
    await this.getById(id);
    await this.db.update(courseAssignments).set(input).where(eq(courseAssignments.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.delete(courseAssignments).where(eq(courseAssignments.id, id));
  }

  async submitWork(assignmentId: string, studentId: string, input: { fileUrl?: string; content?: string }) {
    await this.getById(assignmentId);

    const [submission] = await this.db.insert(courseSubmissions).values({
      assignmentId,
      studentId,
      fileUrl: input.fileUrl ?? null,
      content: input.content ?? null,
    }).returning();

    await eventBus.emit('assignment.submitted', { assignmentId, submissionId: submission.id, studentId });
    return submission;
  }

  async grade(submissionId: string, grade: number, feedback: string, gradedBy: string) {
    await this.db.update(courseSubmissions).set({
      grade,
      feedback,
      gradedBy,
      gradedAt: new Date(),
    }).where(eq(courseSubmissions.id, submissionId));

    const submission = await this.db.query.courseSubmissions.findFirst({
      where: eq(courseSubmissions.id, submissionId),
    });

    if (submission) {
      await eventBus.emit('assignment.graded', { submissionId, studentId: submission.studentId, grade });
    }

    return submission;
  }

  async getSubmissions(assignmentId: string, pagination?: { page?: number; pageSize?: number }) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.courseSubmissions.findMany({
        where: eq(courseSubmissions.assignmentId, assignmentId),
        with: { student: true },
        limit: pageSize,
        offset,
        orderBy: desc(courseSubmissions.submittedAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseSubmissions).where(eq(courseSubmissions.assignmentId, assignmentId)),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getStudentSubmission(assignmentId: string, studentId: string) {
    return this.db.query.courseSubmissions.findFirst({
      where: and(eq(courseSubmissions.assignmentId, assignmentId), eq(courseSubmissions.studentId, studentId)),
    });
  }
}
