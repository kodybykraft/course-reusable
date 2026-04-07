import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { emailCampaigns, emailCampaignSends, emailContacts, emailListContacts } from '@course/db';
import type { Database } from '@course/db';
import type { SesClient } from '../ses/ses-client.js';
import { escapeHtml } from '@course/core';

export class CampaignService {
  constructor(
    private db: Database,
    private ses: SesClient,
  ) {}

  async list(pagination?: { page?: number; pageSize?: number }) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [data, countResult] = await Promise.all([
      this.db.query.emailCampaigns.findMany({ limit: pageSize, offset, orderBy: desc(emailCampaigns.createdAt) }),
      this.db.select({ count: sql<number>`count(*)` }).from(emailCampaigns),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    return this.db.query.emailCampaigns.findFirst({
      where: eq(emailCampaigns.id, id),
      with: { template: true },
    });
  }

  async create(input: {
    name: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    templateId?: string;
    listId?: string;
    segmentId?: string;
  }) {
    const [campaign] = await this.db.insert(emailCampaigns).values({
      name: input.name,
      subject: input.subject,
      fromName: input.fromName,
      fromEmail: input.fromEmail,
      replyTo: input.replyTo ?? null,
      templateId: input.templateId ?? null,
      listId: input.listId ?? null,
      segmentId: input.segmentId ?? null,
    }).returning();

    return campaign;
  }

  async schedule(id: string, scheduledAt: Date) {
    await this.db.update(emailCampaigns).set({
      status: 'scheduled',
      scheduledAt,
    }).where(eq(emailCampaigns.id, id));
  }

  async send(id: string) {
    const campaign = await this.getById(id);
    if (!campaign || !campaign.template) return;

    await this.db.update(emailCampaigns).set({ status: 'sending' }).where(eq(emailCampaigns.id, id));

    // Get recipients from list
    let recipients: Array<{ id: string; email: string; firstName: string | null }> = [];
    if (campaign.listId) {
      // Get contact IDs from the list junction table
      const junctionRows = await this.db
        .select({ contactId: emailListContacts.contactId })
        .from(emailListContacts)
        .where(eq(emailListContacts.listId, campaign.listId));

      const contactIds = junctionRows.map((r) => r.contactId);
      if (contactIds.length > 0) {
        const contacts = await this.db.query.emailContacts.findMany({
          where: and(
            inArray(emailContacts.id, contactIds),
            eq(emailContacts.status, 'subscribed'),
          ),
        });
        recipients = contacts.map((c) => ({ id: c.id, email: c.email, firstName: c.firstName }));
      }
    }

    let sent = 0;
    let failed = 0;
    const BATCH_SIZE = 50;

    // Process in batches of 50
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (recipient) => {
          const html = campaign.template!.htmlContent.replace(
            /\{\{firstName\}\}/g,
            escapeHtml(recipient.firstName ?? 'there'),
          );
          const { messageId } = await this.ses.sendEmail({
            to: recipient.email,
            subject: campaign.subject,
            html,
            text: campaign.template!.textContent ?? undefined,
          });
          return { recipientId: recipient.id, messageId, status: 'sent' as const };
        }),
      );

      const sendRecords: Array<{
        campaignId: string;
        contactId: string;
        status: string;
        sentAt?: Date;
      }> = [];

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const recipient = batch[j];
        if (result.status === 'fulfilled') {
          sendRecords.push({
            campaignId: id,
            contactId: recipient.id,
            status: 'sent',
            sentAt: new Date(),
          });
          sent++;
        } else {
          sendRecords.push({
            campaignId: id,
            contactId: recipient.id,
            status: 'pending', // will retry
          });
          failed++;
        }
      }

      // Batch insert all send records for this batch
      if (sendRecords.length > 0) {
        await this.db.insert(emailCampaignSends).values(sendRecords);
      }
    }

    await this.db.update(emailCampaigns).set({
      status: 'sent',
      sentAt: new Date(),
      stats: { sent, delivered: 0, opened: 0, clicked: 0, bounced: failed, complained: 0, unsubscribed: 0 },
    }).where(eq(emailCampaigns.id, id));
  }

  async cancel(id: string) {
    await this.db.update(emailCampaigns).set({ status: 'cancelled' }).where(eq(emailCampaigns.id, id));
  }
}
