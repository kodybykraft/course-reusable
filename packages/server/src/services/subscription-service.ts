import { eq, and, desc, sql } from 'drizzle-orm';
import { courseSubscriptions, courseMembershipPlans, courseEnrollments, courses } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

interface StripeProvider {
  createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<{
    id: string;
    status: string;
    clientSecret: string | null;
    currentPeriodStart: number;
    currentPeriodEnd: number;
  }>;
  cancelSubscription(subscriptionId: string): Promise<{ id: string; status: string }>;
  createPrice(input: {
    unitAmount: number;
    currency: string;
    interval: 'month' | 'year';
    productName: string;
  }): Promise<{ id: string; productId: string }>;
}

export class SubscriptionService {
  constructor(
    private db: Database,
    private stripe: StripeProvider | null,
  ) {}

  // ---------------------------------------------------------------------------
  // Membership Plans
  // ---------------------------------------------------------------------------

  async listPlans(pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.courseMembershipPlans.findMany({
        limit: pageSize,
        offset,
        orderBy: desc(courseMembershipPlans.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseMembershipPlans),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getPlan(id: string) {
    const plan = await this.db.query.courseMembershipPlans.findFirst({
      where: eq(courseMembershipPlans.id, id),
    });
    if (!plan) throw new NotFoundError('MembershipPlan', id);
    return plan;
  }

  async createPlan(input: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    billingCycle: 'monthly' | 'yearly';
    courseAccess?: 'all' | 'specific';
    courseIds?: string[];
  }) {
    let stripePriceId: string | null = null;

    // Create Stripe price if connected
    if (this.stripe) {
      const interval = input.billingCycle === 'monthly' ? 'month' : 'year';
      const result = await this.stripe.createPrice({
        unitAmount: input.price,
        currency: input.currency ?? 'USD',
        interval,
        productName: input.name,
      });
      stripePriceId = result.id;
    }

    const [plan] = await this.db.insert(courseMembershipPlans).values({
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      currency: input.currency ?? 'USD',
      billingCycle: input.billingCycle,
      courseAccess: input.courseAccess ?? 'all',
      courseIds: input.courseIds ?? [],
      stripePriceId,
      isActive: true,
    }).returning();

    return plan;
  }

  async updatePlan(id: string, input: Partial<{
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
    courseAccess: string;
    courseIds: string[];
  }>) {
    await this.getPlan(id);
    await this.db.update(courseMembershipPlans).set(input).where(eq(courseMembershipPlans.id, id));
    return this.getPlan(id);
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  async subscribe(studentId: string, planId: string, stripeCustomerId?: string) {
    const plan = await this.getPlan(planId);
    if (!plan.isActive) throw new ValidationError('This plan is no longer available');

    // Check existing active subscription to this plan
    const existing = await this.db.query.courseSubscriptions.findFirst({
      where: and(
        eq(courseSubscriptions.studentId, studentId),
        eq(courseSubscriptions.planId, planId),
        eq(courseSubscriptions.status, 'active'),
      ),
    });
    if (existing) throw new ValidationError('Already subscribed to this plan');

    let stripeSubscriptionId: string | null = null;
    let clientSecret: string | null = null;
    const now = new Date();
    let periodEnd = new Date(now);

    if (this.stripe && plan.stripePriceId && stripeCustomerId) {
      const result = await this.stripe.createSubscription(
        stripeCustomerId,
        plan.stripePriceId,
        { planId, studentId },
      );
      stripeSubscriptionId = result.id;
      clientSecret = result.clientSecret;
      periodEnd = new Date(result.currentPeriodEnd * 1000);
    } else {
      // No Stripe — set period based on billing cycle
      if (plan.billingCycle === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
    }

    const [subscription] = await this.db.insert(courseSubscriptions).values({
      studentId,
      planId,
      status: 'active',
      stripeSubscriptionId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    }).returning();

    // Auto-enroll in plan courses
    await this.enrollPlanCourses(studentId, plan);

    await eventBus.emit('subscription.created', {
      subscriptionId: subscription.id,
      studentId,
      planId,
    });

    return { subscription, clientSecret };
  }

  async cancel(subscriptionId: string) {
    const sub = await this.db.query.courseSubscriptions.findFirst({
      where: eq(courseSubscriptions.id, subscriptionId),
    });
    if (!sub) throw new NotFoundError('Subscription', subscriptionId);

    if (this.stripe && sub.stripeSubscriptionId) {
      await this.stripe.cancelSubscription(sub.stripeSubscriptionId);
    }

    await this.db.update(courseSubscriptions).set({
      status: 'cancelled',
      cancelledAt: new Date(),
    }).where(eq(courseSubscriptions.id, subscriptionId));

    await eventBus.emit('subscription.cancelled', {
      subscriptionId,
      studentId: sub.studentId,
      planId: sub.planId,
    });

    return this.db.query.courseSubscriptions.findFirst({
      where: eq(courseSubscriptions.id, subscriptionId),
    });
  }

  async getStudentSubscriptions(studentId: string) {
    return this.db.query.courseSubscriptions.findMany({
      where: eq(courseSubscriptions.studentId, studentId),
      with: { plan: true },
      orderBy: desc(courseSubscriptions.createdAt),
    });
  }

  async listSubscriptions(filter?: { status?: string; planId?: string }, pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (filter?.status) conditions.push(eq(courseSubscriptions.status, filter.status));
    if (filter?.planId) conditions.push(eq(courseSubscriptions.planId, filter.planId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.courseSubscriptions.findMany({
        where,
        with: { student: true, plan: true },
        limit: pageSize,
        offset,
        orderBy: desc(courseSubscriptions.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseSubscriptions).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private async enrollPlanCourses(studentId: string, plan: any) {
    let courseIds: string[];

    if (plan.courseAccess === 'all') {
      // Enroll in all published courses
      const allCourses = await this.db.query.courses.findMany({
        where: eq(courses.status, 'published'),
      });
      courseIds = allCourses.map((c: any) => c.id);
    } else {
      courseIds = plan.courseIds ?? [];
    }

    for (const courseId of courseIds) {
      const existing = await this.db.query.courseEnrollments.findFirst({
        where: and(
          eq(courseEnrollments.courseId, courseId),
          eq(courseEnrollments.studentId, studentId),
        ),
      });

      if (!existing) {
        await this.db.insert(courseEnrollments).values({
          courseId,
          studentId,
          source: 'subscription',
        });
      }
    }
  }
}
