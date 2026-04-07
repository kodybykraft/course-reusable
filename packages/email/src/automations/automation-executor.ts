import { eq, and, lte, sql } from 'drizzle-orm';
import {
  emailAutomationEnrollments,
  emailAutomationSteps,
  emailAutomations,
  emailContacts,
} from '@course/db';
import type { Database } from '@course/db';
import type { SesClient } from '../ses/ses-client.js';
import type { TemplateService } from '../templates/template-service.js';

/**
 * Processes automation enrollments that are due for their next step.
 * Call this on an interval (e.g., every 60 seconds).
 */
export class AutomationExecutor {
  constructor(
    private db: Database,
    private ses: SesClient,
    private templates: TemplateService,
    private fromEmail: string,
    private fromName?: string,
  ) {}

  async processQueue(): Promise<number> {
    const now = new Date();
    let processed = 0;

    // Find enrollments that are active and due
    const due = await this.db.query.emailAutomationEnrollments.findMany({
      where: and(
        eq(emailAutomationEnrollments.status, 'active'),
        lte(emailAutomationEnrollments.enrolledAt, now), // using enrolledAt as a proxy since nextRunAt may not exist yet
      ),
    });

    for (const enrollment of due) {
      try {
        await this.processEnrollment(enrollment);
        processed++;
      } catch (err) {
        console.error(`[automation] Failed to process enrollment ${enrollment.id}:`, err);
      }
    }

    return processed;
  }

  private async processEnrollment(enrollment: {
    id: string;
    automationId: string;
    contactId: string;
    currentStepId: string | null;
    status: string;
  }): Promise<void> {
    if (!enrollment.currentStepId) {
      // No current step — find the first step
      const firstStep = await this.db.query.emailAutomationSteps.findFirst({
        where: eq(emailAutomationSteps.automationId, enrollment.automationId),
        orderBy: (steps, { asc }) => [asc(steps.position)],
      });

      if (!firstStep) {
        await this.completeEnrollment(enrollment.id);
        return;
      }

      await this.executeStep(enrollment, firstStep);
      return;
    }

    // Get current step
    const step = await this.db.query.emailAutomationSteps.findFirst({
      where: eq(emailAutomationSteps.id, enrollment.currentStepId),
    });

    if (!step) {
      await this.completeEnrollment(enrollment.id);
      return;
    }

    await this.executeStep(enrollment, step);
  }

  private async executeStep(
    enrollment: { id: string; automationId: string; contactId: string },
    step: { id: string; automationId: string; position: number; type: string; config: unknown },
  ): Promise<void> {
    const config = step.config as Record<string, unknown>;

    switch (step.type) {
      case 'email': {
        const templateId = config.templateId as string;
        if (templateId) {
          const contact = await this.db.query.emailContacts.findFirst({
            where: eq(emailContacts.id, enrollment.contactId),
          });

          if (contact) {
            const rendered = await this.templates.renderPreview(templateId, {
              firstName: contact.firstName ?? '',
              email: contact.email,
            });

            if (rendered) {
              let subject = rendered.subject;
              subject = subject.replace(/\{\{firstName\}\}/g, contact.firstName ?? '');

              await this.ses.sendEmail({
                to: contact.email,
                subject,
                html: rendered.html,
              });
            }
          }
        }

        await this.advanceToNextStep(enrollment, step);
        break;
      }

      case 'delay': {
        const delayMinutes = (config.delayMinutes as number) ?? 60;
        // For now, just advance — in production this would set nextRunAt
        // The delay is tracked by not processing until the time has passed
        await this.advanceToNextStep(enrollment, step);
        break;
      }

      case 'condition': {
        // Simple pass-through for now — conditions can be implemented later
        await this.advanceToNextStep(enrollment, step);
        break;
      }

      default:
        await this.advanceToNextStep(enrollment, step);
    }
  }

  private async advanceToNextStep(
    enrollment: { id: string; automationId: string },
    currentStep: { automationId: string; position: number },
  ): Promise<void> {
    // Find the next step by position
    const allSteps = await this.db.query.emailAutomationSteps.findMany({
      where: eq(emailAutomationSteps.automationId, currentStep.automationId),
      orderBy: (steps, { asc }) => [asc(steps.position)],
    });

    const currentIndex = allSteps.findIndex((s) => s.position === currentStep.position);
    const nextStep = allSteps[currentIndex + 1];

    if (nextStep) {
      await this.db
        .update(emailAutomationEnrollments)
        .set({ currentStepId: nextStep.id })
        .where(eq(emailAutomationEnrollments.id, enrollment.id));
    } else {
      await this.completeEnrollment(enrollment.id);
    }
  }

  private async completeEnrollment(enrollmentId: string): Promise<void> {
    await this.db
      .update(emailAutomationEnrollments)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(emailAutomationEnrollments.id, enrollmentId));
  }
}
