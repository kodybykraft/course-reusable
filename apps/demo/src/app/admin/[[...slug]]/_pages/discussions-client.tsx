'use client';

import { useState } from 'react';
import { PageHeader, Card, Badge, Pagination } from './_shared';
import { DISCUSSIONS, COURSES } from './_data';

/* ==========================================================================
   Discussions — Admin Client Component
   ========================================================================== */

const MOCK_REPLIES = [
  { id: 'r1', author: 'Dave Brown', body: 'Try returning a cleanup function from useEffect.', createdAt: '2026-03-25', parentId: null },
  { id: 'r2', author: 'Eve Davis', body: 'Also make sure your dependency array is correct.', createdAt: '2026-03-26', parentId: 'r1' },
  { id: 'r3', author: 'Alice Johnson', body: 'Thanks, that fixed it!', createdAt: '2026-03-26', parentId: null },
];

interface Discussion {
  id: string;
  courseId: string;
  title: string;
  author: string;
  replies: number;
  isPinned: boolean;
  createdAt: string;
}

function DiscussionDetail({ discussion, onBack }: { discussion: Discussion; onBack: () => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="admin-btn admin-btn--secondary" style={{ marginBottom: 16 }}>
        &larr; Back to Discussions
      </button>
      <Card title={discussion.title}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, color: '#A3AED0', fontSize: 13 }}>
          <span>By {discussion.author}</span>
          <span>{discussion.createdAt}</span>
          {discussion.isPinned && <Badge status="active" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_REPLIES.map((r) => (
            <div
              key={r.id}
              style={{
                background: r.parentId ? '#162537' : '#111C44',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: 14,
                marginLeft: r.parentId ? 32 : 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{r.author}</span>
                <span style={{ color: '#A3AED0', fontSize: 12 }}>{r.createdAt}</span>
              </div>
              <p style={{ color: '#ccc', fontSize: 13, margin: 0 }}>{r.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function DiscussionsListClient() {
  const [courseFilter, setCourseFilter] = useState('all');
  const [selected, setSelected] = useState<Discussion | null>(null);

  const filtered = courseFilter === 'all'
    ? DISCUSSIONS
    : DISCUSSIONS.filter((d) => d.courseId === courseFilter);

  if (selected) {
    return <DiscussionDetail discussion={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <PageHeader title="Discussions" subtitle={`${filtered.length} threads`} />

      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="admin-search"
          style={{ width: 220, cursor: 'pointer' }}
        >
          <option value="all">All Courses</option>
          {COURSES.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <Card>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Replies</th>
              <th>Pinned</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td>
                  <button
                    type="button"
                    onClick={() => setSelected(d)}
                    style={{ background: 'none', border: 'none', color: '#2D60FF', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
                  >
                    {d.title}
                  </button>
                </td>
                <td style={{ color: '#A3AED0' }}>{d.author}</td>
                <td style={{ color: '#fff' }}>{d.replies}</td>
                <td>{d.isPinned ? <Badge status="active" /> : <span style={{ color: '#A3AED0' }}>--</span>}</td>
                <td style={{ color: '#A3AED0' }}>{d.createdAt}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="admin-btn admin-btn--secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
                      {d.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button type="button" className="admin-btn admin-btn--secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
                      Lock
                    </button>
                    <button type="button" className="admin-btn admin-btn--secondary" style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444' }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} />
      </Card>
    </div>
  );
}
