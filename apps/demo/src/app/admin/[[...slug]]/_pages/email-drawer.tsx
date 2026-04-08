'use client';

import { useState } from 'react';

interface EmailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  defaultSubject?: string;
  defaultMessage?: string;
}

export function EmailDrawer({ isOpen, onClose, recipientEmail, recipientName, defaultSubject, defaultMessage }: EmailDrawerProps) {
  const [subject, setSubject] = useState(defaultSubject ?? '');
  const [message, setMessage] = useState(defaultMessage ?? '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    // In production this calls the email API
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => { onClose(); setSent(false); setSubject(defaultSubject ?? ''); setMessage(defaultMessage ?? ''); }, 2000);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--admin-bg, #0f1923)', color: 'var(--admin-text, #f1f5f9)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)', zIndex: 1001,
        display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--admin-border, #1e293b)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border, #1e293b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Send Email</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>

        {sent ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--admin-success, #2ecc71)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>&#10003;</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginTop: '0.75rem' }}>Email Sent!</p>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Sent to {recipientEmail}</p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
              {/* To */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: 'var(--admin-text-secondary)' }}>To</label>
                <div style={{ padding: '0.625rem', background: 'var(--admin-bg-alt, #162231)', border: '1px solid var(--admin-border, #1e293b)', borderRadius: 8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--admin-primary, #2D60FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    {recipientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{recipientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{recipientEmail}</div>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: 'var(--admin-text-secondary)' }}>Subject</label>
                <input
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject..."
                  style={{ width: '100%', padding: '0.625rem', background: 'var(--admin-bg-alt, #162231)', border: '1px solid var(--admin-border, #1e293b)', borderRadius: 8, fontSize: '0.9rem', color: 'var(--admin-text)', boxSizing: 'border-box' }}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4, color: 'var(--admin-text-secondary)' }}>Message</label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  rows={10}
                  style={{ width: '100%', padding: '0.625rem', background: 'var(--admin-bg-alt, #162231)', border: '1px solid var(--admin-border, #1e293b)', borderRadius: 8, fontSize: '0.9rem', color: 'var(--admin-text)', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {/* Quick templates */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: 'var(--admin-text-secondary)' }}>Quick Templates</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    { label: 'Welcome', subject: 'Welcome to the course!', body: `Hi ${recipientName},\n\nWelcome! We're excited to have you.\n\nIf you have any questions, don't hesitate to reach out.\n\nBest regards` },
                    { label: 'Progress Check', subject: 'How\'s your learning going?', body: `Hi ${recipientName},\n\nJust checking in — how are you progressing with your courses?\n\nLet us know if you need any help.\n\nBest regards` },
                    { label: 'Certificate', subject: 'Your certificate is ready!', body: `Hi ${recipientName},\n\nCongratulations on completing your course! Your certificate is ready.\n\nBest regards` },
                    { label: 'Refund', subject: 'Regarding your refund request', body: `Hi ${recipientName},\n\nWe've processed your refund request. The amount will be returned to your original payment method within 5-10 business days.\n\nBest regards` },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => { setSubject(t.subject); setMessage(t.body); }}
                      style={{ padding: '0.3rem 0.75rem', background: 'var(--admin-bg-alt, #162231)', border: '1px solid var(--admin-border, #1e293b)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--admin-text-secondary)', cursor: 'pointer' }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--admin-border, #1e293b)', display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '0.625rem', background: 'none', border: '1px solid var(--admin-border, #1e293b)', borderRadius: 8, color: 'var(--admin-text)', cursor: 'pointer', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !subject || !message}
                style={{
                  flex: 2, padding: '0.625rem',
                  background: (!subject || !message) ? 'var(--admin-text-muted)' : 'var(--admin-primary, #2D60FF)',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: (!subject || !message) ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
                }}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
