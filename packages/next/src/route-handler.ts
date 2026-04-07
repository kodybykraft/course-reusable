import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handleError, getStatusCode, RateLimiter } from '@course/server';
import { getCourse } from './create-course.js';
import type { Course } from './create-course.js';
import { requireAdmin } from './admin-auth.js';

const authRateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 10 });

function getSegments(request: NextRequest): string[] {
  const app = getCourse();
  const url = new URL(request.url);
  const basePath = app.config.apiBasePath;
  let pathname = url.pathname;
  if (pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }
  return pathname.split('/').filter(Boolean);
}

async function authenticateRequest(request: NextRequest, app: Course) {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies?.get('course_token')?.value;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;
  if (!token) return null;
  return app.auth.validateToken(token);
}

function unauthorizedResponse() {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', statusCode: 401 } }, { status: 401 });
}

function parsePagination(url: URL) {
  const page = url.searchParams.get('page');
  const pageSize = url.searchParams.get('pageSize');
  const pagination: Record<string, number> = {};
  if (page) pagination.page = Number(page);
  if (pageSize) pagination.pageSize = Number(pageSize);
  return Object.keys(pagination).length ? pagination : undefined;
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
async function handleGET(request: NextRequest) {
  try {
    const parts = getSegments(request);
    const app = getCourse();
    const url = new URL(request.url);
    const pagination = parsePagination(url);

    // Admin routes
    if (parts[0] === 'admin') {
      await requireAdmin(request);
      return handleAdminGET(app, parts.slice(1), url, pagination);
    }

    // GET /courses — public listing
    if (parts[0] === 'courses' && !parts[1]) {
      const filter: Record<string, string> = { status: 'published' };
      const search = url.searchParams.get('search');
      const categoryId = url.searchParams.get('categoryId');
      if (search) filter.search = search;
      if (categoryId) filter.categoryId = categoryId;
      const result = await app.courses.list(filter as any, pagination as any);
      return NextResponse.json(result);
    }

    // GET /courses/:slug — public detail
    if (parts[0] === 'courses' && parts[1] && !parts[2]) {
      const course = await app.courses.getBySlug(parts[1]);
      const modules = await app.modules.listByCourse(course.id);
      return NextResponse.json({ ...course, modules });
    }

    // GET /courses/:id/modules — public module list
    if (parts[0] === 'courses' && parts[1] && parts[2] === 'modules') {
      const course = await app.courses.getBySlug(parts[1]);
      const modules = await app.modules.listByCourse(course.id);
      return NextResponse.json(modules);
    }

    // GET /my/courses — student's enrolled courses (requires auth)
    if (parts[0] === 'my' && parts[1] === 'courses' && !parts[2]) {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const courses = await app.enrollments.getStudentCourses(user.id);
      return NextResponse.json(courses);
    }

    // GET /my/courses/:id/progress — student progress
    if (parts[0] === 'my' && parts[1] === 'courses' && parts[2] && parts[3] === 'progress') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const enrollments = await app.enrollments.getStudentCourses(user.id);
      const enrollment = enrollments.find((e) => e.courseId === parts[2]);
      if (!enrollment) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not enrolled', statusCode: 404 } }, { status: 404 });
      const progress = await app.progress.getCourseProgress(enrollment.id);
      return NextResponse.json(progress);
    }

    // GET /plans — public membership plans
    if (parts[0] === 'plans' && !parts[1]) {
      const result = await app.subscriptions.listPlans(pagination as any);
      return NextResponse.json(result);
    }

    // GET /my/subscriptions — student subscriptions
    if (parts[0] === 'my' && parts[1] === 'subscriptions') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const subs = await app.subscriptions.getStudentSubscriptions(user.id);
      return NextResponse.json(subs);
    }

    // GET /my/purchases — student purchase history
    if (parts[0] === 'my' && parts[1] === 'purchases') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const purchases = await app.purchases.getStudentPurchases(user.id);
      return NextResponse.json(purchases);
    }

    // GET /my/dashboard — student dashboard
    if (parts[0] === 'my' && parts[1] === 'dashboard') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const dashboard = await app.progress.getStudentDashboard(user.id);
      return NextResponse.json(dashboard);
    }

    // GET /courses/:slug/discussions — course discussions
    if (parts[0] === 'courses' && parts[1] && parts[2] === 'discussions' && !parts[3]) {
      const course = await app.courses.getBySlug(parts[1]);
      const result = await app.discussions.listByCourse(course.id, pagination as any);
      return NextResponse.json(result);
    }

    // GET /discussions/:id — single discussion with replies
    if (parts[0] === 'discussions' && parts[1] && !parts[2]) {
      const discussion = await app.discussions.getById(parts[1]);
      return NextResponse.json(discussion);
    }

    // GET /lessons/:id/comments — lesson comments
    if (parts[0] === 'lessons' && parts[1] && parts[2] === 'comments') {
      const comments = await app.discussions.listLessonComments(parts[1], pagination as any);
      return NextResponse.json(comments);
    }

    // POST /auth/login
    if (parts[0] === 'auth' && parts[1] === 'login') {
      // handled in POST
    }

    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Route not found', statusCode: 404 } }, { status: 404 });
  } catch (err) {
    const body = handleError(err);
    return NextResponse.json(body, { status: getStatusCode(err) });
  }
}

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
async function handlePOST(request: NextRequest) {
  try {
    const parts = getSegments(request);
    const app = getCourse();

    // Rate limit auth endpoints
    if (parts[0] === 'auth') {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      const { allowed } = authRateLimiter.check(`auth:${ip}`);
      if (!allowed) {
        return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests', statusCode: 429 } }, { status: 429 });
      }
    }

    // Admin routes
    if (parts[0] === 'admin') {
      await requireAdmin(request);
      const body = await request.json();
      return handleAdminPOST(app, parts.slice(1), body);
    }

    // POST /courses/:id/enroll — enroll in course (requires auth)
    if (parts[0] === 'courses' && parts[1] && parts[2] === 'enroll') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const course = await app.courses.getBySlug(parts[1]);
      const enrollment = await app.enrollments.enroll(course.id, user.id, 'free');
      return NextResponse.json(enrollment, { status: 201 });
    }

    // POST /my/courses/:id/lessons/:lessonId/progress
    if (parts[0] === 'my' && parts[1] === 'courses' && parts[2] && parts[3] === 'lessons' && parts[4] && parts[5] === 'progress') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const enrollments = await app.enrollments.getStudentCourses(user.id);
      const enrollment = enrollments.find((e) => e.courseId === parts[2]);
      if (!enrollment) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not enrolled', statusCode: 404 } }, { status: 404 });
      const progress = await app.progress.trackLessonProgress(enrollment.id, parts[4], body.status, body.watchTime);
      return NextResponse.json(progress);
    }

    // POST /my/courses/:id/lessons/:lessonId/complete
    if (parts[0] === 'my' && parts[1] === 'courses' && parts[2] && parts[3] === 'lessons' && parts[4] && parts[5] === 'complete') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const enrollments = await app.enrollments.getStudentCourses(user.id);
      const enrollment = enrollments.find((e) => e.courseId === parts[2]);
      if (!enrollment) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not enrolled', statusCode: 404 } }, { status: 404 });
      await app.progress.markLessonComplete(enrollment.id, parts[4]);
      return NextResponse.json({ success: true });
    }

    // POST /quizzes/:id/submit
    if (parts[0] === 'quizzes' && parts[1] && parts[2] === 'submit') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const result = await app.quizzes.submitAttempt(parts[1], user.id, body.answers);
      return NextResponse.json(result);
    }

    // POST /checkout — create checkout session
    if (parts[0] === 'checkout' && !parts[1]) {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const result = await app.checkout.createCheckout({
        studentId: user.id,
        productId: body.productId,
        couponCode: body.couponCode,
        successUrl: body.successUrl,
        cancelUrl: body.cancelUrl,
      });
      return NextResponse.json(result, { status: 201 });
    }

    // POST /webhooks/stripe — Stripe webhook handler
    if (parts[0] === 'webhooks' && parts[1] === 'stripe') {
      const rawBody = await request.text();
      const signature = request.headers.get('stripe-signature');
      if (!signature || !app.stripe) {
        return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Missing signature or Stripe not configured', statusCode: 400 } }, { status: 400 });
      }

      const valid = await app.stripe.verifyWebhookSignatureAsync(rawBody, signature);
      if (!valid) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid signature', statusCode: 401 } }, { status: 401 });
      }

      const event = JSON.parse(rawBody);
      const result = await app.checkout.handleWebhookEvent(event);
      return NextResponse.json(result);
    }

    // POST /subscriptions — subscribe to a plan
    if (parts[0] === 'subscriptions' && !parts[1]) {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const result = await app.subscriptions.subscribe(user.id, body.planId, body.stripeCustomerId);
      return NextResponse.json(result, { status: 201 });
    }

    // POST /subscriptions/:id/cancel
    if (parts[0] === 'subscriptions' && parts[1] && parts[2] === 'cancel') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const result = await app.subscriptions.cancel(parts[1]);
      return NextResponse.json(result);
    }

    // POST /courses/:slug/discussions — create discussion (authenticated)
    if (parts[0] === 'courses' && parts[1] && parts[2] === 'discussions') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const course = await app.courses.getBySlug(parts[1]);
      const discussion = await app.discussions.create(course.id, user.id, body.title, body.content);
      return NextResponse.json(discussion, { status: 201 });
    }

    // POST /discussions/:id/reply — reply to discussion (authenticated)
    if (parts[0] === 'discussions' && parts[1] && parts[2] === 'reply') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const reply = await app.discussions.reply(parts[1], user.id, body.content, body.parentReplyId);
      return NextResponse.json(reply, { status: 201 });
    }

    // POST /lessons/:id/comments — add lesson comment (authenticated)
    if (parts[0] === 'lessons' && parts[1] && parts[2] === 'comments') {
      const user = await authenticateRequest(request, app);
      if (!user) return unauthorizedResponse();
      const body = await request.json();
      const comment = await app.discussions.addLessonComment(parts[1], user.id, body.content, body.parentCommentId);
      return NextResponse.json(comment, { status: 201 });
    }

    // POST /coupons/validate — validate coupon code
    if (parts[0] === 'coupons' && parts[1] === 'validate') {
      const body = await request.json();
      const result = await app.coupons.calculateDiscount(body.code, body.price);
      return NextResponse.json(result);
    }

    // POST /auth/login
    if (parts[0] === 'auth' && parts[1] === 'login') {
      const body = await request.json();
      if (!app.auth.login) return NextResponse.json({ error: { code: 'NOT_CONFIGURED', message: 'Built-in auth not enabled', statusCode: 501 } }, { status: 501 });
      const result = await app.auth.login(body.email, body.password);
      const response = NextResponse.json(result);
      response.cookies.set('course_token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 30 * 24 * 60 * 60 });
      return response;
    }

    // POST /auth/register
    if (parts[0] === 'auth' && parts[1] === 'register') {
      const body = await request.json();
      if (!app.auth.register) return NextResponse.json({ error: { code: 'NOT_CONFIGURED', message: 'Built-in auth not enabled', statusCode: 501 } }, { status: 501 });
      const result = await app.auth.register({ email: body.email, password: body.password, firstName: body.firstName, lastName: body.lastName });
      return NextResponse.json(result, { status: 201 });
    }

    // POST /auth/logout
    if (parts[0] === 'auth' && parts[1] === 'logout') {
      const body = await request.json().catch(() => ({}));
      const cookieToken = request.cookies?.get('course_token')?.value;
      if (app.auth.logout) await app.auth.logout((body as any).token ?? cookieToken);
      const response = NextResponse.json({ success: true });
      response.cookies.set('course_token', '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
      return response;
    }

    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Route not found', statusCode: 404 } }, { status: 404 });
  } catch (err) {
    const body = handleError(err);
    return NextResponse.json(body, { status: getStatusCode(err) });
  }
}

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------
async function handlePATCH(request: NextRequest) {
  try {
    const parts = getSegments(request);
    const app = getCourse();

    if (parts[0] === 'admin') {
      await requireAdmin(request);
      const body = await request.json();
      return handleAdminPATCH(app, parts.slice(1), body);
    }

    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Route not found', statusCode: 404 } }, { status: 404 });
  } catch (err) {
    const body = handleError(err);
    return NextResponse.json(body, { status: getStatusCode(err) });
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
async function handleDELETE(request: NextRequest) {
  try {
    const parts = getSegments(request);
    const app = getCourse();

    if (parts[0] === 'admin') {
      await requireAdmin(request);
      return handleAdminDELETE(app, parts.slice(1));
    }

    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Route not found', statusCode: 404 } }, { status: 404 });
  } catch (err) {
    const body = handleError(err);
    return NextResponse.json(body, { status: getStatusCode(err) });
  }
}

// ---------------------------------------------------------------------------
// Admin GET handlers
// ---------------------------------------------------------------------------
async function handleAdminGET(app: Course, segments: string[], url: URL, pagination: any) {
  const s = segments;

  if (s[0] === 'courses' && !s[1]) return NextResponse.json(await app.courses.list({ status: url.searchParams.get('status') ?? undefined, search: url.searchParams.get('search') ?? undefined } as any, pagination));
  if (s[0] === 'courses' && s[1] && !s[2]) return NextResponse.json(await app.courses.getById(s[1]));
  if (s[0] === 'courses' && s[1] && s[2] === 'modules') return NextResponse.json(await app.modules.listByCourse(s[1]));
  if (s[0] === 'modules' && s[1] && s[2] === 'lessons') return NextResponse.json(await app.lessons.listByModule(s[1]));
  if (s[0] === 'lessons' && s[1]) return NextResponse.json(await app.lessons.getById(s[1]));
  if (s[0] === 'enrollments' && !s[1]) return NextResponse.json(await app.enrollments.list({ courseId: url.searchParams.get('courseId') ?? undefined, studentId: url.searchParams.get('studentId') ?? undefined, status: url.searchParams.get('status') ?? undefined } as any, pagination));
  if (s[0] === 'enrollments' && s[1]) return NextResponse.json(await app.enrollments.getById(s[1]));
  if (s[0] === 'quizzes' && s[1]) return NextResponse.json(await app.quizzes.getById(s[1]));
  if (s[0] === 'assignments' && s[1] && s[2] === 'submissions') return NextResponse.json(await app.assignments.getSubmissions(s[1], pagination));
  if (s[0] === 'discussions' && !s[1]) return NextResponse.json(await app.discussions.listByCourse(url.searchParams.get('courseId') ?? '', pagination));
  if (s[0] === 'discussions' && s[1]) return NextResponse.json(await app.discussions.getById(s[1]));
  if (s[0] === 'purchases' && !s[1]) return NextResponse.json(await app.purchases.list({ studentId: url.searchParams.get('studentId') ?? undefined, status: url.searchParams.get('status') ?? undefined } as any, pagination));
  if (s[0] === 'coupons' && !s[1]) return NextResponse.json(await app.coupons.list(pagination));
  if (s[0] === 'coupons' && s[1]) return NextResponse.json(await app.coupons.getById(s[1]));
  if (s[0] === 'certificates' && s[1] === 'templates') return NextResponse.json(await app.certificates.listTemplates());
  if (s[0] === 'certificates' && s[1] === 'verify' && s[2]) return NextResponse.json(await app.certificates.verify(s[2]));
  if (s[0] === 'plans' && !s[1]) return NextResponse.json(await app.subscriptions.listPlans(pagination));
  if (s[0] === 'plans' && s[1]) return NextResponse.json(await app.subscriptions.getPlan(s[1]));
  if (s[0] === 'subscriptions' && !s[1]) return NextResponse.json(await app.subscriptions.listSubscriptions({ status: url.searchParams.get('status') ?? undefined, planId: url.searchParams.get('planId') ?? undefined } as any, pagination));
  if (s[0] === 'webhooks' && !s[1]) return NextResponse.json(await app.webhooks.list());
  if (s[0] === 'settings' && s[1]) return NextResponse.json(await app.settings.getByGroup(s[1]));
  if (s[0] === 'staff' && !s[1]) return NextResponse.json(await app.staff.list());

  return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Admin route not found', statusCode: 404 } }, { status: 404 });
}

// ---------------------------------------------------------------------------
// Admin POST handlers
// ---------------------------------------------------------------------------
async function handleAdminPOST(app: Course, segments: string[], body: any) {
  const s = segments;

  if (s[0] === 'courses' && !s[1]) return NextResponse.json(await app.courses.create(body), { status: 201 });
  if (s[0] === 'courses' && s[1] && s[2] === 'publish') return NextResponse.json(await app.courses.publish(s[1]));
  if (s[0] === 'courses' && s[1] && s[2] === 'unpublish') return NextResponse.json(await app.courses.unpublish(s[1]));
  if (s[0] === 'courses' && s[1] && s[2] === 'modules') return NextResponse.json(await app.modules.create({ courseId: s[1], ...body }), { status: 201 });
  if (s[0] === 'modules' && s[1] && s[2] === 'lessons') return NextResponse.json(await app.lessons.create({ moduleId: s[1], ...body }), { status: 201 });
  if (s[0] === 'lessons' && s[1] && s[2] === 'content') return NextResponse.json(await app.lessons.addContent(s[1], body), { status: 201 });
  if (s[0] === 'lessons' && s[1] && s[2] === 'resources') return NextResponse.json(await app.lessons.addResource(s[1], body), { status: 201 });
  if (s[0] === 'enrollments') return NextResponse.json(await app.enrollments.enroll(body.courseId, body.studentId, body.source), { status: 201 });
  if (s[0] === 'quizzes') return NextResponse.json(await app.quizzes.create(body), { status: 201 });
  if (s[0] === 'quizzes' && s[1] && s[2] === 'questions') return NextResponse.json(await app.quizzes.addQuestion(s[1], body), { status: 201 });
  if (s[0] === 'assignments') return NextResponse.json(await app.assignments.create(body), { status: 201 });
  if (s[0] === 'assignments' && s[1] && s[2] === 'grade') return NextResponse.json(await app.assignments.grade(s[1], body.grade, body.feedback, body.gradedBy));
  if (s[0] === 'discussions') return NextResponse.json(await app.discussions.create(body.courseId, body.authorId, body.title, body.content), { status: 201 });
  if (s[0] === 'discussions' && s[1] && s[2] === 'reply') return NextResponse.json(await app.discussions.reply(s[1], body.authorId, body.content, body.parentReplyId), { status: 201 });
  if (s[0] === 'discussions' && s[1] && s[2] === 'pin') return NextResponse.json(await app.discussions.pin(s[1]));
  if (s[0] === 'discussions' && s[1] && s[2] === 'lock') return NextResponse.json(await app.discussions.lock(s[1]));
  if (s[0] === 'coupons') return NextResponse.json(await app.coupons.create(body), { status: 201 });
  if (s[0] === 'certificates' && s[1] === 'templates') return NextResponse.json(await app.certificates.createTemplate(body), { status: 201 });
  if (s[0] === 'certificates' && s[1] === 'issue') return NextResponse.json(await app.certificates.issue(body.enrollmentId), { status: 201 });
  if (s[0] === 'plans') return NextResponse.json(await app.subscriptions.createPlan(body), { status: 201 });
  if (s[0] === 'purchases' && s[1] && s[2] === 'refund') return NextResponse.json(await app.purchases.refund(s[1], body.reason));
  if (s[0] === 'webhooks') return NextResponse.json(await app.webhooks.create(body), { status: 201 });
  if (s[0] === 'staff') return NextResponse.json(await app.staff.create(body), { status: 201 });

  return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Admin route not found', statusCode: 404 } }, { status: 404 });
}

// ---------------------------------------------------------------------------
// Admin PATCH handlers
// ---------------------------------------------------------------------------
async function handleAdminPATCH(app: Course, segments: string[], body: any) {
  const s = segments;

  if (s[0] === 'courses' && s[1] && !s[2]) return NextResponse.json(await app.courses.update(s[1], body));
  if (s[0] === 'modules' && s[1] && !s[2]) return NextResponse.json(await app.modules.update(s[1], body));
  if (s[0] === 'modules' && s[1] && s[2] === 'reorder') return NextResponse.json(await app.modules.reorder(s[1], body.moduleIds));
  if (s[0] === 'lessons' && s[1] && !s[2]) return NextResponse.json(await app.lessons.update(s[1], body));
  if (s[0] === 'lessons' && s[1] && s[2] === 'reorder') return NextResponse.json(await app.lessons.reorder(s[1], body.lessonIds));
  if (s[0] === 'enrollments' && s[1] && s[2] === 'complete') return NextResponse.json(await app.enrollments.complete(s[1]));
  if (s[0] === 'enrollments' && s[1] && s[2] === 'pause') return NextResponse.json(await app.enrollments.pause(s[1]));
  if (s[0] === 'enrollments' && s[1] && s[2] === 'resume') return NextResponse.json(await app.enrollments.resume(s[1]));
  if (s[0] === 'quizzes' && s[1] && !s[2]) return NextResponse.json(await app.quizzes.update(s[1], body));
  if (s[0] === 'questions' && s[1]) return NextResponse.json(await app.quizzes.updateQuestion(s[1], body));
  if (s[0] === 'assignments' && s[1]) return NextResponse.json(await app.assignments.update(s[1], body));
  if (s[0] === 'coupons' && s[1]) return NextResponse.json(await app.coupons.update(s[1], body));
  if (s[0] === 'certificates' && s[1] === 'templates' && s[2]) return NextResponse.json(await app.certificates.updateTemplate(s[2], body));
  if (s[0] === 'plans' && s[1]) return NextResponse.json(await app.subscriptions.updatePlan(s[1], body));
  if (s[0] === 'subscriptions' && s[1] && s[2] === 'cancel') return NextResponse.json(await app.subscriptions.cancel(s[1]));
  if (s[0] === 'webhooks' && s[1]) return NextResponse.json(await app.webhooks.update(s[1], body));
  if (s[0] === 'settings' && s[1]) { const entries = Object.entries(body).map(([key, value]) => ({ group: s[1], key, value: value as string })); return NextResponse.json(await app.settings.setBulk(entries as any)); }
  if (s[0] === 'staff' && s[1]) return NextResponse.json(await app.staff.update(s[1], body));

  return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Admin route not found', statusCode: 404 } }, { status: 404 });
}

// ---------------------------------------------------------------------------
// Admin DELETE handlers
// ---------------------------------------------------------------------------
async function handleAdminDELETE(app: Course, segments: string[]) {
  const s = segments;

  if (s[0] === 'courses' && s[1]) { await app.courses.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'modules' && s[1]) { await app.modules.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'lessons' && s[1]) { await app.lessons.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'content' && s[1]) { await app.lessons.removeContent(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'resources' && s[1]) { await app.lessons.removeResource(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'enrollments' && s[1]) { await app.enrollments.unenroll(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'quizzes' && s[1]) { await app.quizzes.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'questions' && s[1]) { await app.quizzes.deleteQuestion(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'assignments' && s[1]) { await app.assignments.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'discussions' && s[1]) { await app.discussions.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'coupons' && s[1]) { await app.coupons.delete(s[1]); return NextResponse.json({ success: true }); }
  if (s[0] === 'webhooks' && s[1]) { await app.webhooks.delete(s[1]); return NextResponse.json({ success: true }); }

  return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Admin route not found', statusCode: 404 } }, { status: 404 });
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
export function createCourseRouteHandler() {
  return {
    GET: handleGET,
    POST: handlePOST,
    PATCH: handlePATCH,
    DELETE: handleDELETE,
  };
}
