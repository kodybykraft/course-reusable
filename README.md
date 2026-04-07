# @course — Reusable Course Platform

A drop-in LMS backend for Next.js. Plug it into any app with `npm install`, one config file, and a catch-all route. Full Kajabi/Thinkific replacement as reusable infrastructure.

Built and maintained by [Kode by Kraft](https://kodebykraft.com).

## What You Get

- **Course management** — courses, modules, lessons (video/text/PDF/audio/embed), drip scheduling
- **Student experience** — enrollment, progress tracking, bookmarks, notes
- **Assessments** — quizzes (MC, T/F, fill-blank, essay) with auto-grading, assignments with manual grading
- **Certificates** — auto-issue on completion with unique verification codes
- **Commerce** — Stripe Checkout (one-time + subscriptions), membership plans, coupons, refunds
- **Community** — course discussions, lesson comments, threaded replies, moderation (pin/lock)
- **Email marketing** — AWS SES transactional emails, campaigns, automations, contact management
- **Admin dashboard** — 10+ interactive pages (courses, students, enrollments, quizzes, revenue, settings)
- **React components** — CourseCard, LessonPlayer, QuizPlayer, StudentDashboard, ModuleSidebar, etc.
- **React hooks** — useCourses, useEnrollment, useCourseProgress, useCheckout, useDiscussions, etc.

## Quick Start

```bash
npm install @course/next @course/react
```

### 1. Configure

```ts
// lib/course.ts
import { createCourse } from '@course/next';

export const course = createCourse({
  databaseUrl: process.env.DATABASE_URL!,
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  email: {
    provider: 'ses',
    region: process.env.SES_REGION!,
    fromEmail: process.env.SES_FROM_EMAIL!,
    fromName: process.env.SES_FROM_NAME,
    accessKeyId: process.env.SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
  },
});
```

### 2. API Route

```ts
// app/api/course/[...course]/route.ts
import { createCourseRouteHandler } from '@course/next';
import '../../../lib/course';

export const dynamic = 'force-dynamic';
export const { GET, POST, PATCH, DELETE } = createCourseRouteHandler();
```

### 3. Middleware (optional)

```ts
// middleware.ts
import { createCourseMiddleware } from '@course/next';
import './lib/course';

export default createCourseMiddleware();
export const config = { matcher: ['/admin/:path*', '/api/course/:path*'] };
```

### 4. Push Schema

```bash
npx drizzle-kit push
```

### 5. Use React Components

```tsx
import { CourseProvider, CourseGrid, useCourses } from '@course/react';

function App() {
  return (
    <CourseProvider apiBase="/api/course">
      <CourseCatalog />
    </CourseProvider>
  );
}

function CourseCatalog() {
  const { courses, loading } = useCourses();
  if (loading) return <p>Loading...</p>;
  return <CourseGrid courses={courses} onCourseClick={(slug) => router.push(`/courses/${slug}`)} />;
}
```

## Architecture

```
@course/core          -> (none)           Pure types, utils, error classes
@course/db            -> core             PostgreSQL + Drizzle ORM (~35 tables)
@course/server        -> core, db         15 services, event bus, middleware
@course/integrations  -> core             Stripe, PayPal providers
@course/next          -> server, db, etc  Factory, route handler, middleware
@course/react         -> core             Components + hooks (CourseProvider)
@course/admin         -> core, ui         Admin dashboard components
@course/email         -> core, db         SES, templates, campaigns, automations
@course/analytics     -> core, db         Course analytics + engagement stats
@course/ui            -> (none)           Base UI primitives
```

## Packages

| Package | Description |
|---------|-------------|
| `@course/next` | Main entry point. `createCourse()` factory, route handler, middleware |
| `@course/react` | Student-facing components and hooks |
| `@course/server` | Backend services (CourseService, EnrollmentService, etc.) |
| `@course/db` | Database schema and Drizzle ORM client |
| `@course/admin` | Admin dashboard page components |
| `@course/email` | Email marketing (SES, templates, campaigns, automations) |
| `@course/integrations` | Payment providers (Stripe, PayPal) |
| `@course/core` | Shared types, utilities, error classes |
| `@course/analytics` | Course analytics and engagement tracking |
| `@course/ui` | Base UI components |

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List published courses |
| GET | `/courses/:slug` | Course detail with modules |
| GET | `/plans` | List membership plans |
| POST | `/auth/login` | Login (returns HttpOnly cookie) |
| POST | `/auth/register` | Register new student |

### Student (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/my/courses` | Enrolled courses |
| GET | `/my/dashboard` | Student dashboard |
| GET | `/my/purchases` | Purchase history |
| GET | `/my/subscriptions` | Active subscriptions |
| POST | `/courses/:slug/enroll` | Enroll in free course |
| POST | `/checkout` | Create Stripe checkout session |
| POST | `/subscriptions` | Subscribe to plan |
| POST | `/my/courses/:id/lessons/:id/complete` | Mark lesson complete |
| POST | `/quizzes/:id/submit` | Submit quiz answers |
| POST | `/courses/:slug/discussions` | Create discussion |
| POST | `/discussions/:id/reply` | Reply to discussion |
| POST | `/lessons/:id/comments` | Add lesson comment |

### Admin (requires admin/staff role)
Full CRUD for courses, modules, lessons, enrollments, quizzes, assignments, discussions, coupons, membership plans, webhooks, staff, settings.

## React Components

| Component | Description |
|-----------|-------------|
| `CourseProvider` | Context provider with API fetcher |
| `CourseCard` | Course card with thumbnail, price, progress |
| `CourseGrid` | Filterable course catalog grid |
| `LessonPlayer` | Video (YouTube/Vimeo/direct), audio, text, PDF, embed |
| `ModuleSidebar` | Collapsible module/lesson navigation |
| `ProgressBar` | Animated progress bar |
| `QuizPlayer` | Interactive quiz (MC, T/F, fill-blank, essay) |
| `StudentDashboard` | Enrolled courses overview |
| `CertificateCard` | Certificate display with verify link |

## React Hooks

| Hook | Description |
|------|-------------|
| `useAuth()` | Login, register, logout |
| `useCourses()` | Course catalog with search |
| `useCourseDetail(slug)` | Single course with modules |
| `useEnrollment()` | Enroll in a course |
| `useCourseProgress(courseId)` | Progress tracking + mark complete |
| `useQuiz()` | Submit quiz and get results |
| `useCheckout()` | Stripe checkout + coupon validation |
| `useSubscription()` | Subscribe/cancel membership |
| `useStudentDashboard()` | Dashboard data |
| `useDiscussions(courseSlug)` | Course discussions |
| `useDiscussion(id)` | Discussion detail + reply |
| `useLessonComments(lessonId)` | Lesson comments |

## Email Templates

6 transactional email templates (HTML + plain text) auto-seeded on first run:

| Template | Trigger |
|----------|---------|
| Enrollment Confirmation | Student enrolls in course |
| Course Completed | Student completes all lessons |
| Certificate Issued | Certificate generated |
| Quiz Passed | Student passes a quiz |
| Lesson Unlocked | Drip content released |
| Abandoned Course Nudge | 7 days inactive (polling) |

## Embedding in Existing App

If you have an existing admin dashboard, import individual page components:

```tsx
import { CoursesListClient } from '@course/demo/admin/courses';
// Or build your own pages using the hooks and @course/server services
```

See [MERGE.md](./MERGE.md) for running @course alongside @ecom in the same app.

## Environment Variables

See [.env.example](./.env.example) for all required and optional variables.

## Development

```bash
pnpm install
pnpm dev        # Start demo app
pnpm build      # Build all packages
pnpm typecheck  # Type-check all packages
pnpm test       # Run tests
pnpm db:push    # Push schema to database
```

## License

MIT
