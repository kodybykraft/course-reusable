'use client';

import { PageHeader, Card, Badge, Toolbar, Pagination } from './_shared';

const MOCK_QUIZZES = [
  { id: 'qz1', title: 'React Fundamentals Quiz', course: 'React Fundamentals', module: 'State & Effects', questions: 4, passingScore: 70, attempts: 12, avgScore: 78, status: 'active' },
  { id: 'qz2', title: 'App Router Basics Quiz', course: 'Next.js Masterclass', module: 'App Router Basics', questions: 5, passingScore: 80, attempts: 8, avgScore: 72, status: 'active' },
  { id: 'qz3', title: 'CSS Transitions Quiz', course: 'CSS Animations & Motion', module: 'CSS Transitions', questions: 3, passingScore: 60, attempts: 5, avgScore: 85, status: 'active' },
  { id: 'qz4', title: 'Express Fundamentals Quiz', course: 'Node.js API Design', module: 'Express Fundamentals', questions: 6, passingScore: 70, attempts: 0, avgScore: 0, status: 'draft' },
];

export function QuizzesListPage() {
  return (
    <>
      <PageHeader
        title="Quizzes"
        subtitle={`${MOCK_QUIZZES.length} quizzes`}
        actions={<a href="/admin/quizzes/new" className="admin-btn admin-btn--primary">Create Quiz</a>}
      />
      <Toolbar searchPlaceholder="Search quizzes..." />
      <Card>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Course</th>
              <th style={{ textAlign: 'right' }}>Questions</th>
              <th style={{ textAlign: 'right' }}>Passing</th>
              <th style={{ textAlign: 'right' }}>Attempts</th>
              <th style={{ textAlign: 'right' }}>Avg Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_QUIZZES.map((q) => (
              <tr key={q.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{q.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{q.module}</div>
                </td>
                <td style={{ color: 'var(--admin-text-secondary)' }}>{q.course}</td>
                <td style={{ textAlign: 'right' }}>{q.questions}</td>
                <td style={{ textAlign: 'right' }}>{q.passingScore}%</td>
                <td style={{ textAlign: 'right' }}>{q.attempts}</td>
                <td style={{ textAlign: 'right' }}>
                  {q.avgScore > 0 ? (
                    <span style={{ fontWeight: 600, color: q.avgScore >= q.passingScore ? 'var(--admin-success, #2ecc71)' : 'var(--admin-critical, #e74c3c)' }}>
                      {q.avgScore}%
                    </span>
                  ) : '-'}
                </td>
                <td><Badge status={q.status} /></td>
                <td>
                  <a href={`/admin/quizzes/${q.id}`} className="admin-btn admin-btn--plain" style={{ fontSize: 12, padding: '4px 8px' }}>
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={MOCK_QUIZZES.length} />
      </Card>
    </>
  );
}
