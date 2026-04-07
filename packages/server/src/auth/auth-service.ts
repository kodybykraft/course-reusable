import { eq } from 'drizzle-orm';
import { users, sessions } from '@course/db';
import type { Database } from '@course/db';
import { UnauthorizedError, ValidationError } from '@course/core';
import type { User } from '../context.js';
import type { AuthAdapter, AuthUser } from './auth-adapter.js';

function toHex(buffer: ArrayBufferLike): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
}

async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const derived = await deriveKey(password, salt);
  return `${toHex(salt.buffer)}:${toHex(derived)}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, derivedHex] = hash.split(':');
  if (!saltHex || !derivedHex) return false;
  const salt = fromHex(saltHex);
  const derived = await deriveKey(password, salt);
  const computed = toHex(derived);
  // Constant-time comparison to prevent timing attacks
  if (computed.length !== derivedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ derivedHex.charCodeAt(i);
  }
  return diff === 0;
}

function generateToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID();
}

export class AuthService implements AuthAdapter {
  constructor(private db: Database) {}

  async register(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'admin' | 'staff' | 'customer';
  }): Promise<{ user: User; token: string }> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existing) {
      throw new ValidationError('Email already registered', 'email');
    }

    const passwordHash = await hashPassword(input.password);
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        role: 'customer', // Always customer — admin/staff created via admin API only
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
      })
      .returning();

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as User['role'],
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.db.insert(sessions).values({ userId: user.id, token, expiresAt });
    await this.db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as User['role'],
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }

  async validateToken(token: string): Promise<User | null> {
    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const { user } = session;
    if (!user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role as User['role'],
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async logout(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }
}
