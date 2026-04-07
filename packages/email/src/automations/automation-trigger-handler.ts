import { eq, and } from 'drizzle-orm';
import { emailAutomations, emailContacts } from '@course/db';
import type { Database } from '@course/db';
import type { AutomationService } from './automation-service.js';

interface EventBusLike {
  on(event: string, handler: (payload: any) => void | Promise<void>): void;
}

/**
 * Listens to domain events and enrolls contacts into matching automations.
 *
 * When an event fires (e.g., 'customer.created'), this handler:
 * 1. Finds all active automations with that triggerEvent
 * 2. Resolves the contact from the event payload
 * 3. Enrolls them into the automation
 */
export function registerAutomationTriggers(
  eventBus: EventBusLike,
  db: Database,
  automationService: AutomationService,
): void {
  // Events that can trigger automations and how to resolve the contact email
  const triggerableEvents = [
    'order.created',
    'customer.created',
    'checkout.completed',
    'return.created',
    'return.approved',
  ];

  for (const eventType of triggerableEvents) {
    eventBus.on(eventType, async (payload: Record<string, unknown>) => {
      try {
        // Find active automations for this trigger
        const automations = await db.query.emailAutomations.findMany({
          where: and(
            eq(emailAutomations.triggerEvent, eventType),
            eq(emailAutomations.status, 'active'),
          ),
        });

        if (automations.length === 0) return;

        // Try to resolve the contact from the payload
        const contactId = await resolveContact(db, payload);
        if (!contactId) return;

        // Enroll in each matching automation
        for (const automation of automations) {
          try {
            await automationService.enrollContact(automation.id, contactId);
          } catch (err) {
            // Duplicate enrollment is expected if already enrolled
            console.warn(`[automation] Could not enroll contact ${contactId} in automation ${automation.id}:`, err);
          }
        }
      } catch (err) {
        console.error(`[automation] Trigger handler failed for ${eventType}:`, err);
      }
    });
  }
}

/**
 * Attempts to resolve a contact ID from an event payload.
 * Looks up by customerId or email in the emailContacts table.
 */
async function resolveContact(
  db: Database,
  payload: Record<string, unknown>,
): Promise<string | null> {
  const customerId = payload.customerId as string | undefined;

  if (customerId) {
    // Find contact by customerId
    const contact = await db.query.emailContacts.findFirst({
      where: eq(emailContacts.customerId, customerId),
    });
    if (contact) return contact.id;
  }

  return null;
}
