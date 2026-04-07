import { eq, desc, sql } from 'drizzle-orm';
import { webhooks, webhookDeliveries } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';
import { NotFoundError } from '@course/core';

export class WebhookService {
  constructor(private db: Database) {}

  async list(pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.webhooks.findMany({
        limit: pageSize,
        offset,
        orderBy: desc(webhooks.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(webhooks),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const webhook = await this.db.query.webhooks.findFirst({
      where: eq(webhooks.id, id),
      with: { deliveries: true },
    });
    if (!webhook) throw new NotFoundError('Webhook', id);
    return webhook;
  }

  async create(input: { url: string; events: string[]; secret?: string; isActive?: boolean }) {
    const [webhook] = await this.db
      .insert(webhooks)
      .values({
        url: input.url,
        events: input.events,
        secret: input.secret ?? crypto.randomUUID(),
        isActive: input.isActive ?? true,
      })
      .returning();

    return webhook;
  }

  async update(id: string, data: Partial<{ url: string; events: string[]; secret: string; isActive: boolean }>) {
    await this.getById(id);
    const updateData: Record<string, unknown> = {};
    if (data.url !== undefined) updateData.url = data.url;
    if (data.events !== undefined) updateData.events = data.events;
    if (data.secret !== undefined) updateData.secret = data.secret;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await this.db.update(webhooks).set(updateData).where(eq(webhooks.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.delete(webhooks).where(eq(webhooks.id, id));
  }

  async listDeliveries(webhookId: string, pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.webhookDeliveries.findMany({
        where: eq(webhookDeliveries.webhookId, webhookId),
        limit: pageSize,
        offset,
        orderBy: desc(webhookDeliveries.deliveredAt),
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookId, webhookId)),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
