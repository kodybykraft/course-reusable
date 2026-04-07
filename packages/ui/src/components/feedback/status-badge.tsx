export interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const variantStyles: Record<string, { bg: string; color: string }> = {
  success: { bg: '#ecfdf5', color: '#059669' },
  warning: { bg: '#fffbeb', color: '#d97706' },
  error: { bg: '#fef2f2', color: '#dc2626' },
  info: { bg: '#eff6ff', color: '#2563eb' },
  neutral: { bg: '#f3f4f6', color: '#6b7280' },
};

// Auto-detect variant from common status strings
function detectVariant(status: string): StatusBadgeProps['variant'] {
  const s = status.toLowerCase();
  if (['paid', 'fulfilled', 'active', 'completed', 'success', 'delivered'].includes(s)) return 'success';
  if (['pending', 'processing', 'partial', 'scheduled', 'draft'].includes(s)) return 'warning';
  if (['failed', 'cancelled', 'refunded', 'abandoned', 'bounced'].includes(s)) return 'error';
  if (['unfulfilled', 'requires_payment'].includes(s)) return 'info';
  return 'neutral';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const v = variant ?? detectVariant(status) ?? 'neutral';
  const styles = variantStyles[v];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        background: styles.bg,
        color: styles.color,
        textTransform: 'capitalize',
      }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
