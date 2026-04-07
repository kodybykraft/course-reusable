'use client';

interface ProgressBarProps {
  percent: number;
  height?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  percent,
  height = 8,
  className,
  barClassName,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height,
        backgroundColor: '#e5e7eb',
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className={barClassName}
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: '#2D60FF',
          borderRadius: height / 2,
          transition: 'width 0.3s ease',
        }}
      />
      {showLabel && (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: Math.max(10, height - 2),
            fontWeight: 600,
            color: clamped > 50 ? '#fff' : '#374151',
          }}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
