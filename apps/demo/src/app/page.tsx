import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, color: '#111827' }}>
          Course Platform Demo
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginTop: '0.75rem' }}>
          A drop-in LMS backend for Next.js. Explore both the student and admin experience.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Student Experience */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: '2rem', background: '#fff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#127891;</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Student Experience</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Browse courses, watch lessons, take quizzes, track progress, and earn certificates.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/courses" style={{ display: 'block', padding: '0.75rem 1.25rem', background: '#2D60FF', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, textAlign: 'center', fontSize: '0.9rem' }}>
              Browse Courses
            </Link>
            <Link href="/dashboard" style={{ display: 'block', padding: '0.75rem 1.25rem', background: '#f3f4f6', color: '#374151', borderRadius: 8, textDecoration: 'none', fontWeight: 600, textAlign: 'center', fontSize: '0.9rem' }}>
              My Dashboard
            </Link>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            Components: CourseGrid, LessonPlayer, QuizPlayer, StudentDashboard, CertificateCard, ModuleSidebar, ProgressBar
          </div>
        </div>

        {/* Admin Dashboard */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: '2rem', background: '#fff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#9881;&#65039;</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Admin Dashboard</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Manage courses, students, enrollments, quizzes, revenue, coupons, discussions, and settings.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/admin" style={{ display: 'block', padding: '0.75rem 1.25rem', background: '#1B2559', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, textAlign: 'center', fontSize: '0.9rem' }}>
              Open Admin
            </Link>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            Pages: Dashboard, Courses, Students, Enrollments, Quizzes, Assignments, Revenue, Coupons, Discussions, Settings
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem', color: '#9ca3af' }}>
        All data is mock — no database required. Built by{' '}
        <a href="https://kodebykraft.com" style={{ color: '#2D60FF', textDecoration: 'none' }}>Kode by Kraft</a>
      </p>
    </div>
  );
}
