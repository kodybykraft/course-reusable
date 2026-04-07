import type { TransactionalEmailService } from './transactional-email-service.js';

interface EventBusLike {
  on(event: string, handler: (payload: any) => void | Promise<void>): void;
}

/**
 * Registers event bus listeners that trigger transactional emails.
 * All handlers are wrapped in try/catch — email failures never break the course flow.
 */
export function registerEmailEventHandlers(
  eventBus: EventBusLike,
  emailService: TransactionalEmailService,
): void {
  eventBus.on('enrollment.created', async (payload: { enrollmentId?: string; courseId: string; studentId: string }) => {
    try {
      if (payload.enrollmentId) {
        await emailService.sendEnrollmentConfirmation(payload.enrollmentId);
      }
    } catch (err) {
      console.error('[email] Failed to send enrollment confirmation:', err);
    }
  });

  eventBus.on('enrollment.completed', async (payload: { enrollmentId: string }) => {
    try {
      await emailService.sendCourseCompleted(payload.enrollmentId);
    } catch (err) {
      console.error('[email] Failed to send course completed email:', err);
    }
  });

  eventBus.on('certificate.issued', async (payload: { certificateId: string }) => {
    try {
      await emailService.sendCertificateIssued(payload.certificateId);
    } catch (err) {
      console.error('[email] Failed to send certificate issued email:', err);
    }
  });

  eventBus.on('quiz.passed', async (payload: { attemptId: string }) => {
    try {
      await emailService.sendQuizPassed(payload.attemptId);
    } catch (err) {
      console.error('[email] Failed to send quiz passed email:', err);
    }
  });

  eventBus.on('lesson.released', async (payload: { studentId: string; lessonId: string; courseName: string; moduleName: string; lessonTitle: string }) => {
    try {
      await emailService.sendLessonUnlocked(
        payload.studentId,
        payload.lessonId,
        payload.courseName,
        payload.moduleName,
        payload.lessonTitle,
      );
    } catch (err) {
      console.error('[email] Failed to send lesson unlocked email:', err);
    }
  });
}
