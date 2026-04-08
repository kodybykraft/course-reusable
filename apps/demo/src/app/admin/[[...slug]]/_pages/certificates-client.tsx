'use client';

import { useState } from 'react';
import { PageHeader, Card, Badge, EmptyState, Toolbar, Pagination } from './_shared';

const MOCK_CERTS = [
  { id: 'cert1', studentName: 'Alice Johnson', studentEmail: 'alice@example.com', courseName: 'Next.js Masterclass', code: 'NXJS-A8F2-K9D1', issuedAt: '2026-03-10' },
  { id: 'cert2', studentName: 'Eve Davis', studentEmail: 'eve@example.com', courseName: 'React Fundamentals', code: 'RECT-B3C7-M4P2', issuedAt: '2026-03-15' },
  { id: 'cert3', studentName: 'Carol Williams', studentEmail: 'carol@example.com', courseName: 'Node.js API Design', code: 'NODE-D5E9-Q7R3', issuedAt: '2026-03-22' },
  { id: 'cert4', studentName: 'Eve Davis', studentEmail: 'eve@example.com', courseName: 'CSS Animations & Motion', code: 'CSAM-F1G6-S8T5', issuedAt: '2026-04-01' },
];

export function CertificatesPage() {
  const [search, setSearch] = useState('');
  const filtered = search
    ? MOCK_CERTS.filter(c => c.studentName.toLowerCase().includes(search.toLowerCase()) || c.courseName.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : MOCK_CERTS;

  return (
    <>
      <PageHeader title="Certificates" subtitle={`${MOCK_CERTS.length} certificates issued`} />
      <Toolbar searchPlaceholder="Search by student, course, or code..." />
      <Card>
        <table className="admin-table">
          <thead>
            <tr><th>Student</th><th>Course</th><th>Certificate Code</th><th>Issued</th></tr>
          </thead>
          <tbody>
            {filtered.map((cert) => (
              <tr key={cert.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{cert.studentName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{cert.studentEmail}</div>
                </td>
                <td>{cert.courseName}</td>
                <td><code style={{ fontSize: '13px', background: 'var(--admin-bg-alt)', padding: '2px 8px', borderRadius: 4 }}>{cert.code}</code></td>
                <td>{new Date(cert.issuedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} />
      </Card>
    </>
  );
}
