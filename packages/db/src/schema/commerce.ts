import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { courses } from './courses.js';
import { users } from './users.js';

export const courseProducts = pgTable(
  'course_products',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull().default('one_time'), // one_time, subscription, free
    price: integer('price').notNull().default(0), // cents
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    billingCycle: varchar('billing_cycle', { length: 20 }), // monthly, yearly (for subscriptions)
    trialDays: integer('trial_days'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_products_course_id_idx').on(table.courseId),
  ],
);

export const courseBundles = pgTable(
  'course_bundles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    price: integer('price').notNull(), // cents
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
);

export const courseBundleCourses = pgTable(
  'course_bundle_courses',
  {
    bundleId: text('bundle_id')
      .notNull()
      .references(() => courseBundles.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
  },
  (table) => [
    unique('course_bundle_course_unique').on(table.bundleId, table.courseId),
  ],
);

export const courseCoupons = pgTable(
  'course_coupons',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: varchar('code', { length: 50 }).notNull().unique(),
    type: varchar('type', { length: 20 }).notNull(), // percentage, fixed
    value: integer('value').notNull(), // percentage (0-100) or cents
    courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }), // null = all courses
    usageLimit: integer('usage_limit'),
    usageCount: integer('usage_count').notNull().default(0),
    startsAt: timestamp('starts_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_coupons_code_idx').on(table.code),
  ],
);

export const coursePurchases = pgTable(
  'course_purchases',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => courseProducts.id),
    amount: integer('amount').notNull(), // cents
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, completed, refunded
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    couponId: text('coupon_id').references(() => courseCoupons.id, { onDelete: 'set null' }),
    purchasedAt: timestamp('purchased_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_purchases_student_id_idx').on(table.studentId),
    index('course_purchases_product_id_idx').on(table.productId),
    index('course_purchases_status_idx').on(table.status),
  ],
);

export const courseSubscriptions = pgTable(
  'course_subscriptions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: text('plan_id')
      .notNull()
      .references(() => courseMembershipPlans.id),
    status: varchar('status', { length: 20 }).notNull().default('active'), // active, paused, cancelled, expired
    stripeSubscriptionId: text('stripe_subscription_id'),
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_subscriptions_student_id_idx').on(table.studentId),
    index('course_subscriptions_status_idx').on(table.status),
  ],
);

export const courseMembershipPlans = pgTable(
  'course_membership_plans',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: integer('price').notNull(), // cents
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    billingCycle: varchar('billing_cycle', { length: 20 }).notNull(), // monthly, yearly
    courseAccess: varchar('course_access', { length: 20 }).notNull().default('all'), // all, specific
    courseIds: jsonb('course_ids').$type<string[]>().default([]), // when courseAccess = 'specific'
    stripePriceId: text('stripe_price_id'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
);

export const courseRefunds = pgTable(
  'course_refunds',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    purchaseId: text('purchase_id')
      .notNull()
      .references(() => coursePurchases.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // cents
    reason: text('reason'),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processed
    stripeRefundId: text('stripe_refund_id'),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_refunds_purchase_id_idx').on(table.purchaseId),
  ],
);

export const courseReviews = pgTable(
  'course_reviews',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5
    title: varchar('title', { length: 255 }),
    content: text('content'),
    isVerified: boolean('is_verified').notNull().default(false), // purchased student
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    unique('course_review_unique').on(table.courseId, table.studentId),
    index('course_reviews_course_id_idx').on(table.courseId),
    index('course_reviews_rating_idx').on(table.rating),
  ],
);

// Relations
export const courseProductsRelations = relations(courseProducts, ({ one, many }) => ({
  course: one(courses, { fields: [courseProducts.courseId], references: [courses.id] }),
  purchases: many(coursePurchases),
}));

export const courseBundlesRelations = relations(courseBundles, ({ many }) => ({
  courses: many(courseBundleCourses),
}));

export const courseBundleCoursesRelations = relations(courseBundleCourses, ({ one }) => ({
  bundle: one(courseBundles, { fields: [courseBundleCourses.bundleId], references: [courseBundles.id] }),
  course: one(courses, { fields: [courseBundleCourses.courseId], references: [courses.id] }),
}));

export const coursePurchasesRelations = relations(coursePurchases, ({ one }) => ({
  student: one(users, { fields: [coursePurchases.studentId], references: [users.id] }),
  product: one(courseProducts, { fields: [coursePurchases.productId], references: [courseProducts.id] }),
  coupon: one(courseCoupons, { fields: [coursePurchases.couponId], references: [courseCoupons.id] }),
}));

export const courseSubscriptionsRelations = relations(courseSubscriptions, ({ one }) => ({
  student: one(users, { fields: [courseSubscriptions.studentId], references: [users.id] }),
  plan: one(courseMembershipPlans, { fields: [courseSubscriptions.planId], references: [courseMembershipPlans.id] }),
}));

export const courseRefundsRelations = relations(courseRefunds, ({ one }) => ({
  purchase: one(coursePurchases, { fields: [courseRefunds.purchaseId], references: [coursePurchases.id] }),
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
  course: one(courses, { fields: [courseReviews.courseId], references: [courses.id] }),
  student: one(users, { fields: [courseReviews.studentId], references: [users.id] }),
}));
