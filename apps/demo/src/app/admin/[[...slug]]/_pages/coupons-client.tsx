'use client';

import { useState } from 'react';
import { PageHeader, Card, Badge, FormGroup, Pagination } from './_shared';
import { COUPONS, COURSES } from './_data';

/* ==========================================================================
   Coupons — Admin Client Components
   ========================================================================== */

export function CouponFormClient({ onBack }: { onBack?: () => void }) {
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    courseId: '',
    usageLimit: '',
    startDate: '',
    expiryDate: '',
  });

  const set = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div>
      {onBack && (
        <button type="button" onClick={onBack} className="admin-btn admin-btn--secondary" style={{ marginBottom: 16 }}>
          &larr; Back to Coupons
        </button>
      )}
      <PageHeader title="Create Coupon" subtitle="Set up a new discount code" />

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormGroup label="Coupon Code">
            <input className="admin-input" placeholder="e.g. SUMMER30" value={form.code} onChange={(e) => set('code', e.target.value)} />
          </FormGroup>

          <FormGroup label="Discount Type">
            <select className="admin-input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </FormGroup>

          <FormGroup label="Value" hint={form.type === 'percentage' ? 'Enter 1-100' : 'Amount in cents'}>
            <input className="admin-input" type="number" placeholder="20" value={form.value} onChange={(e) => set('value', e.target.value)} />
          </FormGroup>

          <FormGroup label="Course (optional)">
            <select className="admin-input" value={form.courseId} onChange={(e) => set('courseId', e.target.value)}>
              <option value="">All courses</option>
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Usage Limit">
            <input className="admin-input" type="number" placeholder="100" value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} />
          </FormGroup>

          <div /> {/* spacer */}

          <FormGroup label="Start Date">
            <input className="admin-input" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </FormGroup>

          <FormGroup label="Expiry Date">
            <input className="admin-input" type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
          </FormGroup>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="admin-btn admin-btn--primary">Save Coupon</button>
        </div>
      </Card>
    </div>
  );
}

export function CouponsListClient() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) return <CouponFormClient onBack={() => setShowForm(false)} />;

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle={`${COUPONS.length} discount codes`}
        actions={
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowForm(true)}>
            Create Coupon
          </button>
        }
      />

      <Card>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {COUPONS.map((c) => (
              <tr key={c.id}>
                <td style={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{c.code}</td>
                <td><Badge status={c.type === 'percentage' ? 'pending' : 'processing'} /></td>
                <td style={{ color: '#fff' }}>
                  {c.type === 'percentage' ? `${c.value}%` : `$${(c.value / 100).toFixed(2)}`}
                </td>
                <td style={{ color: '#A3AED0' }}>
                  {c.usageCount} / {c.usageLimit}
                </td>
                <td>
                  <Badge status={c.isActive ? 'active' : 'expired'} />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="admin-btn admin-btn--secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
                      Edit
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
        <Pagination total={COUPONS.length} />
      </Card>
    </div>
  );
}
