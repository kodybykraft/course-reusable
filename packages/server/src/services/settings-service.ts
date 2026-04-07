import { eq, sql } from 'drizzle-orm';
import { storeSettings } from '@course/db';
import type { Database } from '@course/db';

export class SettingsService {
  constructor(private db: Database) {}

  async getByGroup(group: string) {
    return this.db.query.storeSettings.findMany({
      where: eq(storeSettings.group, group),
    });
  }

  async get(key: string) {
    const setting = await this.db.query.storeSettings.findFirst({
      where: eq(storeSettings.key, key),
    });
    return setting?.value ?? null;
  }

  async set(key: string, value: unknown, group?: string) {
    const existing = await this.db.query.storeSettings.findFirst({
      where: eq(storeSettings.key, key),
    });

    if (existing) {
      await this.db
        .update(storeSettings)
        .set({ value, ...(group !== undefined ? { group } : {}) })
        .where(eq(storeSettings.key, key));
    } else {
      await this.db.insert(storeSettings).values({
        key,
        value,
        group: group ?? 'general',
      });
    }
  }

  async setBulk(entries: { key: string; value: unknown; group?: string }[]) {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.group);
    }
  }
}
