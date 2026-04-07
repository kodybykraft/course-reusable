import { formatMoney } from '@course/core';

/* ==========================================================================
   Shared helper components used across all admin pages
   ========================================================================== */

export function Badge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = 'admin-badge admin-badge--subdued';
  if (['paid', 'fulfilled', 'active', 'completed', 'delivered', 'verified', 'subscribed', 'success'].includes(s)) cls = 'admin-badge admin-badge--success';
  else if (['pending', 'partial', 'draft', 'scheduled', 'partially_refunded', 'processing', 'open', 'requested', 'approved', 'invoice_sent'].includes(s)) cls = 'admin-badge admin-badge--warning';
  else if (['refunded', 'cancelled', 'archived', 'expired', 'failed', 'rejected', 'bounced', 'complained', 'unsubscribed'].includes(s)) cls = 'admin-badge admin-badge--critical';
  else if (['unfulfilled', 'unpaid', 'received', 'paused'].includes(s)) cls = 'admin-badge admin-badge--info';
  return <span className={cls}>{s.replace(/_/g, ' ')}</span>;
}

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <div className="admin-breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: '0 6px' }}>/</span>}
          {item.href ? <a href={item.href}>{item.label}</a> : <span style={{ color: 'var(--admin-text)' }}>{item.label}</span>}
        </span>
      ))}
    </div>
  );
}

export function TwoCol({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="admin-two-col">
      <div className="admin-two-col-main">{left}</div>
      <div className="admin-two-col-side">{right}</div>
    </div>
  );
}

export function Card({ title, actions, children }: { title?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="admin-card">
      {title && (
        <div className="admin-card-header">
          <h3 className="admin-card-title">{title}</h3>
          {actions}
        </div>
      )}
      <div className="admin-card-body">{children}</div>
    </div>
  );
}

export function FormGroup({ label, children, hint }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="admin-form-group">
      <label className="admin-label">{label}</label>
      {children}
      {hint && <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>{hint}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
      </div>
    </>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-title">{title}</div>
      <div className="admin-empty-desc">{description}</div>
      {action}
    </div>
  );
}

export function Tabs({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="admin-tabs">
      {items.map((label, i) => (
        <button key={label} type="button" className={`admin-tab${i === active ? ' admin-tab--active' : ''}`}>{label}</button>
      ))}
    </div>
  );
}

export function Toolbar({ searchPlaceholder, extraButtons }: { searchPlaceholder?: string; extraButtons?: React.ReactNode }) {
  return (
    <div className="admin-toolbar">
      <input className="admin-search" placeholder={searchPlaceholder ?? 'Search...'} />
      <button type="button" className="admin-filter-btn">Filter</button>
      <button type="button" className="admin-filter-btn">Sort</button>
      {extraButtons}
    </div>
  );
}

export function Pagination({ total, pageSize }: { total: number; pageSize?: number }) {
  const ps = pageSize ?? total;
  return (
    <div className="admin-pagination">
      <span>Showing 1-{Math.min(ps, total)} of {total}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button type="button" className="admin-pagination-btn" disabled>Previous</button>
        <button type="button" className="admin-pagination-btn" disabled>Next</button>
      </div>
    </div>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="admin-stats-grid">{children}</div>;
}

export function StatCard({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {change !== undefined && (
        <div className={`admin-stat-change ${change >= 0 ? 'admin-stat-change--up' : 'admin-stat-change--down'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      {label && <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>{label}</div>}
      <div style={{ height: '8px', background: 'var(--admin-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--admin-primary)', borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

export { formatMoney };
