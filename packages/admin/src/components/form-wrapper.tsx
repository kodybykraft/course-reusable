'use client';

import { useState, useCallback, type ReactNode } from 'react';

export interface FormWrapperProps {
  onSubmit: (formData: FormData) => void;
  loading?: boolean;
  children: ReactNode;
  submitLabel?: string;
}

export function FormWrapper({
  onSubmit,
  loading = false,
  children,
  submitLabel = 'Save',
}: FormWrapperProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      try {
        const formData = new FormData(e.currentTarget);
        onSubmit(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
    [onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      {children}
      {error && (
        <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
      )}
      <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
            Saving...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
