import { eq, desc, sql, inArray } from 'drizzle-orm';
import { users, staffPermissions } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';
import { NotFoundError } from '@course/core';

export class StaffService {
  constructor(private db: Database) {}

  async list(pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const roleFilter = inArray(users.role, ['admin', 'staff']);

    const [data, countResult] = await Promise.all([
      this.db.query.users.findMany({
        where: roleFilter,
        limit: pageSize,
        offset,
        orderBy: desc(users.createdAt),
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(roleFilter),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: { permissions: true },
    });
    if (!user) throw new NotFoundError('Staff', id);
    return user;
  }

  async create(input: { email: string; firstName?: string; lastName?: string; role: string }) {
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash: '', // must be set separately via auth flow
        role: input.role,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
      })
      .returning();

    return user;
  }

  async update(id: string, data: Partial<{ email: string; firstName: string; lastName: string; role: string }>) {
    await this.getById(id);
    const updateData: Record<string, unknown> = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.role !== undefined) updateData.role = data.role;

    await this.db.update(users).set(updateData).where(eq(users.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.update(users).set({ isActive: false }).where(eq(users.id, id));
  }

  async getPermissions(userId: string) {
    return this.db.query.staffPermissions.findMany({
      where: eq(staffPermissions.userId, userId),
    });
  }

  async setPermission(userId: string, resource: string, action: string, allowed: boolean) {
    const existing = await this.db.query.staffPermissions.findFirst({
      where: sql`${staffPermissions.userId} = ${userId} AND ${staffPermissions.resource} = ${resource} AND ${staffPermissions.action} = ${action}`,
    });

    if (existing) {
      await this.db
        .update(staffPermissions)
        .set({ isAllowed: allowed })
        .where(eq(staffPermissions.id, existing.id));
    } else {
      await this.db.insert(staffPermissions).values({
        userId,
        resource,
        action,
        isAllowed: allowed,
      });
    }
  }
}
