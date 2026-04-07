import { pgTable, text, varchar, jsonb } from 'drizzle-orm/pg-core';

export const storeSettings = pgTable('course_store_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value'),
  group: varchar('group', { length: 50 }).notNull().default('general'),
});
