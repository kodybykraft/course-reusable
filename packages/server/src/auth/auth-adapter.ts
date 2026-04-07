/**
 * Interface that all auth providers must implement.
 * The built-in AuthService implements this by default.
 * Custom providers (NextAuth, Clerk, Supabase) only need to implement validateToken().
 */
export interface AuthAdapter {
  /** Validate a token/session and return the user, or null if invalid */
  validateToken(token: string): Promise<AuthUser | null>;

  /** Login with email/password. Optional — only needed if using built-in auth. */
  login?(email: string, password: string): Promise<{ user: AuthUser; token: string }>;

  /** Register a new user. Optional — only needed if using built-in auth. */
  register?(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<{ user: AuthUser; token: string }>;

  /** Logout / invalidate a token. Optional. */
  logout?(token: string): Promise<void>;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  firstName: string | null;
  lastName: string | null;
}
