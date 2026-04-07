'use client';

import { useState, useCallback } from 'react';
import { Badge, Card, PageHeader, Pagination } from './_shared';
import { ENROLLMENTS, COURSES, STUDENTS } from './_data';

/* ==========================================================================
   Interactive Tabs
   ========================================================================== */

function InteractiveTabs({
  items,
  activeValue,
  onChange,
}: {
  items: Array<{ label: string; value: string; count?: number }>;
  activeValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="admin-tabs">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`admin-tab${activeValue === item.value ? ' admin-tab--active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined && <span className="admin-tab-count"> ({item.count})</span>}
        </button>
      ))}
    </div>
  );
}

/* ==========================================================================
   Paginated Table Controls
   ========================================================================== */

function PaginationControls({
  page, totalPages, total, pageSize, onPageChange,
}: {
  page: number; totalPages: number; total: number; pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="admin-pagination">
      <span>Showing {start}-{end} of {total}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button type="button" className="admin-pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <button type="button" className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

/* ==========================================================================
   Enroll Student Modal
   ========================================================================== */

function EnrollModal({
  open, onClose, onEnroll,
}: {
  open: boolean;
  onClose: () => void;
  onEnroll: (courseId: string, email: string) => void;
}) {
  const [courseId, setCourseId] = useState(COURSES[0]?.id ?? '');
  const [email, setEmail] = useState('');

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div className="admin-card" style={{ minWidth: 400, maxWidth: 500, padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1rem', color: '#fff' }}>Enroll Student</h3>

        <div className="admin-form-group">
          <label className="admin-label">Course</label>
          <select className="admin-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {COURSES.filter((c) => c.status === 'published').map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="admin-form-group" style={{ marginTop: '0.75rem' }}>
          <label className="admin-label">Student Email</label>
          <input className="admin-input" type="email" placeholder="student@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={!email.trim()}
            onClick={() => { onEnroll(courseId, email); setEmail(''); onClose(); }}
          >
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   EnrollmentsListClient
   ========================================================================== */

const PAGE_SIZE = 10;

export function EnrollmentsListClient() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [enrollments, setEnrollments] = useState(ENROLLMENTS);

  const courseLookup = Object.fromEntries(COURSES.map((c) => [c.id, c.title]));
  const studentLookup = Object.fromEntries(STUDENTS.map((s) => [s.id, `${s.firstName} ${s.lastName}`]));

  /* -- filtering -- */
  const filtered = enrollments.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (courseFilter !== 'all' && e.courseId !== courseFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusTabs = [
    { label: 'All', value: 'all', count: enrollments.length },
    { label: 'Active', value: 'active', count: enrollments.filter((e) => e.status === 'active').length },
    { label: 'Completed', value: 'completed', count: enrollments.filter((e) => e.status === 'completed').length },
    { label: 'Paused', value: 'paused', count: enrollments.filter((e) => e.status === 'paused').length },
  ];

  /* -- actions -- */
  const handleAction = useCallback((id: string, action: 'complete' | 'pause' | 'unenroll') => {
    setEnrollments((prev) =>
      action === 'unenroll'
        ? prev.filter((e) => e.id !== id)
        : prev.map((e) => {
            if (e.id !== id) return e;
            if (action === 'complete') return { ...e, status: 'completed', progress: 100, completedAt: new Date().toISOString().slice(0, 10) };
            return { ...e, status: 'paused' };
          }),
    );
  }, []);

  const handleEnroll = useCallback((courseId: string, _email: string) => {
    const newId = `e${Date.now()}`;
    setEnrollments((prev) => [
      { id: newId, courseId, studentId: 's1', status: 'active', progress: 0, enrolledAt: new Date().toISOString().slice(0, 10), completedAt: null },
      ...prev,
    ]);
  }, []);

  return (
    <>
      <PageHeader
        title="Enrollments"
        subtitle={`${enrollments.length} total enrollments`}
        actions={
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowModal(true)}>
            + Enroll Student
          </button>
        }
      />

      {/* Course filter */}
      <div style={{ marginBottom: '1rem' }}>
        <select className="admin-input" style={{ maxWidth: 260 }} value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
          <option value="all">All Courses</option>
          {COURSES.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <InteractiveTabs items={statusTabs} activeValue={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />

      {/* Table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No enrollments found</td></tr>
              )}
              {paged.map((e) => (
                <tr key={e.id}>
                  <td>{studentLookup[e.studentId] ?? e.studentId}</td>
                  <td>{courseLookup[e.courseId] ?? e.courseId}</td>
                  <td><Badge status={e.status} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: 6, background: '#1B2559', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
                        <div style={{ height: '100%', width: `${e.progress}%`, background: '#2D60FF', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{e.progress}%</span>
                    </div>
                  </td>
                  <td>{e.enrolledAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {e.status === 'active' && (
                        <>
                          <button type="button" className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => handleAction(e.id, 'complete')}>Complete</button>
                          <button type="button" className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => handleAction(e.id, 'pause')}>Pause</button>
                        </>
                      )}
                      <button type="button" className="admin-btn admin-btn--sm admin-btn--critical" onClick={() => handleAction(e.id, 'unenroll')}>Unenroll</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE && (
          <PaginationControls page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </Card>

      <EnrollModal open={showModal} onClose={() => setShowModal(false)} onEnroll={handleEnroll} />
    </>
  );
}
