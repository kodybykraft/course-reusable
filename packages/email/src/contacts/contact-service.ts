import { eq, like, sql, desc } from 'drizzle-orm';
import { emailContacts, emailSuppressionList, users } from '@course/db';
import type { Database } from '@course/db';
import { escapeLike } from '@course/core';

export class ContactService {
  constructor(private db: Database) {}

  async list(search?: string, pagination?: { page?: number; pageSize?: number }) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const where = search ? like(emailContacts.email, `%${escapeLike(search)}%`) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.emailContacts.findMany({ where, limit: pageSize, offset, orderBy: desc(emailContacts.subscribedAt) }),
      this.db.select({ count: sql<number>`count(*)` }).from(emailContacts).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getByEmail(email: string) {
    return this.db.query.emailContacts.findFirst({ where: eq(emailContacts.email, email) });
  }

  async upsert(input: { email: string; firstName?: string; lastName?: string; customerId?: string }) {
    const existing = await this.getByEmail(input.email);

    // Check suppression list
    const suppressed = await this.db.query.emailSuppressionList.findFirst({
      where: eq(emailSuppressionList.email, input.email),
    });
    if (suppressed) return existing;

    if (existing) {
      await this.db.update(emailContacts).set({
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        customerId: input.customerId ?? existing.customerId,
      }).where(eq(emailContacts.id, existing.id));
      return this.db.query.emailContacts.findFirst({ where: eq(emailContacts.id, existing.id) });
    }

    const [contact] = await this.db.insert(emailContacts).values({
      email: input.email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      customerId: input.customerId ?? null,
      status: 'subscribed',
    }).returning();

    return contact;
  }

  async unsubscribe(email: string) {
    await this.db.update(emailContacts).set({
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
    }).where(eq(emailContacts.email, email));
  }

  async syncFromUsers() {
    const BATCH_SIZE = 100;
    let offset = 0;

    while (true) {
      const batch = await this.db.query.users.findMany({
        where: eq(users.isActive, true),
        limit: BATCH_SIZE,
        offset,
      });

      if (batch.length === 0) break;

      for (const user of batch) {
        await this.upsert({
          email: user.email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          customerId: user.id,
        });
      }

      offset += BATCH_SIZE;

      if (batch.length < BATCH_SIZE) break;
    }
  }
}
