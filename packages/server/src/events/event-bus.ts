import type { EventType, EventPayload } from './event-types.js';

type Handler = (payload: unknown) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Handler[]>();

  on<T extends EventType>(eventType: T, handler: (payload: EventPayload<T>) => void | Promise<void>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler as Handler);
    this.handlers.set(eventType, existing);
  }

  off<T extends EventType>(eventType: T, handler: (payload: EventPayload<T>) => void | Promise<void>): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(
      eventType,
      existing.filter((h) => h !== (handler as Handler)),
    );
  }

  async emit<T extends EventType>(eventType: T, payload: EventPayload<T>): Promise<void> {
    const handlers = this.handlers.get(eventType) ?? [];
    const results = await Promise.allSettled(handlers.map((handler) => handler(payload)));
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error(`[EventBus] Handler failed for ${eventType}:`, result.reason);
      }
    }
  }
}

export const eventBus = new EventBus();
export type { EventBus };
