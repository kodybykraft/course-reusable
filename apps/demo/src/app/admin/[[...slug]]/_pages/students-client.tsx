'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader, Card, Badge, formatMoney } from './_shared';
import { STUDENTS, ENROLLMENTS, COURSES } from './_data';

/* ==========================================================================
   Types
   ========================================================================== */

type Student = typeof STUDENTS[0];

interface EnrolledCourse {
  id: string;
  courseTitle: string;
  progress: number;
  status: string;
  enrolledAt: string;
}

interface Purchase {
  id: string;
  course: string;
  amount: number;
  date: string;
}

/* ==========================================================================
   Skeleton
   ========================================================================== */

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>{Array.from({ length: cols }, (_, i) => (
          <th key={i}><div style={{ width: '60%', height: 14, background: 'var(--admin-border-light)', borderRadius: 4 }} /></th>
        ))}</tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => (
              <td key={c}><div style={{ width: `${50 + Math.random() * 40}%`, height: 14, background: 'var(--admin-border-light)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ==========================================================================
   Progress bar
   ========================================================================== */

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--admin-border-light, #2a3441)', borderRadius: 3, overflow: 'hidden' }}>
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
   Auth helper
   ========================================================================== */

function getAuthHeaders(): HeadersInit {
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith('token='));
  const token = cookie?.split('=')[1] ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ==========================================================================
   StudentsListClient
   ========================================================================== */

const PAGE_SIZE = 10;

export function StudentsListClient() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchStudents = useCallback(async (query: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      params.set('page', String(pg));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/course/admin/students?${params}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStudents(data.students ?? data.data ?? data);
      setTotal(data.total ?? (data.students ?? data.data ?? data).length);
    } catch {
      let filtered = [...STUDENTS];
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(s =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
        );
      }
      setTotal(filtered.length);
      setStudents(filtered.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(search, page);
  }, [search, page, fetchStudents]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 300);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Students" />
      <div className="admin-card">
        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search students..." onChange={handleSearchChange} defaultValue="" />
          <button type="button" className="admin-filter-btn">Filter</button>
          <button type="button" className="admin-filter-btn">Sort</button>
        </div>

        {loading ? <TableSkeleton cols={6} /> : students.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-muted)' }}>No students found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Enrolled Courses</th>
                <th style={{ textAlign: 'right' }}>Completed</th>
                <th style={{ textAlign: 'right' }}>Total Spent</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <a href={`/admin/students/${s.id}`} style={{ fontWeight: 500, color: 'var(--admin-text)' }}>
                      {s.firstName} {s.lastName}
                    </a>
                  </td>
                  <td style={{ color: 'var(--admin-text-secondary)' }}>{s.email}</td>
                  <td style={{ textAlign: 'right' }}>{s.enrolledCourses}</td>
                  <td style={{ textAlign: 'right' }}>{s.completedCourses}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(s.totalSpent)}</td>
                  <td style={{ color: 'var(--admin-text-secondary)' }}>{s.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="admin-pagination">
          <span>Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="admin-pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button type="button" className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   StudentDetailClient
   ========================================================================== */

export function StudentDetailClient({ student: initial }: { student: Student }) {
  const [student, setStudent] = useState(initial);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/course/admin/students/${initial.id}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setStudent(data.student ?? data);
          if (data.enrollments) setEnrolledCourses(data.enrollments);
          if (data.purchases) setPurchases(data.purchases);
          setLoading(false);
          return;
        }
      } catch { /* fall through to mock */ }

      if (cancelled) return;

      // Mock data fallback
      const studentEnrollments = ENROLLMENTS.filter(e => e.studentId === initial.id);
      setEnrolledCourses(studentEnrollments.map(e => {
        const course = COURSES.find(c => c.id === e.courseId);
        return {
          id: e.id,
          courseTitle: course?.title ?? 'Unknown',
          progress: e.progress,
          status: e.status,
          enrolledAt: e.enrolledAt,
        };
      }));

      setPurchases(studentEnrollments.map(e => {
        const course = COURSES.find(c => c.id === e.courseId);
        return {
          id: `pur_${e.id}`,
          course: course?.title ?? 'Unknown',
          amount: course?.revenue ? Math.round(course.revenue / Math.max(course.enrollmentCount, 1)) : 0,
          date: e.enrolledAt,
        };
      }));

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [initial.id]);

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        breadcrumbs={[{ label: 'Students', href: '/admin/students' }, { label: `${student.firstName} ${student.lastName}` }]}
      />

      {/* Student info header */}
      <Card>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--admin-primary, #2D60FF)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff',
            fontSize: 20, fontWeight: 600,
          }}>
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--admin-text, #f1f5f9)' }}>
              {student.firstName} {student.lastName}
            </div>
            <div style={{ color: 'var(--admin-text-secondary, #94a3b8)', fontSize: 13 }}>{student.email}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted, #64748b)' }}>Enrolled</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--admin-text, #f1f5f9)' }}>{student.enrolledCourses}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted, #64748b)' }}>Completed</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--admin-text, #f1f5f9)' }}>{student.completedCourses}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted, #64748b)' }}>Total Spent</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--admin-text, #f1f5f9)' }}>{formatMoney(student.totalSpent)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted, #64748b)' }}>Joined</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--admin-text, #f1f5f9)' }}>{student.joinedAt}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enrolled courses with progress */}
      <Card title={`Enrolled Courses (${enrolledCourses.length})`}>
        {loading ? <TableSkeleton rows={3} cols={4} /> : enrolledCourses.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-muted)' }}>No enrollments yet</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map(ec => (
                <tr key={ec.id}>
                  <td style={{ fontWeight: 500 }}>{ec.courseTitle}</td>
                  <td style={{ minWidth: 140 }}><ProgressBar value={ec.progress} /></td>
                  <td><Badge status={ec.status} /></td>
                  <td style={{ color: 'var(--admin-text-secondary)' }}>{ec.enrolledAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Purchase history */}
      <Card title="Purchase History">
        {loading ? <TableSkeleton rows={3} cols={3} /> : purchases.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-muted)' }}>No purchases yet</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.course}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(p.amount)}</td>
                  <td style={{ color: 'var(--admin-text-secondary)' }}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
