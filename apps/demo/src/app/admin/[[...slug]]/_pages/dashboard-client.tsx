'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader, Card, StatsGrid, StatCard, Badge, formatMoney } from './_shared';
import { COURSES, STUDENTS, ENROLLMENTS, REVENUE } from './_data';

/* ==========================================================================
   Types
   ========================================================================== */

interface DashboardStats {
  totalStudents: number;
  activeEnrollments: number;
  revenue: number;
  completionRate: number;
  studentsChange: number;
  enrollmentsChange: number;
  revenueChange: number;
  completionChange: number;
}

interface EnrollmentRow {
  id: string;
  student: string;
  course: string;
  progress: number;
  enrolledAt: string;
}

interface TopCourseRow {
  id: string;
  title: string;
  enrollments: number;
  revenue: number;
  rating: number;
}

/* ==========================================================================
   Skeleton helpers
   ========================================================================== */

function SkeletonLine({ width }: { width?: string }) {
  return (
    <div style={{
      height: 14, width: width ?? '100%',
      background: 'var(--admin-border-light, #2a3441)',
      borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

function SkeletonStatCard() {
  return (
    <div className="admin-stat-card">
      <SkeletonLine width="60%" />
      <div style={{ marginTop: 8 }}><SkeletonLine width="40%" /></div>
    </div>
  );
}

function SkeletonTableRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><SkeletonLine width={i === 0 ? '60px' : '80%'} /></td>
      ))}
    </tr>
  );
}

/* ==========================================================================
   Mock data helpers
   ========================================================================== */

function getMockStats(): DashboardStats {
  return {
    totalStudents: STUDENTS.length,
    activeEnrollments: ENROLLMENTS.filter(e => e.status === 'active').length,
    revenue: REVENUE.totalRevenue,
    completionRate: REVENUE.completionRate,
    studentsChange: 15.3,
    enrollmentsChange: 8.7,
    revenueChange: 22.1,
    completionChange: 2.4,
  };
}

function getMockRecentEnrollments(): EnrollmentRow[] {
  return ENROLLMENTS.slice(0, 5).map(e => {
    const student = STUDENTS.find(s => s.id === e.studentId);
    const course = COURSES.find(c => c.id === e.courseId);
    return {
      id: e.id,
      student: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      course: course?.title ?? 'Unknown',
      progress: e.progress,
      enrolledAt: e.enrolledAt,
    };
  });
}

function getMockTopCourses(): TopCourseRow[] {
  return [...COURSES]
    .filter(c => c.status === 'published')
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      title: c.title,
      enrollments: c.enrollmentCount,
      revenue: c.revenue,
      rating: c.rating,
    }));
}

/* ==========================================================================
   Progress bar inline
   ========================================================================== */

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, background: 'var(--admin-border-light, #2a3441)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: value === 100 ? 'var(--admin-success, #2ecc71)' : 'var(--admin-primary, #2D60FF)',
          borderRadius: 3, transition: 'width 0.3s',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--admin-text-secondary, #94a3b8)', minWidth: 32 }}>{value}%</span>
    </div>
  );
}

/* ==========================================================================
   DashboardClient
   ========================================================================== */

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentRow[] | null>(null);
  const [topCourses, setTopCourses] = useState<TopCourseRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('token='));
      const token = cookie?.split('=')[1] ?? '';

      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [statsRes, enrollRes, coursesRes] = await Promise.all([
        fetch('/api/course/admin/stats', { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch('/api/course/admin/enrollments?limit=5', { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
        fetch('/api/course/admin/courses?sort=enrollments&limit=5', { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      ]);

      if (statsRes?.data) {
        setStats({
          totalStudents: statsRes.data.totalStudents ?? 0,
          activeEnrollments: statsRes.data.activeEnrollments ?? 0,
          revenue: statsRes.data.revenue ?? 0,
          completionRate: statsRes.data.completionRate ?? 0,
          studentsChange: statsRes.data.studentsChange ?? 0,
          enrollmentsChange: statsRes.data.enrollmentsChange ?? 0,
          revenueChange: statsRes.data.revenueChange ?? 0,
          completionChange: statsRes.data.completionChange ?? 0,
        });
      } else { setStats(getMockStats()); }

      if (enrollRes?.data && Array.isArray(enrollRes.data)) {
        setRecentEnrollments(enrollRes.data.slice(0, 5));
      } else { setRecentEnrollments(getMockRecentEnrollments()); }

      if (coursesRes?.data && Array.isArray(coursesRes.data)) {
        setTopCourses(coursesRes.data.slice(0, 5));
      } else { setTopCourses(getMockTopCourses()); }
    } catch {
      setStats(getMockStats());
      setRecentEnrollments(getMockRecentEnrollments());
      setTopCourses(getMockTopCourses());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <PageHeader title="Dashboard" />

      {loading || !stats ? (
        <StatsGrid>
          <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
        </StatsGrid>
      ) : (
        <StatsGrid>
          <StatCard label="Total Students" value={String(stats.totalStudents)} change={stats.studentsChange} />
          <StatCard label="Active Enrollments" value={String(stats.activeEnrollments)} change={stats.enrollmentsChange} />
          <StatCard label="Revenue" value={formatMoney(stats.revenue)} change={stats.revenueChange} />
          <StatCard label="Completion Rate" value={`${stats.completionRate}%`} change={stats.completionChange} />
        </StatsGrid>
      )}

      <div className="admin-grid-2">
        <Card
          title="Recent Enrollments"
          actions={<a href="/admin/enrollments" className="admin-btn admin-btn--plain">View all</a>}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {loading || !recentEnrollments
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                : recentEnrollments.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.student}</td>
                    <td style={{ color: 'var(--admin-text-secondary)' }}>{e.course}</td>
                    <td style={{ minWidth: 120 }}><ProgressBar value={e.progress} /></td>
                    <td style={{ color: 'var(--admin-text-secondary)' }}>{e.enrolledAt}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>

        <Card title="Top Courses">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th style={{ textAlign: 'right' }}>Enrollments</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
                <th style={{ textAlign: 'right' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading || !topCourses
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)
                : topCourses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <a href={`/admin/courses/${c.id}`} style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{c.title}</a>
                    </td>
                    <td style={{ textAlign: 'right' }}>{c.enrollments}</td>
                    <td style={{ textAlign: 'right' }}>{formatMoney(c.revenue)}</td>
                    <td style={{ textAlign: 'right' }}>{c.rating > 0 ? c.rating.toFixed(1) : '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
