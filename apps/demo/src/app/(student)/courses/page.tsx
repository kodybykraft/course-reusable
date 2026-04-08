'use client';

import { useRouter } from 'next/navigation';
import { CourseGrid } from '@course/react';
import { MOCK_COURSES } from '../../../lib/mock-data';

export default function CoursesPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Course Catalog</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Browse our courses and start learning today.</p>
      <CourseGrid
        courses={MOCK_COURSES}
        onCourseClick={(slug) => router.push(`/courses/${slug}`)}
        columns={3}
      />
    </div>
  );
}
