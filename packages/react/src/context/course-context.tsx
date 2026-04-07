import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthState {
  user: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
  token: string | null;
}

interface CourseContextValue {
  apiBase: string;
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  clearAuth: () => void;
  fetcher: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({
  apiBase = '/api/course',
  children,
}: {
  apiBase?: string;
  children: ReactNode;
}) {
  const [auth, setAuth] = useState<AuthState>({ user: null, token: null });

  const clearAuth = useCallback(() => {
    setAuth({ user: null, token: null });
  }, []);

  const fetcher = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }

      const res = await fetch(`${apiBase}${path}`, { ...options, headers, credentials: 'include' });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message ?? `Request failed: ${res.status}`);
      }
      return res.json();
    },
    [apiBase, auth.token],
  );

  return (
    <CourseContext.Provider value={{ apiBase, auth, setAuth, clearAuth, fetcher }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within a CourseProvider');
  return ctx;
}
