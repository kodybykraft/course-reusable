import { useState, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

export function useEnrollment() {
  const { fetcher } = useCourse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = useCallback(async (courseSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher<{ id: string; courseId: string; status: string }>(
        `/courses/${courseSlug}/enroll`,
        { method: 'POST' },
      );
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  return { enroll, loading, error };
}
