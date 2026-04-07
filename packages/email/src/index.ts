// SES Client
export { SesClient } from './ses/ses-client.js';
export type { SesConfig } from './ses/ses-client.js';

// Contacts
export { ContactService } from './contacts/contact-service.js';
export { SegmentService } from './contacts/segment-service.js';
export type { SegmentRule } from './contacts/segment-service.js';

// Campaigns
export { CampaignService } from './campaigns/campaign-service.js';

// Automations
export { AutomationService } from './automations/automation-service.js';
export { AutomationExecutor } from './automations/automation-executor.js';
export { registerAutomationTriggers } from './automations/automation-trigger-handler.js';

// Templates
export { TemplateService } from './templates/template-service.js';

// Default Templates
export { seedDefaultTemplates } from './templates/defaults/index.js';

// Transactional
export { TransactionalEmailService } from './transactional/transactional-email-service.js';
export { registerEmailEventHandlers } from './transactional/email-event-handlers.js';
export { checkAbandonedCourses } from './transactional/abandoned-enrollment-checker.js';

// Deliverability
export { SuppressionService } from './deliverability/suppression-service.js';

// Config types
export type { EmailConfig } from './types/config.js';
