'use client';

import { useState } from 'react';
import { CourseCard } from './course-card.js';

interface GridCourse {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  instructorName?: string | null;
  price?: number | null;
  currency?: string;
}

interface CourseGridProps {
  courses: GridCourse[];
  onCourseClick?: (slug: string) => void;
  showSearch?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
  cardClassName?: string;
  progressMap?: Record<string, number>;
}

export function CourseGrid({
  courses,
  onCourseClick,
  showSearch = true,
  columns = 3,
  className,
  cardClassName,
  progressMap,
}: CourseGridProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()) ||
          c.instructorName?.toLowerCase().includes(search.toLowerCase()),
      )
    : courses;

  const gap = '1.5rem';
  const colTemplate = `repeat(${columns}, 1fr)`;

  return (
    <div className={className}>
      {showSearch && (
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '0.625rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
      )}
      {filtered.length === 0 && (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
          {search ? 'No courses match your search.' : 'No courses available.'}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap }}>
        {filtered.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={onCourseClick}
            className={cardClassName}
            progress={progressMap?.[course.id]}
          />
        ))}
      </div>
    </div>
  );
}
