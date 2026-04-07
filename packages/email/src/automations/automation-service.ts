import { eq, and, desc, sql } from 'drizzle-orm';
import { emailAutomations, emailAutomationSteps, emailAutomationEnrollments } from '@course/db';
import type { Database } from '@course/db';

export class AutomationService {
  constructor(private db: Database) {}

  async list(pagination?: { page?: number; pageSize?: number }) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.emailAutomations.findMany({
        with: { steps: true },
        limit: pageSize,
        offset,
        orderBy: desc(emailAutomations.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(emailAutomations),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    return this.db.query.emailAutomations.findFirst({
      where: eq(emailAutomations.id, id),
      with: { steps: true, enrollments: true },
    });
  }

  async create(input: {
    name: string;
    triggerEvent: string;
    triggerConditions?: Record<string, unknown>;
    steps: Array<{ type: 'email' | 'delay' | 'condition'; config: Record<string, unknown> }>;
  }) {
    const [automation] = await this.db.insert(emailAutomations).values({
      name: input.name,
      triggerEvent: input.triggerEvent,
      triggerConditions: input.triggerConditions ?? null,
    }).returning();

    if (input.steps.length > 0) {
      await this.db.insert(emailAutomationSteps).values(
        input.steps.map((step, i) => ({
          automationId: automation.id,
          position: i,
          type: step.type,
          config: step.config,
        })),
      );
    }

    return this.getById(automation.id);
  }

  async activate(id: string) {
    await this.db.update(emailAutomations).set({ status: 'active' }).where(eq(emailAutomations.id, id));
  }

  async pause(id: string) {
    await this.db.update(emailAutomations).set({ status: 'paused' }).where(eq(emailAutomations.id, id));
  }

  async enrollContact(automationId: string, contactId: string) {
    const automation = await this.getById(automationId);
    if (!automation || automation.status !== 'active') return;

    // Check if already enrolled
    const existing = await this.db.query.emailAutomationEnrollments.findFirst({
      where: and(
        eq(emailAutomationEnrollments.automationId, automationId),
        eq(emailAutomationEnrollments.contactId, contactId),
        eq(emailAutomationEnrollments.status, 'active'),
      ),
    });
    if (existing) return;

    const firstStep = automation.steps?.[0];

    await this.db.insert(emailAutomationEnrollments).values({
      automationId,
      contactId,
      currentStepId: firstStep?.id ?? null,
      status: 'active',
    });
  }

  async delete(id: string) {
    await this.db.delete(emailAutomations).where(eq(emailAutomations.id, id));
  }
}
