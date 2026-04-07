const pulseStyle = `
@keyframes pulse {
  0%, 100% { opacity: .6; }
  50% { opacity: .3; }
}
`;

const skeletonBar: React.CSSProperties = {
  background: '#334155',
  borderRadius: 4,
  animation: 'pulse 1.5s ease-in-out infinite',
};

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      <style>{pulseStyle}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, c) => (
              <th key={c} style={{ padding: '0.75rem' }}>
                <div style={{ ...skeletonBar, height: 14, width: '60%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: '0.75rem' }}>
                  <div
                    style={{
                      ...skeletonBar,
                      height: 12,
                      width: `${50 + ((r + c) % 3) * 15}%`,
                      animationDelay: `${(r * cols + c) * 0.05}s`,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function CardSkeleton() {
  return (
    <>
      <style>{pulseStyle}</style>
      <div
        className="admin-card"
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div style={{ ...skeletonBar, height: 18, width: '40%' }} />
        <div style={{ ...skeletonBar, height: 12, width: '80%' }} />
        <div style={{ ...skeletonBar, height: 12, width: '65%' }} />
        <div style={{ ...skeletonBar, height: 32, width: '30%', marginTop: '0.5rem' }} />
      </div>
    </>
  );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <>
      <style>{pulseStyle}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ ...skeletonBar, height: 12, width: 100 }} />
            <div style={{ ...skeletonBar, height: 38, width: '100%', borderRadius: 6 }} />
          </div>
        ))}
        <div style={{ ...skeletonBar, height: 40, width: 120, borderRadius: 6, marginTop: '0.5rem' }} />
      </div>
    </>
  );
}
