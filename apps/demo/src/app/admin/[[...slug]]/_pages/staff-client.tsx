'use client';

import { useState } from 'react';
import { PageHeader, Card, Badge, Toolbar, Pagination } from './_shared';

const MOCK_STAFF = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'admin', courses: 3, lastLogin: '2026-04-08' },
  { id: 'u2', name: 'James Lee', email: 'james@example.com', role: 'staff', courses: 2, lastLogin: '2026-04-07' },
  { id: 'u3', name: 'Maria Garcia', email: 'maria@example.com', role: 'staff', courses: 1, lastLogin: '2026-04-05' },
];

export function StaffPage() {
  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${MOCK_STAFF.length} team members`}
        actions={<button className="admin-btn admin-btn--primary">Add Staff</button>}
      />
      <Card>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Courses</th><th>Last Login</th></tr>
          </thead>
          <tbody>
            {MOCK_STAFF.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.email}</td>
                <td><Badge status={s.role} /></td>
                <td>{s.courses} courses</td>
                <td>{new Date(s.lastLogin).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
