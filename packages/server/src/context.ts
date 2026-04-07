import type { Database } from '@course/db';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  firstName: string | null;
  lastName: string | null;
}

export interface RequestContext {
  db: Database;
  user: User | null;
  ipAddress?: string;
}

export function createContext(db: Database, user: User | null = null, ipAddress?: string): RequestContext {
  return { db, user, ipAddress };
}
