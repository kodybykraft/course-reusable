import { useState, useEffect, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  instructorName: string | null;
  status: string;
  price: number | null;
  currency: string;
  createdAt: string;
}

interface CourseDetail extends CourseListItem {
  modules: {
    id: string;
    title: string;
    position: number;
    lessons: {
      id: string;
      title: string;
      position: number;
      contentType: string;
      durationMinutes: number | null;
    }[];
  }[];
}

export function useCourses(options?: { search?: string; categoryId?: string }) {
  const { fetcher } = useCourse();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.search) params.set('search', options.search);
      if (options?.categoryId) params.set('categoryId', options.categoryId);
      const qs = params.toString();
      const data = await fetcher<{ data: CourseListItem[] }>(`/courses${qs ? `?${qs}` : ''}`);
      setCourses(data.data ?? (data as any));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, options?.search, options?.categoryId]);

  useEffect(() => { load(); }, [load]);

  return { courses, loading, error, refresh: load };
}

export function useCourseDetail(slug: string) {
  const { fetcher } = useCourse();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher<CourseDetail>(`/courses/${slug}`)
      .then((data) => { if (!cancelled) setCourse(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetcher, slug]);

  return { course, loading, error };
}
