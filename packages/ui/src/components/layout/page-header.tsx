import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 0.375rem' }}>/</span>}
              {crumb.href ? (
                <a href={crumb.href} style={{ color: '#6b7280', textDecoration: 'none' }}>
                  {crumb.label}
                </a>
              ) : (
                <span style={{ color: '#374151' }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>
          {description && <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>{description}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
      </div>
    </div>
  );
}
