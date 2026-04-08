'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ModuleSidebar, LessonPlayer, ProgressBar } from '@course/react';
import { MOCK_COURSES, MOCK_MODULES, MOCK_LESSON_CONTENT } from '../../../../lib/mock-data';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const course = MOCK_COURSES.find((c) => c.slug === slug);
  const modules = MOCK_MODULES[slug] ?? [];

  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const [activeLessonId, setActiveLessonId] = useState(allLessons[0]?.id ?? '');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const activeLesson = allLessons.find((l) => l.id === activeLessonId);
  const content = activeLessonId ? MOCK_LESSON_CONTENT[activeLessonId] : null;

  const handleComplete = () => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(activeLessonId);
      return next;
    });
    // Auto-advance to next lesson
    const idx = allLessons.findIndex((l) => l.id === activeLessonId);
    if (idx < allLessons.length - 1) {
      setActiveLessonId(allLessons[idx + 1].id);
    }
  };

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Course not found</h2>
        <Link href="/courses" style={{ color: '#2D60FF' }}>Back to catalog</Link>
      </div>
    );
  }

  const percent = allLessons.length > 0 ? (completedIds.size / allLessons.length) * 100 : 0;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <div style={{ width: 320, borderRight: '1px solid #e5e7eb', background: '#fafafa', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
          <Link href="/courses" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none' }}>&larr; Back to catalog</Link>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0 0.25rem' }}>{course.title}</h2>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{course.instructorName}</p>
          <div style={{ marginTop: '0.75rem' }}>
            <ProgressBar percent={percent} height={6} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{Math.round(percent)}% complete</span>
          </div>
        </div>
        <ModuleSidebar
          modules={modules}
          activeLessonId={activeLessonId}
          completedLessonIds={completedIds}
          onLessonClick={(lessonId) => setActiveLessonId(lessonId)}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        {activeLesson ? (
          <LessonPlayer
            lesson={{
              id: activeLesson.id,
              title: activeLesson.title,
              content: content ? {
                contentType: content.contentType,
                contentUrl: content.contentUrl ?? null,
                contentText: content.contentText ?? null,
              } : null,
            }}
            isCompleted={completedIds.has(activeLessonId)}
            onComplete={handleComplete}
          />
        ) : (
          <p style={{ color: '#6b7280' }}>Select a lesson to begin.</p>
        )}
      </div>
    </div>
  );
}
