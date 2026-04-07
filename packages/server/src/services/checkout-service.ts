import { eq, and } from 'drizzle-orm';
import { coursePurchases, courseProducts, courseEnrollments, courseCoupons } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

interface StripeProvider {
  createCheckoutSession(input: {
    mode: 'payment' | 'subscription';
    lineItems: { priceInCents: number; name: string; quantity: number }[];
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    metadata?: Record<string, string>;
    stripePriceId?: string;
  }): Promise<{ sessionId: string; url: string }>;
  getCheckoutSession(sessionId: string): Promise<{
    id: string;
    paymentStatus: string;
    paymentIntentId: string | null;
    subscriptionId: string | null;
    customerId: string | null;
    metadata: Record<string, string>;
  }>;
  verifyWebhookSignatureAsync(payload: string, signature: string): Promise<boolean>;
}

export class CheckoutService {
  constructor(
    private db: Database,
    private stripe: StripeProvider | null,
  ) {}

  /**
   * Create a Stripe Checkout Session for a course purchase.
   * Returns the session URL to redirect the student to.
   */
  async createCheckout(input: {
    studentId: string;
    productId: string;
    couponCode?: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    if (!this.stripe) throw new ValidationError('Stripe is not configured');

    const product = await this.db.query.courseProducts.findFirst({
      where: eq(courseProducts.id, input.productId),
      with: { course: true },
    });
    if (!product) throw new NotFoundError('Product', input.productId);

    // Free courses — enroll directly, no Stripe
    if (product.type === 'free' || product.price === 0) {
      return this.enrollFree(input.studentId, product);
    }

    let amount = product.price;
    let couponId: string | null = null;

    if (input.couponCode) {
      const coupon = await this.validateCoupon(input.couponCode, product.courseId);
      const discount =
        coupon.type === 'percentage'
          ? Math.round(amount * coupon.value / 100)
          : Math.min(coupon.value, amount);
      amount = amount - discount;
      couponId = coupon.id;

      // Fully discounted — enroll for free
      if (amount <= 0) {
        await this.incrementCouponUsage(coupon.id);
        return this.enrollFree(input.studentId, product);
      }
    }

    // Create pending purchase record
    const [purchase] = await this.db.insert(coursePurchases).values({
      studentId: input.studentId,
      productId: input.productId,
      amount,
      currency: product.currency,
      status: 'pending',
      couponId,
    }).returning();

    // Create Stripe Checkout Session
    const session = await this.stripe.createCheckoutSession({
      mode: product.type === 'subscription' ? 'subscription' : 'payment',
      lineItems: [{ priceInCents: amount, name: (product as any).course?.title ?? 'Course', quantity: 1 }],
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      metadata: {
        purchaseId: purchase.id,
        studentId: input.studentId,
        courseId: product.courseId,
        productId: product.id,
      },
    });

    return {
      type: 'redirect' as const,
      checkoutUrl: session.url,
      sessionId: session.sessionId,
      purchaseId: purchase.id,
    };
  }

  /**
   * Handle Stripe webhook events.
   * Called from the route handler after signature verification.
   */
  async handleWebhookEvent(event: { type: string; data: { object: Record<string, any> } }) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const purchaseId = session.metadata?.purchaseId;
        if (!purchaseId) return { handled: false, reason: 'no purchaseId in metadata' };

        const purchase = await this.db.query.coursePurchases.findFirst({
          where: eq(coursePurchases.id, purchaseId),
        });
        if (!purchase || purchase.status === 'completed') {
          return { handled: true, reason: 'already processed or not found' };
        }

        // Mark purchase complete
        await this.db.update(coursePurchases).set({
          status: 'completed',
          stripePaymentIntentId: session.payment_intent ?? session.subscription ?? null,
        }).where(eq(coursePurchases.id, purchaseId));

        // Auto-enroll
        const product = await this.db.query.courseProducts.findFirst({
          where: eq(courseProducts.id, purchase.productId),
        });

        if (product) {
          // Check for existing enrollment
          const existing = await this.db.query.courseEnrollments.findFirst({
            where: and(
              eq(courseEnrollments.courseId, product.courseId),
              eq(courseEnrollments.studentId, purchase.studentId),
            ),
          });

          if (!existing) {
            await this.db.insert(courseEnrollments).values({
              courseId: product.courseId,
              studentId: purchase.studentId,
              source: 'purchase',
            });
          }

          // Increment coupon usage
          if (purchase.couponId) {
            await this.incrementCouponUsage(purchase.couponId);
          }

          await eventBus.emit('purchase.completed', {
            purchaseId,
            studentId: purchase.studentId,
            courseId: product.courseId,
            amount: purchase.amount,
          });
        }

        return { handled: true };
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        // Optionally handle subscription cancellation (pause enrollment)
        await eventBus.emit('subscription.cancelled', {
          stripeSubscriptionId: sub.id,
        });
        return { handled: true };
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await eventBus.emit('subscription.payment_failed', {
          stripeSubscriptionId: invoice.subscription,
          invoiceId: invoice.id,
        });
        return { handled: true };
      }

      default:
        return { handled: false };
    }
  }

  private async enrollFree(studentId: string, product: any) {
    // Check existing enrollment
    const existing = await this.db.query.courseEnrollments.findFirst({
      where: and(
        eq(courseEnrollments.courseId, product.courseId),
        eq(courseEnrollments.studentId, studentId),
      ),
    });

    if (!existing) {
      await this.db.insert(courseEnrollments).values({
        courseId: product.courseId,
        studentId,
        source: 'free',
      });
    }

    // Record $0 purchase
    const [purchase] = await this.db.insert(coursePurchases).values({
      studentId,
      productId: product.id,
      amount: 0,
      currency: product.currency,
      status: 'completed',
    }).returning();

    await eventBus.emit('enrollment.created', {
      courseId: product.courseId,
      studentId,
      source: 'free',
    });

    return {
      type: 'enrolled' as const,
      purchaseId: purchase.id,
      courseId: product.courseId,
    };
  }

  private async validateCoupon(code: string, courseId: string) {
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

  private async incrementCouponUsage(couponId: string) {
    await this.db.update(courseCoupons).set({
      usageCount: (await this.db.query.courseCoupons.findFirst({ where: eq(courseCoupons.id, couponId) }))!.usageCount + 1,
    }).where(eq(courseCoupons.id, couponId));
  }
}
