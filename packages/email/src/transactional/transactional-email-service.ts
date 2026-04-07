import { eq, and } from 'drizzle-orm';
import { courseEnrollments, users, courseCertificates, courseQuizAttempts } from '@course/db';
import type { Database } from '@course/db';
import { escapeHtml } from '@course/core';
import type { SesClient } from '../ses/ses-client.js';
import type { TemplateService } from '../templates/template-service.js';

export class TransactionalEmailService {
  constructor(
    private db: Database,
    private ses: SesClient,
    private templates: TemplateService,
    private fromEmail: string,
    private fromName?: string,
  ) {}

  private async findTemplate(category: string) {
    const templates = await this.templates.list({ page: 1, pageSize: 100 });
    return templates.data.find((t) => t.category === category) ?? null;
  }

  private async renderAndSend(
    category: string,
    to: string,
    variables: Record<string, string>,
  ): Promise<string | null> {
    const template = await this.findTemplate(category);
    if (!template) {
      console.warn(`[email] No template found for category: ${category}`);
      return null;
    }

    const rendered = await this.templates.renderPreview(template.id, variables);
    if (!rendered) return null;

    let subject = rendered.subject;
    for (const [key, value] of Object.entries(variables)) {
      subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), escapeHtml(value));
    }

    const result = await this.ses.sendEmail({
      to,
      subject,
      html: rendered.html,
    });

    return result.messageId;
  }

  async sendEnrollmentConfirmation(enrollmentId: string): Promise<string | null> {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, enrollmentId),
      with: { course: true, student: true },
    });
    if (!enrollment) return null;

    const student = enrollment.student as any;
    const course = enrollment.course as any;

    return this.renderAndSend('enrollment-confirmation', student.email, {
      platformName: this.fromName ?? 'Course Platform',
      firstName: student.firstName ?? 'there',
      courseName: escapeHtml(course.title),
      totalModules: String(0), // Populated by caller or computed
      totalLessons: String(0),
      courseUrl: `/courses/${course.slug}`,
    });
  }

  async sendCourseCompleted(enrollmentId: string): Promise<string | null> {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, enrollmentId),
      with: { course: true, student: true },
    });
    if (!enrollment) return null;

    const student = enrollment.student as any;
    const course = enrollment.course as any;

    // Check if certificate was issued
    const cert = await this.db.query.courseCertificates.findFirst({
      where: eq(courseCertificates.enrollmentId, enrollmentId),
    });

    const certificateMessage = cert
      ? 'Your certificate of completion is ready! Check your dashboard to download it.'
      : 'Keep exploring more courses to continue your learning journey.';

    return this.renderAndSend('course-completed', student.email, {
      platformName: this.fromName ?? 'Course Platform',
      firstName: student.firstName ?? 'there',
      courseName: escapeHtml(course.title),
      certificateMessage,
      dashboardUrl: '/my/dashboard',
    });
  }

  async sendCertificateIssued(certificateId: string): Promise<string | null> {
    const cert = await this.db.query.courseCertificates.findFirst({
      where: eq(courseCertificates.id, certificateId),
      with: { enrollment: { with: { course: true, student: true } } },
    });
    if (!cert) return null;

    const enrollment = cert.enrollment as any;
    const student = enrollment.student;
    const course = enrollment.course;

    return this.renderAndSend('certificate-issued', student.email, {
      platformName: this.fromName ?? 'Course Platform',
      firstName: student.firstName ?? 'there',
      courseName: escapeHtml(course.title),
      certificateCode: cert.uniqueCode,
      certificateUrl: `/certificates/${cert.uniqueCode}`,
    });
  }

  async sendQuizPassed(attemptId: string): Promise<string | null> {
    const attempt = await this.db.query.courseQuizAttempts.findFirst({
      where: eq(courseQuizAttempts.id, attemptId),
      with: { quiz: { with: { lesson: true } } },
    });
    if (!attempt) return null;

    const quiz = attempt.quiz as any;

    // Get student info
    const student = await this.db.query.users.findFirst({
      where: eq(users.id, attempt.studentId),
    });
    if (!student) return null;

    // Compute correct/total from answers array
    const answers = attempt.answers ?? [];
    const totalQuestions = answers.length;
    const correctAnswers = answers.filter((a) => a.correct).length;

    return this.renderAndSend('quiz-passed', student.email, {
      platformName: this.fromName ?? 'Course Platform',
      firstName: student.firstName ?? 'there',
      quizTitle: escapeHtml(quiz.title),
      courseName: 'your course',
      score: String(Math.round(attempt.score ?? 0)),
      correctAnswers: String(correctAnswers),
      totalQuestions: String(totalQuestions),
      courseUrl: '/',
    });
  }

  async sendLessonUnlocked(studentId: string, lessonId: string, courseName: string, moduleName: string, lessonTitle: string): Promise<string | null> {
    const student = await this.db.query.users.findFirst({
      where: eq(users.id, studentId),
    });
    if (!student) return null;

    return this.renderAndSend('lesson-unlocked', student.email, {
      platformName: this.fromName ?? 'Course Platform',
      firstName: student.firstName ?? 'there',
      courseName: escapeHtml(courseName),
      moduleName: escapeHtml(moduleName),
      lessonTitle: escapeHtml(lessonTitle),
      lessonUrl: `/lessons/${lessonId}`,
    });
  }

  async sendAbandonedCourseNudge(enrollmentId: string, percentComplete: number): Promise<string | null> {
    const enrollment = await this.db.query.courseEnrollments.findFirst({
      where: eq(courseEnrollments.id, enrollmentId),
      with: { course: true, student: true },
    });
    if (!enrollment) return null;

    const student = enrollment.student as any;
    const course = enrollment.course as any;

    return this.renderAndSend('abandoned-course', student.email, {
      platformName: this.fromName ?? 'Course Platform',
      firstName: student.firstName ?? 'there',
      courseName: escapeHtml(course.title),
      percentComplete: String(Math.round(percentComplete)),
      courseUrl: `/courses/${course.slug}`,
    });
  }
}
