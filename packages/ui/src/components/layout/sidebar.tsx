import type { ReactNode } from 'react';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  badge?: string | number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  header?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({ sections, header, footer }: SidebarProps) {
  return (
    <aside style={{ width: '240px', height: '100vh', borderRight: '1px solid #e5e7eb', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0 }}>
      {header && (
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '1rem' }}>
          {header}
        </div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {sections.map((section, si) => (
          <div key={si} style={{ marginBottom: '0.5rem' }}>
            {section.title && (
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  color: item.active ? '#111827' : '#6b7280',
                  background: item.active ? '#f3f4f6' : 'transparent',
                  fontWeight: item.active ? 500 : 400,
                }}
              >
                <span>{item.icon ? `${item.icon} ${item.label}` : item.label}</span>
                {item.badge !== undefined && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {footer && (
        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#9ca3af' }}>
          {footer}
        </div>
      )}
    </aside>
  );
}
