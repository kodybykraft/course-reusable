'use client';

interface CertificateCardProps {
  certificate: {
    id: string;
    uniqueCode: string;
    issuedAt: string;
    courseName?: string;
    studentName?: string;
  };
  verifyUrl?: string;
  onDownload?: (certificateId: string) => void;
  className?: string;
}

export function CertificateCard({
  certificate,
  verifyUrl,
  onDownload,
  className,
}: CertificateCardProps) {
  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={className}
      style={{
        border: '2px solid #d4af37',
        borderRadius: 12,
        padding: '2rem',
        background: 'linear-gradient(135deg, #fefce8 0%, #fff 100%)',
        textAlign: 'center',
        maxWidth: 480,
      }}
    >
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2, color: '#92400e', marginBottom: '0.5rem' }}>
        Certificate of Completion
      </div>

      {certificate.courseName && (
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', margin: '0.5rem 0' }}>
          {certificate.courseName}
        </h3>
      )}

      {certificate.studentName && (
        <p style={{ color: '#4b5563', margin: '0.25rem 0' }}>
          Awarded to <strong>{certificate.studentName}</strong>
        </p>
      )}

      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0' }}>
        Issued {formattedDate}
      </p>

      <div style={{ margin: '1rem 0', padding: '0.5rem', background: '#fef3c7', borderRadius: 6, display: 'inline-block' }}>
        <span style={{ fontSize: '0.8rem', color: '#92400e', fontFamily: 'monospace', fontWeight: 600 }}>
          {certificate.uniqueCode}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
        {onDownload && (
          <button
            onClick={() => onDownload(certificate.id)}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#2D60FF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Download
          </button>
        )}
        {verifyUrl && (
          <a
            href={`${verifyUrl}?code=${certificate.uniqueCode}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.5rem 1.25rem',
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#374151',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Verify
          </a>
        )}
      </div>
    </div>
  );
}
