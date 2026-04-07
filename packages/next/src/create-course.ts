import { createDb } from '@course/db';
import type { Database } from '@course/db';
import { EcomError } from '@course/core';
import type { AuthAdapter } from '@course/server';
import {
  AuthService,
  ActivityLogService,
  PermissionService,
  WebhookService,
  SettingsService,
  StaffService,
  CourseService,
  ModuleService,
  LessonService,
  EnrollmentService,
  ProgressService,
  QuizService,
  AssignmentService,
  CertificateService,
  DiscussionService,
  PurchaseService,
  CouponService,
  CheckoutService,
  SubscriptionService,
  eventBus,
} from '@course/server';
import { StripeProvider } from '@course/integrations';

export interface CourseConfig {
  databaseUrl: string;
  apiBasePath?: string;
  adminBasePath?: string;
  auth?: AuthAdapter;
  stripe?: {
    secretKey: string;
    webhookSecret: string;
  };
  email?: {
    provider: 'ses';
    region: string;
    fromEmail: string;
    fromName?: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface Course {
  db: Database;
  auth: AuthAdapter;
  config: {
    apiBasePath: string;
    adminBasePath: string;
  };
  courses: CourseService;
  modules: ModuleService;
  lessons: LessonService;
  enrollments: EnrollmentService;
  progress: ProgressService;
  quizzes: QuizService;
  assignments: AssignmentService;
  certificates: CertificateService;
  discussions: DiscussionService;
  purchases: PurchaseService;
  coupons: CouponService;
  checkout: CheckoutService;
  subscriptions: SubscriptionService;
  stripe: StripeProvider | null;
  activityLog: ActivityLogService;
  permissions: PermissionService;
  webhooks: WebhookService;
  settings: SettingsService;
  staff: StaffService;
}

let instance: Course | null = null;
let instanceUrl: string | null = null;

export function createCourse(config: CourseConfig): Course {
  if (instance) {
    if (instanceUrl !== config.databaseUrl) {
      throw new EcomError(
        'createCourse() already initialized with a different database URL. Use getCourse() to retrieve the existing instance.',
        'ALREADY_INITIALIZED',
        500,
      );
    }
    return instance;
  }

  const db = createDb(config.databaseUrl);
  const auth = config.auth ?? new AuthService(db);
  const stripeProvider = config.stripe
    ? new StripeProvider({ secretKey: config.stripe.secretKey, webhookSecret: config.stripe.webhookSecret })
    : null;

  instanceUrl = config.databaseUrl;
  instance = {
    db,
    auth,
    config: {
      apiBasePath: config.apiBasePath ?? '/api/course',
      adminBasePath: config.adminBasePath ?? '/admin',
    },
    courses: new CourseService(db),
    modules: new ModuleService(db),
    lessons: new LessonService(db),
    enrollments: new EnrollmentService(db),
    progress: new ProgressService(db),
    quizzes: new QuizService(db),
    assignments: new AssignmentService(db),
    certificates: new CertificateService(db),
    discussions: new DiscussionService(db),
    purchases: new PurchaseService(db),
    coupons: new CouponService(db),
    checkout: new CheckoutService(db, stripeProvider),
    subscriptions: new SubscriptionService(db, stripeProvider),
    stripe: stripeProvider,
    activityLog: new ActivityLogService(db),
    permissions: new PermissionService(db),
    webhooks: new WebhookService(db),
    settings: new SettingsService(db),
    staff: new StaffService(db),
  };

  // Wire email transactional system (if configured)
  if (config.email) {
    initEmail(db, config.email).catch((err) =>
      console.error('[course] Email initialization failed:', err),
    );
  }

  return instance;
}

export function getCourse(): Course {
  if (!instance) throw new EcomError('Course not initialized. Call createCourse() first.', 'NOT_INITIALIZED', 500);
  return instance;
}

async function initEmail(db: Database, emailConfig: CourseConfig['email'] & {}): Promise<void> {
  try {
    const email = await import('@course/email');

    const sesClient = new email.SesClient({
      accessKeyId: emailConfig.accessKeyId,
      secretAccessKey: emailConfig.secretAccessKey,
      region: emailConfig.region,
      fromEmail: emailConfig.fromEmail,
      fromName: emailConfig.fromName,
    });

    const templateService = new email.TemplateService(db);

    // Seed default templates if available
    if (email.seedDefaultTemplates) {
      await email.seedDefaultTemplates(db);
    }
  } catch (err) {
    console.warn('[course] Email package not available:', err);
  }
}
