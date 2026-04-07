import { eq, desc, and, sql } from 'drizzle-orm';
import { courseCoupons } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class CouponService {
  constructor(private db: Database) {}

  async list(pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.courseCoupons.findMany({
        limit: pageSize,
        offset,
        orderBy: desc(courseCoupons.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseCoupons),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const coupon = await this.db.query.courseCoupons.findFirst({
      where: eq(courseCoupons.id, id),
    });
    if (!coupon) throw new NotFoundError('Coupon', id);
    return coupon;
  }

  async create(input: {
    code: string;
    type: string;
    value: number;
    courseId?: string;
    usageLimit?: number;
    startsAt?: Date;
    expiresAt?: Date;
  }) {
    const existing = await this.db.query.courseCoupons.findFirst({
      where: eq(courseCoupons.code, input.code),
    });
    if (existing) throw new ValidationError('Coupon code already exists');

    const [coupon] = await this.db
      .insert(courseCoupons)
      .values({
        code: input.code,
        type: input.type,
        value: input.value,
        courseId: input.courseId ?? null,
        usageLimit: input.usageLimit ?? null,
        usageCount: 0,
        isActive: true,
        startsAt: input.startsAt ?? new Date(),
        expiresAt: input.expiresAt ?? null,
      })
      .returning();

    return coupon;
  }

  async update(id: string, input: Partial<{
    code: string;
    type: string;
    value: number;
    courseId: string | null;
    usageLimit: number | null;
    startsAt: Date;
    expiresAt: Date | null;
    isActive: boolean;
  }>) {
    await this.getById(id);
    await this.db.update(courseCoupons).set(input).where(eq(courseCoupons.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.db.delete(courseCoupons).where(eq(courseCoupons.id, id));
  }

  async validate(code: string, courseId?: string) {
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

  async calculateDiscount(code: string, originalPrice: number) {
    const coupon = await this.validate(code);

    let discount: number;
    if (coupon.type === 'percentage') {
      discount = Math.round(originalPrice * coupon.value / 100);
    } else {
      discount = Math.min(coupon.value, originalPrice);
    }

    return {
      originalPrice,
      discount,
      finalPrice: originalPrice - discount,
      coupon,
    };
  }
}
