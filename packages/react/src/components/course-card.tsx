'use client';

import { ProgressBar } from './progress-bar.js';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    instructorName?: string | null;
    price?: number | null;
    currency?: string;
  };
  progress?: number;
  onClick?: (slug: string) => void;
  className?: string;
}

export function CourseCard({ course, progress, onClick, className }: CourseCardProps) {
  const priceLabel =
    course.price == null || course.price === 0
      ? 'Free'
      : `${(course.price / 100).toFixed(2)} ${course.currency ?? 'USD'}`;

  return (
    <div
      className={className}
      onClick={() => onClick?.(course.slug)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(course.slug); }}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        background: '#fff',
        transition: 'box-shadow 0.2s',
      }}
    >
      {course.thumbnailUrl && (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
        />
      )}
      {!course.thumbnailUrl && (
        <div style={{ width: '100%', height: 180, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
          No thumbnail
        </div>
      )}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>{course.title}</h3>
        {course.instructorName && (
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
            {course.instructorName}
          </p>
        )}
        {course.description && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.description}
          </p>
        )}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>{priceLabel}</span>
        </div>
        {progress != null && (
          <div style={{ marginTop: '0.5rem' }}>
            <ProgressBar percent={progress} height={6} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{Math.round(progress)}% complete</span>
          </div>
        )}
      </div>
    </div>
  );
}
