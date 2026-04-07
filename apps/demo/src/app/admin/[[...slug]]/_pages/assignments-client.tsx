'use client';

import { useState } from 'react';
import { Badge, Card, PageHeader, FormGroup } from './_shared';
import { COURSES } from './_data';

/* ==========================================================================
   Mock Data Fallback
   ========================================================================== */

const MOCK_ASSIGNMENTS = [
  { id: 'a1', title: 'Build a Todo App', courseId: 'c1', submissions: 12, dueDate: '2026-04-15', status: 'active' },
  { id: 'a2', title: 'REST API Design Doc', courseId: 'c5', submissions: 8, dueDate: '2026-04-20', status: 'active' },
  { id: 'a3', title: 'CSS Animation Portfolio', courseId: 'c4', submissions: 5, dueDate: '2026-04-10', status: 'active' },
  { id: 'a4', title: 'React Component Library', courseId: 'c1', submissions: 15, dueDate: '2026-03-30', status: 'closed' },
];

const MOCK_SUBMISSIONS = [
  { id: 'sub1', assignmentId: 'a1', studentName: 'Alice Johnson', submittedAt: '2026-04-12', content: 'Built a full-featured Todo app with React, including drag-and-drop reordering, local storage persistence, and filter/sort capabilities.', fileUrl: 'todo-app.zip', grade: null, feedback: '' },
  { id: 'sub2', assignmentId: 'a1', studentName: 'Bob Smith', submittedAt: '2026-04-13', content: 'Simple Todo with add/delete functionality. Uses useState for state management. Includes basic CSS styling.', fileUrl: 'bob-todo.zip', grade: 72, feedback: 'Good start but missing edit and filter features.' },
  { id: 'sub3', assignmentId: 'a1', studentName: 'Carol Williams', submittedAt: '2026-04-14', content: 'Advanced Todo app with categories, due dates, priority levels, dark mode, and unit tests using Vitest.', fileUrl: 'carol-todo.zip', grade: 95, feedback: 'Excellent work! Very thorough implementation.' },
  { id: 'sub4', assignmentId: 'a1', studentName: 'Eve Davis', submittedAt: '2026-04-11', content: 'Todo app with authentication, real-time sync via Supabase, and mobile-responsive design.', fileUrl: 'eve-todo.zip', grade: null, feedback: '' },
];

/* ==========================================================================
   Create Assignment Form
   ========================================================================== */

function CreateAssignmentForm({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { title: string; courseId: string; dueDate: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(COURSES[0]?.id ?? '');
  const [dueDate, setDueDate] = useState('');

  return (
    <Card title="Create Assignment">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormGroup label="Title">
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" />
        </FormGroup>
        <FormGroup label="Course">
          <select className="admin-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </FormGroup>
      </div>
      <FormGroup label="Due Date">
        <input className="admin-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </FormGroup>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
        <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={!title.trim() || !dueDate}
          onClick={() => { onCreate({ title, courseId, dueDate }); setTitle(''); setDueDate(''); onClose(); }}
        >
          Create
        </button>
      </div>
    </Card>
  );
}

/* ==========================================================================
   AssignmentsListClient
   ========================================================================== */

export function AssignmentsListClient() {
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [showForm, setShowForm] = useState(false);

  const courseLookup = Object.fromEntries(COURSES.map((c) => [c.id, c.title]));

  const handleCreate = (data: { title: string; courseId: string; dueDate: string }) => {
    setAssignments((prev) => [
      { id: `a${Date.now()}`, title: data.title, courseId: data.courseId, submissions: 0, dueDate: data.dueDate, status: 'active' },
      ...prev,
    ]);
  };

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle={`${assignments.length} assignments`}
        actions={
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close' : '+ Create Assignment'}
          </button>
        }
      />

      {showForm && <CreateAssignmentForm onClose={() => setShowForm(false)} onCreate={handleCreate} />}

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Submissions</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.title}</td>
                  <td>{courseLookup[a.courseId] ?? a.courseId}</td>
                  <td>
                    <span style={{ background: '#1B2559', padding: '2px 10px', borderRadius: 12, fontSize: '0.85rem' }}>
                      {a.submissions}
                    </span>
                  </td>
                  <td>{a.dueDate}</td>
                  <td><Badge status={a.status} /></td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => alert(`View submissions for ${a.title}`)}>
                      Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ==========================================================================
   GradingClient
   ========================================================================== */

export function GradingClient() {
  const submissions = MOCK_SUBMISSIONS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [grades, setGrades] = useState<Record<string, { grade: number | null; feedback: string }>>(
    Object.fromEntries(submissions.map((s) => [s.id, { grade: s.grade, feedback: s.feedback }])),
  );

  const current = submissions[currentIdx];
  const currentGrade = grades[current.id] ?? { grade: null, feedback: '' };

  const handleGradeChange = (value: string) => {
    const num = value === '' ? null : Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    setGrades((prev) => ({ ...prev, [current.id]: { ...prev[current.id], grade: num, feedback: prev[current.id]?.feedback ?? '' } }));
  };

  const handleFeedbackChange = (value: string) => {
    setGrades((prev) => ({ ...prev, [current.id]: { ...prev[current.id], grade: prev[current.id]?.grade ?? null, feedback: value } }));
  };

  const handleSubmitGrade = () => {
    alert(`Grade submitted for ${current.studentName}: ${currentGrade.grade}/100`);
  };

  const gradeColor = (g: number | null) => {
    if (g === null) return '#94a3b8';
    if (g >= 90) return '#2ecc71';
    if (g >= 70) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <>
      <PageHeader
        title="Grading"
        subtitle={`Submission ${currentIdx + 1} of ${submissions.length}`}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="button" className="admin-btn admin-btn--outline" disabled={currentIdx <= 0} onClick={() => setCurrentIdx((i) => i - 1)}>
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{currentIdx + 1}/{submissions.length}</span>
            <button type="button" className="admin-btn admin-btn--outline" disabled={currentIdx >= submissions.length - 1} onClick={() => setCurrentIdx((i) => i + 1)}>
              Next
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
        {/* Submission Content */}
        <div>
          <Card title={`${current.studentName}'s Submission`}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                <span>Submitted: {current.submittedAt}</span>
                {current.fileUrl && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    {current.fileUrl}
                  </span>
                )}
              </div>
              <div style={{
                background: '#111C44', borderRadius: 8, padding: '1.25rem',
                border: '1px solid rgba(255,255,255,.06)', lineHeight: 1.7, fontSize: '0.9rem', color: '#e2e8f0',
              }}>
                {current.content}
              </div>
            </div>
          </Card>
        </div>

        {/* Grading Panel */}
        <div>
          <Card title="Grade Submission">
            <FormGroup label="Grade (0-100)">
              <div style={{ position: 'relative' }}>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  max={100}
                  value={currentGrade.grade ?? ''}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  placeholder="Enter grade"
                  style={{ paddingRight: '3rem' }}
                />
                {currentGrade.grade !== null && (
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontWeight: 700, fontSize: '1rem', color: gradeColor(currentGrade.grade),
                  }}>
                    /100
                  </span>
                )}
              </div>
            </FormGroup>

            <FormGroup label="Feedback">
              <textarea
                className="admin-input"
                rows={6}
                value={currentGrade.feedback}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                placeholder="Provide feedback to the student..."
              />
            </FormGroup>

            <button
              type="button"
              className="admin-btn admin-btn--primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={currentGrade.grade === null}
              onClick={handleSubmitGrade}
            >
              Submit Grade
            </button>
          </Card>

          {/* Quick Nav */}
          <Card title="All Submissions">
            {submissions.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setCurrentIdx(i)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.75rem', borderRadius: 6, cursor: 'pointer', marginBottom: '2px',
                  background: i === currentIdx ? 'rgba(45,96,255,.15)' : 'transparent',
                  border: i === currentIdx ? '1px solid rgba(45,96,255,.3)' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: i === currentIdx ? '#fff' : '#94a3b8' }}>{s.studentName}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: gradeColor(grades[s.id]?.grade ?? null) }}>
                  {grades[s.id]?.grade !== null && grades[s.id]?.grade !== undefined ? `${grades[s.id].grade}%` : 'Ungraded'}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
