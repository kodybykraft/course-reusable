import { eq, desc, and, sql } from 'drizzle-orm';
import { coursePurchases, courseProducts, courseCoupons, courseRefunds, courseEnrollments } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class PurchaseService {
  constructor(private db: Database) {}

  async list(
    filter?: { studentId?: string; status?: string },
    pagination?: PaginationInput,
  ) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (filter?.studentId) conditions.push(eq(coursePurchases.studentId, filter.studentId));
    if (filter?.status) conditions.push(eq(coursePurchases.status, filter.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.coursePurchases.findMany({
        where,
        with: { student: true, product: { with: { course: true } } },
        limit: pageSize,
        offset,
        orderBy: desc(coursePurchases.purchasedAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(coursePurchases).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const purchase = await this.db.query.coursePurchases.findFirst({
      where: eq(coursePurchases.id, id),
      with: { student: true, product: { with: { course: true } } },
    });
    if (!purchase) throw new NotFoundError('Purchase', id);
    return purchase;
  }

  async createPurchase(studentId: string, productId: string, couponCode?: string) {
    const product = await this.db.query.courseProducts.findFirst({
      where: eq(courseProducts.id, productId),
    });
    if (!product) throw new NotFoundError('Product', productId);

    let amount = product.price;
    let couponId: string | null = null;

    if (product.type === 'free') {
      amount = 0;
    } else if (couponCode) {
      const coupon = await this.validateCoupon(couponCode, product.courseId);
      const discount =
        coupon.type === 'percentage'
          ? Math.round(amount * coupon.value / 100)
          : Math.min(coupon.value, amount);
      amount = amount - discount;
      couponId = coupon.id;
    }

    const [purchase] = await this.db
      .insert(coursePurchases)
      .values({
        studentId,
        productId,
        amount,
        currency: product.currency,
        status: 'pending',
        couponId,
      })
      .returning();

    return purchase;
  }

  async completePurchase(purchaseId: string, stripePaymentIntentId?: string) {
    const purchase = await this.getById(purchaseId);

    await this.db
      .update(coursePurchases)
      .set({ status: 'completed', stripePaymentIntentId: stripePaymentIntentId ?? null })
      .where(eq(coursePurchases.id, purchaseId));

    const product = await this.db.query.courseProducts.findFirst({
      where: eq(courseProducts.id, purchase.productId),
    });

    if (product) {
      await this.db.insert(courseEnrollments).values({
        courseId: product.courseId,
        studentId: purchase.studentId,
        source: 'purchase',
      });
    }

    await eventBus.emit('purchase.completed', {
      purchaseId,
      studentId: purchase.studentId,
      courseId: product!.courseId,
      amount: purchase.amount,
    });

    return this.getById(purchaseId);
  }

  async refund(purchaseId: string, reason?: string) {
    const purchase = await this.getById(purchaseId);

    const [refund] = await this.db
      .insert(courseRefunds)
      .values({
        purchaseId,
        amount: purchase.amount,
        reason: reason ?? null,
        status: 'processed',
        processedAt: new Date(),
      })
      .returning();

    await this.db
      .update(coursePurchases)
      .set({ status: 'refunded' })
      .where(eq(coursePurchases.id, purchaseId));

    const product = await this.db.query.courseProducts.findFirst({
      where: eq(courseProducts.id, purchase.productId),
    });

    if (product) {
      await this.db
        .delete(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.studentId, purchase.studentId),
            eq(courseEnrollments.courseId, product.courseId),
          ),
        );
    }

    await eventBus.emit('purchase.refunded', {
      purchaseId,
      refundId: refund.id,
      amount: refund.amount,
    });

    return refund;
  }

  async getStudentPurchases(studentId: string) {
    return this.db.query.coursePurchases.findMany({
      where: eq(coursePurchases.studentId, studentId),
      with: { product: { with: { course: true } } },
      orderBy: desc(coursePurchases.purchasedAt),
    });
  }

  private async validateCoupon(code: string, courseId?: string) {
    const coupon = await this.db.query.courseCoupons.findFirst({
      where: eq(courseCoupons.code, code),
    });
    if (!coupon) throw new NotFoundError('Coupon', code);
    if (!coupon.isActive) throw new ValidationError('Coupon is not active');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ValidationError('Coupon has expired');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new ValidationError('Coupon usage limit reached');
    if (coupon.courseId && coupon.courseId !== courseId) throw new ValidationError('Coupon is not valid for this course');
    return coupon;
  }
}
