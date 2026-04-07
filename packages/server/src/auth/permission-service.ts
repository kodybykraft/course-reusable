import { eq, and } from 'drizzle-orm';
import { staffPermissions } from '@course/db';
import type { Database } from '@course/db';
import { ForbiddenError } from '@course/core';
import type { User } from '../context.js';

export type Resource = 'courses' | 'modules' | 'lessons' | 'enrollments' | 'students' | 'quizzes' | 'assignments' | 'discussions' | 'coupons' | 'certificates' | 'plans' | 'purchases' | 'settings' | 'analytics' | 'email';
export type Action = 'create' | 'read' | 'update' | 'delete';

export class PermissionService {
  constructor(private db: Database) {}

  async checkPermission(user: User, resource: Resource, action: Action): Promise<boolean> {
    // Admins have full access
    if (user.role === 'admin') return true;

    // Customers have no admin access
    if (user.role === 'customer') return false;

    // Staff — check explicit permissions
    const permission = await this.db.query.staffPermissions.findFirst({
      where: and(
        eq(staffPermissions.userId, user.id),
        eq(staffPermissions.resource, resource),
        eq(staffPermissions.action, action),
      ),
    });

    return permission?.isAllowed ?? false;
  }

  async requirePermission(user: User | null, resource: Resource, action: Action): Promise<void> {
    if (!user) {
      throw new ForbiddenError('Authentication required');
    }
    const allowed = await this.checkPermission(user, resource, action);
    if (!allowed) {
      throw new ForbiddenError(`No permission to ${action} ${resource}`);
    }
  }

  async setPermission(userId: string, resource: Resource, action: Action, allowed: boolean): Promise<void> {
    const existing = await this.db.query.staffPermissions.findFirst({
      where: and(
        eq(staffPermissions.userId, userId),
        eq(staffPermissions.resource, resource),
        eq(staffPermissions.action, action),
      ),
    });

    if (existing) {
      await this.db
        .update(staffPermissions)
        .set({ isAllowed: allowed })
        .where(eq(staffPermissions.id, existing.id));
    } else {
      await this.db.insert(staffPermissions).values({ userId, resource, action, isAllowed: allowed });
    }
  }
}
