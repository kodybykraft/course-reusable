'use client';

import { CourseCard } from './course-card.js';
import { ProgressBar } from './progress-bar.js';

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

interface StudentDashboardProps {
  enrolledCourses: EnrolledCourse[];
  totalCompleted?: number;
  totalInProgress?: number;
  onCourseClick?: (slug: string) => void;
  className?: string;
}

export function StudentDashboard({
  enrolledCourses,
  totalCompleted = 0,
  totalInProgress = 0,
  onCourseClick,
  className,
}: StudentDashboardProps) {
  const inProgress = enrolledCourses.filter((c) => c.status === 'active');
  const completed = enrolledCourses.filter((c) => c.status === 'completed');

  return (
    <div className={className}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', background: '#f9fafb', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{enrolledCourses.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Enrolled</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#eff6ff', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2D60FF' }}>{totalInProgress || inProgress.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>In Progress</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>{totalCompleted || completed.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Completed</div>
        </div>
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>Continue Learning</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {inProgress.map((course) => (
              <div
                key={course.id}
                onClick={() => onCourseClick?.(course.courseSlug)}
                role={onCourseClick ? 'button' : undefined}
                tabIndex={onCourseClick ? 0 : undefined}
                onKeyDown={(e) => { if (onCourseClick && (e.key === 'Enter' || e.key === ' ')) onCourseClick(course.courseSlug); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  cursor: onCourseClick ? 'pointer' : 'default',
                  background: '#fff',
                }}
              >
                {course.courseThumbnail ? (
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 80, height: 60, background: '#f3f4f6', borderRadius: 8, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{course.courseTitle}</h3>
                  <div style={{ marginTop: '0.5rem' }}>
                    <ProgressBar percent={course.percentComplete} height={6} />
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {Math.round(course.percentComplete)}% complete
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>Completed</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {completed.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.courseId,
                  title: course.courseTitle,
                  slug: course.courseSlug,
                  thumbnailUrl: course.courseThumbnail,
                }}
                progress={100}
                onClick={onCourseClick}
              />
            ))}
          </div>
        </section>
      )}

      {enrolledCourses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No courses yet</p>
          <p style={{ fontSize: '0.9rem' }}>Browse the catalog to get started.</p>
        </div>
      )}
    </div>
  );
}
