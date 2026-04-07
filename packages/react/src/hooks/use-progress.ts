import { useState, useEffect, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

interface LessonProgress {
  lessonId: string;
  status: string;
  watchTime: number | null;
  completedAt: string | null;
}

interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  lessons: LessonProgress[];
}

export function useCourseProgress(courseId: string) {
  const { fetcher } = useCourse();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetcher<CourseProgress>(`/my/courses/${courseId}/progress`);
      setProgress(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, courseId]);

  useEffect(() => { load(); }, [load]);

  const markLessonComplete = useCallback(async (lessonId: string) => {
    await fetcher(`/my/courses/${courseId}/lessons/${lessonId}/complete`, { method: 'POST' });
    await load();
  }, [fetcher, courseId, load]);

  const trackProgress = useCallback(async (lessonId: string, status: string, watchTime?: number) => {
    await fetcher(`/my/courses/${courseId}/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ status, watchTime }),
    });
  }, [fetcher, courseId]);

  return { progress, loading, error, markLessonComplete, trackProgress, refresh: load };
}
