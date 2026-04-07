'use client';

import { useState } from 'react';

interface SidebarLesson {
  id: string;
  title: string;
  position: number;
  contentType: string;
  durationMinutes?: number | null;
}

interface SidebarModule {
  id: string;
  title: string;
  position: number;
  lessons: SidebarLesson[];
}

interface ModuleSidebarProps {
  modules: SidebarModule[];
  activeLessonId?: string;
  completedLessonIds?: Set<string> | string[];
  onLessonClick?: (lessonId: string, moduleId: string) => void;
  className?: string;
}

const contentTypeIcons: Record<string, string> = {
  video: '\u25B6',
  text: '\u2630',
  pdf: '\u2193',
  audio: '\u266A',
  embed: '\u29C9',
};

export function ModuleSidebar({
  modules,
  activeLessonId,
  completedLessonIds = [],
  onLessonClick,
  className,
}: ModuleSidebarProps) {
  const completedSet = completedLessonIds instanceof Set
    ? completedLessonIds
    : new Set(completedLessonIds);

  const sorted = [...modules].sort((a, b) => a.position - b.position);

  // Auto-expand the module containing the active lesson
  const activeModuleId = sorted.find((m) =>
    m.lessons.some((l) => l.id === activeLessonId),
  )?.id;

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(activeModuleId ? [activeModuleId] : sorted.length > 0 ? [sorted[0].id] : []),
  );

  const toggle = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <nav className={className} style={{ width: '100%' }}>
      {sorted.map((mod) => {
        const isExpanded = expandedModules.has(mod.id);
        const totalLessons = mod.lessons.length;
        const completedCount = mod.lessons.filter((l) => completedSet.has(l.id)).length;

        return (
          <div key={mod.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => toggle(mod.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              <span>{mod.title}</span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {completedCount}/{totalLessons} {isExpanded ? '\u25B2' : '\u25BC'}
              </span>
            </button>
            {isExpanded && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {[...mod.lessons]
                  .sort((a, b) => a.position - b.position)
                  .map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedSet.has(lesson.id);

                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => onLessonClick?.(lesson.id, mod.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem 0.5rem 1.5rem',
                            background: isActive ? '#eff6ff' : 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            color: isActive ? '#2D60FF' : '#374151',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <span style={{ width: 18, flexShrink: 0, textAlign: 'center' }}>
                            {isCompleted ? '\u2713' : contentTypeIcons[lesson.contentType] ?? '\u25CB'}
                          </span>
                          <span style={{ flex: 1 }}>{lesson.title}</span>
                          {lesson.durationMinutes && (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {lesson.durationMinutes}m
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
