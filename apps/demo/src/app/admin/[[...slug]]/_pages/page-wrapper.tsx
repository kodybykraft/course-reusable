'use client';

import { Component, Suspense, type ReactNode, type ErrorInfo } from 'react';

/* ---------- Error Boundary ---------- */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PageErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Could log to external service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            background: '#1e293b',
            borderRadius: 12,
            border: '1px solid #334155',
            textAlign: 'center',
            maxWidth: 500,
            margin: '2rem auto',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
            Something went wrong
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#2D60FF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ---------- Loading Skeleton ---------- */

const pulseKeyframes = `
@keyframes page-pulse {
  0%, 100% { opacity: .6; }
  50% { opacity: .3; }
}
`;

const bar: React.CSSProperties = {
  background: '#334155',
  borderRadius: 4,
  animation: 'page-pulse 1.5s ease-in-out infinite',
};

function PageSkeleton() {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title skeleton */}
        <div style={{ ...bar, height: 28, width: 200 }} />
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ ...bar, height: 12, width: '60%', marginBottom: 8 }} />
              <div style={{ ...bar, height: 24, width: '40%' }} />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[0, 1, 2, 3, 4].map(r => (
              <div key={r} style={{ display: 'flex', gap: '1rem' }}>
                {[0, 1, 2, 3].map(c => (
                  <div key={c} style={{ ...bar, height: 14, flex: 1, animationDelay: `${(r * 4 + c) * 0.05}s` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Combined Wrapper ---------- */

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </PageErrorBoundary>
  );
}
