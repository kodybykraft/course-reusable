export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change, e.g. 12.5 or -3.2
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export function StatCard({ title, value, change, prefix, suffix, loading }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div style={{ padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>
        {title}
      </div>
      {loading ? (
        <div style={{ height: '2rem', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 2s infinite' }} />
      ) : (
        <>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
            {prefix}{value}{suffix}
          </div>
          {change !== undefined && (
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: isPositive ? '#059669' : '#dc2626' }}>
              {isPositive ? '+' : ''}{change.toFixed(1)}% vs last period
            </div>
          )}
        </>
      )}
    </div>
  );
}
