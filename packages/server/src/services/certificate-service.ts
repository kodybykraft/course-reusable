import { eq } from 'drizzle-orm';
import { courseCertificates, courseCertificateTemplates, courseEnrollments } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class CertificateService {
  constructor(private db: Database) {}

  async issue(enrollmentId: string) {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, enrollmentId),
    });
    if (!enrollment) throw new NotFoundError('Enrollment', enrollmentId);

    // Check if certificate already exists
    const existing = await this.db.query.courseCertificates.findFirst({
      where: eq(courseCertificates.enrollmentId, enrollmentId),
    });
    if (existing) return existing;

    const uniqueCode = enrollmentId.slice(0, 4).toUpperCase() + '-' + crypto.randomUUID().slice(0, 8).toUpperCase();

    // Find template — course-specific first, then default
    let template = await this.db.query.courseCertificateTemplates.findFirst({
      where: eq(courseCertificateTemplates.courseId, enrollment.courseId),
    });
    if (!template) {
      template = await this.db.query.courseCertificateTemplates.findFirst() ?? undefined;
    }

    const [certificate] = await this.db.insert(courseCertificates).values({
      enrollmentId,
      templateId: template?.id ?? null,
      uniqueCode,
    }).returning();

    await eventBus.emit('certificate.issued', {
      certificateId: certificate.id,
      enrollmentId,
      studentId: enrollment.studentId,
    });

    return certificate;
  }

  async getByEnrollment(enrollmentId: string) {
    return this.db.query.courseCertificates.findFirst({
      where: eq(courseCertificates.enrollmentId, enrollmentId),
    });
  }

  async verify(uniqueCode: string) {
    const certificate = await this.db.query.courseCertificates.findFirst({
      where: eq(courseCertificates.uniqueCode, uniqueCode),
      with: { enrollment: { with: { course: true, student: true } } },
    });
    return certificate ?? null;
  }

  async listTemplates() {
    return this.db.query.courseCertificateTemplates.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
  }

  async createTemplate(input: { name: string; htmlTemplate: string; courseId?: string }) {
    const [template] = await this.db.insert(courseCertificateTemplates).values({
      name: input.name,
      htmlTemplate: input.htmlTemplate,
      courseId: input.courseId ?? null,
    }).returning();

    return template;
  }

  async updateTemplate(id: string, input: Partial<{ name: string; htmlTemplate: string; courseId: string }>) {
    await this.db.update(courseCertificateTemplates).set(input).where(eq(courseCertificateTemplates.id, id));
    return this.db.query.courseCertificateTemplates.findFirst({ where: eq(courseCertificateTemplates.id, id) });
  }
}
