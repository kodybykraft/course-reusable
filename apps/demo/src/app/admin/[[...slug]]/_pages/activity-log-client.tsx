'use client';

import { PageHeader, Card, Toolbar, Pagination } from './_shared';

const MOCK_LOGS = [
  { id: 'al1', user: 'Sarah Chen', action: 'Published course', resource: 'Next.js Masterclass', ip: '192.168.1.10', createdAt: '2026-04-08T14:30:00' },
  { id: 'al2', user: 'Sarah Chen', action: 'Created coupon', resource: 'WELCOME20', ip: '192.168.1.10', createdAt: '2026-04-08T13:15:00' },
  { id: 'al3', user: 'James Lee', action: 'Updated lesson', resource: 'Understanding Props', ip: '192.168.1.22', createdAt: '2026-04-08T11:45:00' },
  { id: 'al4', user: 'Sarah Chen', action: 'Issued certificate', resource: 'NXJS-A8F2-K9D1', ip: '192.168.1.10', createdAt: '2026-04-07T16:20:00' },
  { id: 'al5', user: 'James Lee', action: 'Created quiz', resource: 'React Fundamentals Quiz', ip: '192.168.1.22', createdAt: '2026-04-07T10:00:00' },
  { id: 'al6', user: 'Maria Garcia', action: 'Enrolled student', resource: 'dave@example.com → CSS Animations', ip: '192.168.1.35', createdAt: '2026-04-06T09:30:00' },
  { id: 'al7', user: 'Sarah Chen', action: 'Updated settings', resource: 'Payments', ip: '192.168.1.10', createdAt: '2026-04-05T15:45:00' },
  { id: 'al8', user: 'Sarah Chen', action: 'Created course', resource: 'TypeScript Deep Dive', ip: '192.168.1.10', createdAt: '2026-04-05T14:00:00' },
];

export function ActivityLogPage() {
  return (
    <>
      <PageHeader title="Activity Log" subtitle={`${MOCK_LOGS.length} recent actions`} />
      <Toolbar searchPlaceholder="Search actions..." />
      <Card>
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Action</th><th>Resource</th><th>IP Address</th><th>Time</th></tr>
          </thead>
          <tbody>
            {MOCK_LOGS.map((log) => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600 }}>{log.user}</td>
                <td>{log.action}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{log.resource}</td>
                <td style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>{log.ip}</td>
                <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={MOCK_LOGS.length} />
      </Card>
    </>
  );
}
