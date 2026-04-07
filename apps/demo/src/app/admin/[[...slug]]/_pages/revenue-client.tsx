'use client';

import { PageHeader, Card, StatsGrid, StatCard, Pagination, formatMoney } from './_shared';
import { REVENUE, COURSES, STUDENTS } from './_data';

/* ==========================================================================
   Revenue — Admin Client Component
   ========================================================================== */

const RECENT_PURCHASES = [
  { student: 'Alice Johnson', course: 'React Fundamentals', amount: 4900, date: '2026-04-05' },
  { student: 'Bob Smith', course: 'Next.js Masterclass', amount: 4900, date: '2026-04-04' },
  { student: 'Carol Williams', course: 'CSS Animations & Motion', amount: 4900, date: '2026-04-03' },
  { student: 'Eve Davis', course: 'Node.js API Design', amount: 4900, date: '2026-04-02' },
  { student: 'Dave Brown', course: 'React Fundamentals', amount: 4900, date: '2026-04-01' },
];

function BarChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  const max = Math.max(...data.map((d) => d.revenue));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, padding: '0 8px' }}>
      {data.map((d) => {
        const pct = max > 0 ? (d.revenue / max) * 100 : 0;
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#A3AED0', fontSize: 11 }}>{formatMoney(d.revenue)}</span>
            <div
              style={{
                width: '100%',
                maxWidth: 48,
                height: `${pct}%`,
                minHeight: 4,
                background: 'linear-gradient(180deg, #2D60FF 0%, #1B3BA0 100%)',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.3s',
              }}
            />
            <span style={{ color: '#A3AED0', fontSize: 12, fontWeight: 500 }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RevenueClient() {
  const publishedCourses = COURSES.filter((c) => c.status === 'published');

  return (
    <div>
      <PageHeader title="Revenue" subtitle="Financial overview and analytics" />

      <StatsGrid>
        <StatCard label="Total Revenue" value={formatMoney(REVENUE.totalRevenue)} change={12.5} />
        <StatCard label="Total Enrollments" value={String(REVENUE.totalEnrollments)} change={8.2} />
        <StatCard label="Avg Course Price" value={formatMoney(REVENUE.avgCoursePrice)} />
        <StatCard label="Avg Completion Rate" value={`${REVENUE.completionRate}%`} change={3.1} />
      </StatsGrid>

      <div style={{ marginTop: 20 }}>
        <Card title="Monthly Revenue">
          <BarChart data={REVENUE.monthlyRevenue} />
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card title="Per-Course Revenue">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Enrollments</th>
                <th>Revenue</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {publishedCourses.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{c.title}</td>
                  <td style={{ color: '#A3AED0' }}>{c.enrollmentCount}</td>
                  <td style={{ color: '#fff' }}>{formatMoney(c.revenue)}</td>
                  <td style={{ color: '#A3AED0' }}>
                    {c.rating > 0 ? `${c.rating.toFixed(1)} / 5` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={publishedCourses.length} />
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Card title="Recent Purchases">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_PURCHASES.map((p, i) => (
                <tr key={i}>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{p.student}</td>
                  <td style={{ color: '#A3AED0' }}>{p.course}</td>
                  <td style={{ color: '#fff' }}>{formatMoney(p.amount)}</td>
                  <td style={{ color: '#A3AED0' }}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={RECENT_PURCHASES.length} />
        </Card>
      </div>
    </div>
  );
}
