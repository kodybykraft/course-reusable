import { useState, useEffect, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

interface Discussion {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  author?: { firstName: string | null; lastName: string | null; email: string };
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

interface DiscussionDetail extends Discussion {
  replies: {
    id: string;
    content: string;
    authorId: string;
    author?: { firstName: string | null; lastName: string | null; email: string };
    parentReplyId: string | null;
    createdAt: string;
  }[];
}

interface LessonComment {
  id: string;
  lessonId: string;
  content: string;
  authorId: string;
  author?: { firstName: string | null; lastName: string | null; email: string };
  parentCommentId: string | null;
  createdAt: string;
}

export function useDiscussions(courseSlug: string) {
  const { fetcher } = useCourse();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher<{ data: Discussion[] }>(`/courses/${courseSlug}/discussions`);
      setDiscussions(result.data ?? (result as any));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, courseSlug]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (title: string, content: string) => {
    const discussion = await fetcher<Discussion>(`/courses/${courseSlug}/discussions`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    await load();
    return discussion;
  }, [fetcher, courseSlug, load]);

  return { discussions, loading, error, create, refresh: load };
}

export function useDiscussion(discussionId: string) {
  const { fetcher } = useCourse();
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetcher<DiscussionDetail>(`/discussions/${discussionId}`);
      setDiscussion(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, discussionId]);

  useEffect(() => { load(); }, [load]);

  const reply = useCallback(async (content: string, parentReplyId?: string) => {
    await fetcher(`/discussions/${discussionId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content, parentReplyId }),
    });
    await load();
  }, [fetcher, discussionId, load]);

  return { discussion, loading, error, reply, refresh: load };
}

export function useLessonComments(lessonId: string) {
  const { fetcher } = useCourse();
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher<{ data: LessonComment[] }>(`/lessons/${lessonId}/comments`);
      setComments(result.data ?? (result as any));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, lessonId]);

  useEffect(() => { load(); }, [load]);

  const addComment = useCallback(async (content: string, parentCommentId?: string) => {
    await fetcher(`/lessons/${lessonId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
    await load();
  }, [fetcher, lessonId, load]);

  return { comments, loading, error, addComment, refresh: load };
}
