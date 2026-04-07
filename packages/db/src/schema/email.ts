import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';

export const emailContacts = pgTable(
  'course_email_contacts',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    customerId: text('customer_id').references(() => users.id, { onDelete: 'set null' }),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    status: varchar('status', { length: 20 }).notNull().default('subscribed'), // subscribed, unsubscribed, bounced, complained
    subscribedAt: timestamp('subscribed_at').defaultNow(),
    unsubscribedAt: timestamp('unsubscribed_at'),
    metadata: jsonb('metadata'),
  },
  (table) => [index('course_contacts_email_idx').on(table.email), index('course_contacts_status_idx').on(table.status)],
);

export const emailLists = pgTable('course_email_lists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).notNull().default('static'), // static, dynamic
  rules: jsonb('rules'), // for dynamic lists
  contactCount: integer('contact_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const emailListContacts = pgTable(
  'course_email_list_contacts',
  {
    listId: text('list_id').notNull().references(() => emailLists.id, { onDelete: 'cascade' }),
    contactId: text('contact_id').notNull().references(() => emailContacts.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.listId, table.contactId] }), index('course_list_contacts_contact_id_idx').on(table.contactId)],
);

export const emailSegments = pgTable('course_email_segments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  rules: jsonb('rules').$type<Array<{ field: string; operator: string; value: unknown }>>().notNull().default([]),
  contactCount: integer('contact_count').notNull().default(0),
  lastComputedAt: timestamp('last_computed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const emailTemplates = pgTable('course_email_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  variables: jsonb('variables').$type<string[]>().default([]),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const emailCampaigns = pgTable(
  'course_email_campaigns',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 500 }).notNull(),
    fromName: varchar('from_name', { length: 100 }).notNull(),
    fromEmail: varchar('from_email', { length: 255 }).notNull(),
    replyTo: varchar('reply_to', { length: 255 }),
    templateId: text('template_id').references(() => emailTemplates.id),
    listId: text('list_id').references(() => emailLists.id),
    segmentId: text('segment_id').references(() => emailSegments.id),
    status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, scheduled, sending, sent, cancelled
    scheduledAt: timestamp('scheduled_at'),
    sentAt: timestamp('sent_at'),
    stats: jsonb('stats').$type<{ sent: number; delivered: number; opened: number; clicked: number; bounced: number; complained: number; unsubscribed: number }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('course_campaigns_status_idx').on(table.status)],
);

export const emailCampaignSends = pgTable(
  'course_email_campaign_sends',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text('campaign_id').notNull().references(() => emailCampaigns.id, { onDelete: 'cascade' }),
    contactId: text('contact_id').notNull().references(() => emailContacts.id),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, sent, delivered, opened, clicked, bounced, complained
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    openedAt: timestamp('opened_at'),
    clickedAt: timestamp('clicked_at'),
  },
  (table) => [index('course_sends_campaign_id_idx').on(table.campaignId)],
);

export const emailAutomations = pgTable('course_email_automations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  triggerEvent: varchar('trigger_event', { length: 100 }).notNull(),
  triggerConditions: jsonb('trigger_conditions'),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, active, paused
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const emailAutomationSteps = pgTable(
  'course_email_automation_steps',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    automationId: text('automation_id').notNull().references(() => emailAutomations.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    type: varchar('type', { length: 20 }).notNull(), // email, delay, condition
    config: jsonb('config').$type<{ templateId?: string; delayMinutes?: number; conditions?: unknown }>().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('course_steps_automation_id_idx').on(table.automationId)],
);

export const emailAutomationEnrollments = pgTable(
  'course_email_automation_enrollments',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    automationId: text('automation_id').notNull().references(() => emailAutomations.id, { onDelete: 'cascade' }),
    contactId: text('contact_id').notNull().references(() => emailContacts.id),
    currentStepId: text('current_step_id').references(() => emailAutomationSteps.id),
    status: varchar('status', { length: 20 }).notNull().default('active'), // active, completed, exited
    enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [index('course_enrollments_automation_id_idx').on(table.automationId)],
);

export const emailSuppressionList = pgTable('course_email_suppression_list', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  reason: varchar('reason', { length: 30 }).notNull(), // bounce, complaint, manual
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const emailDomainSettings = pgTable('course_email_domain_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  domain: varchar('domain', { length: 255 }).notNull().unique(),
  dkimVerified: boolean('dkim_verified').notNull().default(false),
  spfVerified: boolean('spf_verified').notNull().default(false),
  dmarcVerified: boolean('dmarc_verified').notNull().default(false),
  sesIdentityArn: text('ses_identity_arn'),
  verifiedAt: timestamp('verified_at'),
});

// Relations
export const emailContactsRelations = relations(emailContacts, ({ one }) => ({
  customer: one(users, { fields: [emailContacts.customerId], references: [users.id] }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one, many }) => ({
  template: one(emailTemplates, { fields: [emailCampaigns.templateId], references: [emailTemplates.id] }),
  list: one(emailLists, { fields: [emailCampaigns.listId], references: [emailLists.id] }),
  segment: one(emailSegments, { fields: [emailCampaigns.segmentId], references: [emailSegments.id] }),
  sends: many(emailCampaignSends),
}));

export const emailCampaignSendsRelations = relations(emailCampaignSends, ({ one }) => ({
  campaign: one(emailCampaigns, { fields: [emailCampaignSends.campaignId], references: [emailCampaigns.id] }),
  contact: one(emailContacts, { fields: [emailCampaignSends.contactId], references: [emailContacts.id] }),
}));

export const emailAutomationsRelations = relations(emailAutomations, ({ many }) => ({
  steps: many(emailAutomationSteps),
  enrollments: many(emailAutomationEnrollments),
}));

export const emailAutomationStepsRelations = relations(emailAutomationSteps, ({ one }) => ({
  automation: one(emailAutomations, { fields: [emailAutomationSteps.automationId], references: [emailAutomations.id] }),
}));

export const emailAutomationEnrollmentsRelations = relations(emailAutomationEnrollments, ({ one }) => ({
  automation: one(emailAutomations, { fields: [emailAutomationEnrollments.automationId], references: [emailAutomations.id] }),
  contact: one(emailContacts, { fields: [emailAutomationEnrollments.contactId], references: [emailContacts.id] }),
  currentStep: one(emailAutomationSteps, { fields: [emailAutomationEnrollments.currentStepId], references: [emailAutomationSteps.id] }),
}));
