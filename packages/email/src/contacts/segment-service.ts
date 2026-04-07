import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';
import { emailSegments, emailContacts } from '@course/db';
import type { Database } from '@course/db';

export interface SegmentRule {
  field: string; // e.g. 'total_spent', 'order_count', 'last_order_days', 'status'
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in';
  value: unknown;
}

export class SegmentService {
  constructor(private db: Database) {}

  async list() {
    return this.db.query.emailSegments.findMany({ orderBy: desc(emailSegments.createdAt) });
  }

  async create(input: { name: string; description?: string; rules: SegmentRule[] }) {
    const [segment] = await this.db.insert(emailSegments).values({
      name: input.name,
      description: input.description ?? null,
      rules: input.rules,
    }).returning();

    await this.computeSegment(segment.id);
    return this.db.query.emailSegments.findFirst({ where: eq(emailSegments.id, segment.id) });
  }

  async computeSegment(segmentId: string): Promise<number> {
    const segment = await this.db.query.emailSegments.findFirst({
      where: eq(emailSegments.id, segmentId),
    });
    if (!segment) return 0;

    const rules = segment.rules as SegmentRule[];

    // For now, compute a simple count based on subscribed contacts
    // A full implementation would build dynamic SQL from rules
    let count = 0;

    const subscribedContacts = await this.db.query.emailContacts.findMany({
      where: eq(emailContacts.status, 'subscribed'),
    });

    count = subscribedContacts.length;

    await this.db.update(emailSegments).set({
      contactCount: count,
      lastComputedAt: new Date(),
    }).where(eq(emailSegments.id, segmentId));

    return count;
  }

  async delete(id: string) {
    await this.db.delete(emailSegments).where(eq(emailSegments.id, id));
  }
}
