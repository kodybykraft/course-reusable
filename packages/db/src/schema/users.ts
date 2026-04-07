import { pgTable, text, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable(
  'course_users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('customer'), // admin, staff, customer
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('course_users_email_idx').on(table.email)],
);

export const sessions = pgTable(
  'course_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('course_sessions_token_idx').on(table.token),
    index('course_sessions_user_id_idx').on(table.userId),
  ],
);

export const staffPermissions = pgTable(
  'course_staff_permissions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    resource: varchar('resource', { length: 50 }).notNull(), // products, orders, customers, etc.
    action: varchar('action', { length: 20 }).notNull(), // create, read, update, delete
    isAllowed: boolean('is_allowed').notNull().default(true),
  },
  (table) => [index('course_permissions_user_id_idx').on(table.userId)],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  permissions: many(staffPermissions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const staffPermissionsRelations = relations(staffPermissions, ({ one }) => ({
  user: one(users, { fields: [staffPermissions.userId], references: [users.id] }),
}));
