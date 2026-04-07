import { useState, useEffect, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

interface EnrolledCourse {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnail: string | null;
  status: string;
  percentComplete: number;
  enrolledAt: string;
  lastAccessedAt: string | null;
}

interface DashboardData {
  enrolledCourses: EnrolledCourse[];
  totalCompleted: number;
  totalInProgress: number;
}

export function useStudentDashboard() {
  const { fetcher } = useCourse();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher<DashboardData>('/my/dashboard');
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
