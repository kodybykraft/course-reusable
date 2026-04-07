// Context
export { createContext } from './context.js';
export type { User, RequestContext } from './context.js';

// Auth
export { AuthService } from './auth/auth-service.js';
export type { AuthAdapter, AuthUser } from './auth/auth-adapter.js';
export { PermissionService } from './auth/permission-service.js';
export type { Resource, Action } from './auth/permission-service.js';

// Course Services
export { CourseService } from './services/course-service.js';
export { ModuleService } from './services/module-service.js';
export { LessonService } from './services/lesson-service.js';
export { EnrollmentService } from './services/enrollment-service.js';
export { ProgressService } from './services/progress-service.js';
export { QuizService } from './services/quiz-service.js';
export { AssignmentService } from './services/assignment-service.js';
export { CertificateService } from './services/certificate-service.js';
export { DiscussionService } from './services/discussion-service.js';
export { PurchaseService } from './services/purchase-service.js';
export { CouponService } from './services/coupon-service.js';
export { CheckoutService } from './services/checkout-service.js';
export { SubscriptionService } from './services/subscription-service.js';

// Shared Services
export { ActivityLogService } from './services/activity-log-service.js';
export { WebhookService } from './services/webhook-service.js';
export { SettingsService } from './services/settings-service.js';
export { StaffService } from './services/staff-service.js';

// Middleware
export { handleError, getStatusCode } from './middleware/error-handler.js';
export type { ErrorResponse } from './middleware/error-handler.js';
export { healthCheck } from './middleware/health-check.js';
export type { HealthCheckResult } from './middleware/health-check.js';
export { RateLimiter, defaultRateLimiter } from './middleware/rate-limiter.js';
export type { RateLimiterConfig } from './middleware/rate-limiter.js';

// Events
export { eventBus } from './events/event-bus.js';
export type { DomainEvent, EventType, EventPayload } from './events/event-types.js';
