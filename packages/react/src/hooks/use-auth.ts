import { useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

export function useAuth() {
  const { auth, setAuth, clearAuth, fetcher } = useCourse();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await fetcher<{
        user: { id: string; email: string; firstName: string | null; lastName: string | null };
        token: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth({ user: result.user, token: result.token });
      return result;
    },
    [fetcher, setAuth],
  );

  const register = useCallback(
    async (input: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const result = await fetcher<{
        user: { id: string; email: string; firstName: string | null; lastName: string | null };
        token: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setAuth({ user: result.user, token: result.token });
      return result;
    },
    [fetcher, setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await fetcher('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    clearAuth();
  }, [fetcher, clearAuth]);

  return {
    user: auth.user,
    isAuthenticated: !!auth.token,
    login,
    register,
    logout,
  };
}
