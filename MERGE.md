# Using @ecom + @course Together

Both platforms share the same database, same auth, same Stripe account. Zero table conflicts.

## Setup

1. Install both:

```bash
npm install @ecom/next @course/next
```

2. One database — both use their own prefixed tables (`ecom_*` and `course_*`):

```bash
npx drizzle-kit push  # creates all tables from both platforms
```

3. One auth — pass the same auth adapter to both:

```ts
// lib/platform.ts
import { createEcom } from '@ecom/next';
import { createCourse } from '@course/next';

const sharedAuth = {
  validateToken: async (token: string) => { /* your auth logic */ },
};

export const ecom = createEcom({
  databaseUrl: process.env.DATABASE_URL!,
  auth: sharedAuth,
  stripe: { secretKey: process.env.STRIPE_SECRET_KEY!, webhookSecret: process.env.STRIPE_WEBHOOK_SECRET! },
});

export const course = createCourse({
  databaseUrl: process.env.DATABASE_URL!,
  auth: sharedAuth,
  stripe: { secretKey: process.env.STRIPE_SECRET_KEY!, webhookSecret: process.env.STRIPE_WEBHOOK_SECRET! },
});
```

## Routes

```
app/api/ecom/[...ecom]/route.ts    -> handles /api/ecom/*
app/api/course/[...course]/route.ts -> handles /api/course/*
```

No conflicts — different base paths.

## Admin

Both admin dashboards can live in the same portal:

```
/portal/ecommerce/*   -> ecom admin pages
/portal/courses/*     -> course admin pages
```

They share the same admin shell, same auth, same sidebar.

## Shared Tables

| Table prefix | Used by |
|-------------|---------|
| `course_users` / `course_sessions` | Both (same auth system) |
| `course_email_*` | Both (same email system) |
| `ecom_*` | E-commerce only |
| `course_*` | Courses only |

## What Overlaps

| System | How it's shared |
|--------|----------------|
| **Auth** | One adapter, one user table |
| **Payments** | Same Stripe account, different product types |
| **Email** | Same SES credentials, different templates and event triggers |
| **Customers = Students** | Same person, different context |

## Example: Unified Sidebar

```tsx
const sidebarItems = [
  // E-commerce
  { label: 'Orders', href: '/portal/ecommerce/orders', icon: OrderIcon },
  { label: 'Products', href: '/portal/ecommerce/products', icon: ProductIcon },
  { label: 'Customers', href: '/portal/ecommerce/customers', icon: CustomerIcon },
  // Courses
  { label: 'Courses', href: '/portal/courses', icon: CourseIcon },
  { label: 'Students', href: '/portal/courses/students', icon: StudentIcon },
  { label: 'Enrollments', href: '/portal/courses/enrollments', icon: EnrollIcon },
  // Shared
  { label: 'Settings', href: '/portal/settings', icon: SettingsIcon },
];
```

## Bundle Purchase -> Course Enrollment

To auto-enroll a customer in a course when they buy a product:

```ts
import { eventBus } from '@ecom/server';
import { getCourse } from '@course/next';

eventBus.on('order.created', async ({ orderId }) => {
  const course = getCourse();
  // Look up which course this product maps to
  const courseId = await getLinkedCourseId(orderId);
  if (courseId) {
    await course.enrollments.enroll(courseId, order.customerId, 'purchase');
  }
});
```
