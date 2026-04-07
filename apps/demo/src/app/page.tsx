export default function HomePage() {
  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Course Platform Demo</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This is the demo app for the @course reusable platform.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <a href="/admin" style={{ padding: '0.75rem 1.5rem', background: '#2D60FF', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          Admin Dashboard
        </a>
        <a href="/api/course/courses" style={{ padding: '0.75rem 1.5rem', background: '#1B2559', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          API
        </a>
      </div>
    </div>
  );
}
