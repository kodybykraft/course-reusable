'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Mock certificate database — in production this fetches from API
const MOCK_CERTS: Record<string, { studentName: string; courseName: string; issuedAt: string; instructorName: string }> = {
  'NXJS-A8F2-K9D1': { studentName: 'Alice Johnson', courseName: 'Next.js Masterclass', issuedAt: '2026-03-10', instructorName: 'Sarah Chen' },
  'RECT-B3C7-M4P2': { studentName: 'Eve Davis', courseName: 'React Fundamentals', issuedAt: '2026-03-15', instructorName: 'Sarah Chen' },
  'NODE-D5E9-Q7R3': { studentName: 'Carol Williams', courseName: 'Node.js API Design', issuedAt: '2026-03-22', instructorName: 'Sarah Chen' },
  'CSAM-F1G6-S8T5': { studentName: 'Eve Davis', courseName: 'CSS Animations & Motion', issuedAt: '2026-04-01', instructorName: 'James Lee' },
};

export default function CertificateViewPage() {
  const { code } = useParams<{ code: string }>();
  const cert = MOCK_CERTS[code];
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!cert) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'system-ui' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Certificate Not Found</h2>
        <p style={{ color: '#6b7280' }}>No certificate with code <strong>{code}</strong> was found.</p>
        <Link href="/dashboard" style={{ color: '#2D60FF', marginTop: '1rem', display: 'inline-block' }}>Back to Dashboard</Link>
      </div>
    );
  }

  const formattedDate = new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => window.print();

  const handleSendEmail = async () => {
    if (!emailTo) return;
    setEmailSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setEmailSending(false);
    setEmailSent(true);
    setTimeout(() => { setShowEmail(false); setEmailSent(false); setEmailTo(''); }, 2000);
  };

  return (
    <>
      <style>{`
        @media print {
          .cert-actions, .student-nav, .cert-email-panel { display: none !important; }
          .cert-page { padding: 0 !important; background: #fff !important; }
          .cert-frame { box-shadow: none !important; border: 3px solid #d4af37 !important; }
        }
      `}</style>

      <div className="cert-page" style={{ minHeight: 'calc(100vh - 56px)', background: '#f3f4f6', padding: '2rem', position: 'relative' }}>
        {/* Action buttons */}
        <div className="cert-actions" style={{ maxWidth: 800, margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>&larr; Back to Dashboard</Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowEmail(true)} style={{ padding: '0.5rem 1.25rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
              Email Certificate
            </button>
            <button onClick={handlePrint} style={{ padding: '0.5rem 1.25rem', background: '#2D60FF', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div className="cert-frame" style={{
          maxWidth: 800, margin: '0 auto', background: '#fff',
          border: '3px solid #d4af37', borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '4rem 3rem', textAlign: 'center', position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold corner accents */}
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, border: '1px solid #e5c76b', borderRadius: 2, pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 6, color: '#92400e', marginBottom: '0.5rem' }}>
            Certificate of Completion
          </div>

          <div style={{ width: 60, height: 2, background: '#d4af37', margin: '1rem auto' }} />

          <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '0.5rem' }}>This certifies that</p>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: '#111827', margin: '0.75rem 0', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {cert.studentName}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '0.5rem' }}>has successfully completed the course</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0.75rem 0' }}>
            {cert.courseName}
          </h2>

          <div style={{ width: 40, height: 2, background: '#d4af37', margin: '1.5rem auto' }} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 600 }}>{formattedDate}</div>
              <div style={{ width: 120, height: 1, background: '#d1d5db', margin: '0.25rem auto' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Date Issued</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 600, fontStyle: 'italic' }}>{cert.instructorName}</div>
              <div style={{ width: 120, height: 1, background: '#d1d5db', margin: '0.25rem auto' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Instructor</div>
            </div>
          </div>

          {/* Verification code */}
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: '#fef3c7', borderRadius: 6 }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: '#92400e' }}>
                Verify: {code}
              </span>
            </div>
          </div>
        </div>

        {/* Email slide-over panel */}
        {showEmail && (
          <>
            <div onClick={() => setShowEmail(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
            <div className="cert-email-panel" style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
              background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
              zIndex: 101, padding: '2rem', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Email Certificate</h3>
                <button onClick={() => setShowEmail(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
              </div>

              {emailSent ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>&#9989;</div>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Certificate Sent!</p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Sent to {emailTo}</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>To</label>
                    <input
                      type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="student@example.com"
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Subject</label>
                    <input
                      type="text" readOnly
                      value={`Your certificate for ${cert.courseName}`}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', background: '#f9fafb', color: '#374151' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Message</label>
                    <textarea
                      rows={5} readOnly
                      value={`Hi ${cert.studentName},\n\nCongratulations on completing ${cert.courseName}!\n\nYour certificate is attached. Verification code: ${code}\n\nBest regards`}
                      style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', background: '#f9fafb', color: '#374151', resize: 'none' }}
                    />
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: 8, marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Attachment</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>certificate-{code}.pdf</div>
                  </div>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailTo}
                    style={{
                      padding: '0.75rem', background: !emailTo ? '#9ca3af' : '#2D60FF', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
                      cursor: !emailTo ? 'not-allowed' : 'pointer', width: '100%',
                    }}
                  >
                    {emailSending ? 'Sending...' : 'Send Certificate'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
