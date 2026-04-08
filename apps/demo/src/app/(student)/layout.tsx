import Link from 'next/link';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="student-nav">
        <div className="student-nav-inner">
          <Link href="/" className="student-nav-brand">Course Platform</Link>
          <div className="student-nav-links">
            <Link href="/courses">Courses</Link>
            <Link href="/dashboard">My Dashboard</Link>
          </div>
        </div>
      </nav>
      <main className="student-main">{children}</main>
    </>
  );
}
