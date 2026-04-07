import { desc, eq, and, sql } from 'drizzle-orm';
import { activityLogs } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';

export class ActivityLogService {
  constructor(private db: Database) {}

  async log(input: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.db.insert(activityLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      details: input.details ?? null,
      ipAddress: input.ipAddress ?? null,
    });
  }

  async list(
    filter?: { userId?: string; resourceType?: string },
    pagination?: PaginationInput,
  ) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (filter?.userId) conditions.push(eq(activityLogs.userId, filter.userId));
    if (filter?.resourceType) conditions.push(eq(activityLogs.resourceType, filter.resourceType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.activityLogs.findMany({
        where,
        with: { user: true },
        limit: pageSize,
        offset,
        orderBy: desc(activityLogs.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(activityLogs).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
