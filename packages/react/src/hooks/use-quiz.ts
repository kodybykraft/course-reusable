import { useState, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

interface QuizResult {
  id: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

export function useQuiz() {
  const { fetcher } = useCourse();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (quizId: string, answers: Record<string, string>) => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetcher<QuizResult>(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [fetcher]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { submit, submitting, result, error, reset };
}
