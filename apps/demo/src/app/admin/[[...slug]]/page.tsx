import { PageHeader } from './_pages/_shared';
import { PageWrapper } from './_pages/page-wrapper';

// Client components — will be created by agents
// These are lazy-loaded so the page still renders if some aren't created yet
let DashboardClient: any = () => <div>Loading dashboard...</div>;
let CoursesListClient: any = () => <div>Loading courses...</div>;
let CourseFormClient: any = () => <div>Loading course form...</div>;
let StudentsListClient: any = () => <div>Loading students...</div>;
let StudentDetailClient: any = () => <div>Loading student detail...</div>;
let EnrollmentsListClient: any = () => <div>Loading enrollments...</div>;
let QuizBuilderClient: any = () => <div>Loading quiz builder...</div>;
let AssignmentsListClient: any = () => <div>Loading assignments...</div>;
let GradingClient: any = () => <div>Loading grading...</div>;
let DiscussionsListClient: any = () => <div>Loading discussions...</div>;
let CouponsListClient: any = () => <div>Loading coupons...</div>;
let CouponFormClient: any = () => <div>Loading coupon form...</div>;
let RevenueClient: any = () => <div>Loading revenue...</div>;
let SettingsGeneralClient: any = () => <div>Loading settings...</div>;
let SettingsPaymentsClient: any = () => <div>Loading settings...</div>;
let SettingsBrandingClient: any = () => <div>Loading settings...</div>;

// Try to import client components — gracefully handle if not yet created
try { ({ DashboardClient } = require('./_pages/dashboard-client')); } catch {}
try { ({ CoursesListClient, CourseFormClient } = require('./_pages/courses-client')); } catch {}
try { ({ StudentsListClient, StudentDetailClient } = require('./_pages/students-client')); } catch {}
try { ({ EnrollmentsListClient } = require('./_pages/enrollments-client')); } catch {}
try { ({ QuizBuilderClient } = require('./_pages/quizzes-client')); } catch {}
try { ({ AssignmentsListClient, GradingClient } = require('./_pages/assignments-client')); } catch {}
try { ({ DiscussionsListClient } = require('./_pages/discussions-client')); } catch {}
try { ({ CouponsListClient, CouponFormClient } = require('./_pages/coupons-client')); } catch {}
try { ({ RevenueClient } = require('./_pages/revenue-client')); } catch {}
try { ({ SettingsGeneralClient, SettingsPaymentsClient, SettingsBrandingClient } = require('./_pages/settings-client')); } catch {}

let CertificatesPage: any = () => <PageHeader title="Certificates" />;
let StaffPage: any = () => <PageHeader title="Staff" />;
let WebhooksPage: any = () => <PageHeader title="Webhooks" />;
let ActivityLogPage: any = () => <PageHeader title="Activity Log" />;
try { ({ CertificatesPage } = require('./_pages/certificates-client')); } catch {}
try { ({ StaffPage } = require('./_pages/staff-client')); } catch {}
try { ({ WebhooksPage } = require('./_pages/webhooks-client')); } catch {}
try { ({ ActivityLogPage } = require('./_pages/activity-log-client')); } catch {}

export const dynamic = 'force-dynamic';

/* ==========================================================================
   SVG ICONS
   ========================================================================== */

const s = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const I = {
  home:        <svg {...s} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  courses:     <svg {...s} viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  students:    <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  enrollments: <svg {...s} viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
  quizzes:     <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  assignments: <svg {...s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  discussions: <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  revenue:     <svg {...s} viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  coupons:     <svg {...s} viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  certificates:<svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  settings:    <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  webhooks:    <svg {...s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  staff:       <svg {...s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  activity:    <svg {...s} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};

type IconKey = keyof typeof I;

/* ==========================================================================
   SIDEBAR
   ========================================================================== */

const NAV: Array<{ section: string | null; items: Array<{ label: string; path: string; icon: IconKey }> }> = [
  { section: null, items: [{ label: 'Home', path: '/admin', icon: 'home' }] },
  { section: null, items: [
    { label: 'Courses', path: '/admin/courses', icon: 'courses' },
    { label: 'Students', path: '/admin/students', icon: 'students' },
    { label: 'Enrollments', path: '/admin/enrollments', icon: 'enrollments' },
  ]},
  { section: null, items: [
    { label: 'Quizzes', path: '/admin/quizzes', icon: 'quizzes' },
    { label: 'Assignments', path: '/admin/assignments', icon: 'assignments' },
    { label: 'Certificates', path: '/admin/certificates', icon: 'certificates' },
  ]},
  { section: null, items: [
    { label: 'Discussions', path: '/admin/discussions', icon: 'discussions' },
    { label: 'Revenue', path: '/admin/revenue', icon: 'revenue' },
    { label: 'Coupons', path: '/admin/coupons', icon: 'coupons' },
  ]},
  { section: null, items: [
    { label: 'Webhooks', path: '/admin/webhooks', icon: 'webhooks' },
    { label: 'Staff', path: '/admin/staff', icon: 'staff' },
    { label: 'Activity Log', path: '/admin/activity-log', icon: 'activity' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ]},
];

function Topbar() {
  return (
    <div className="admin-topbar">
      <div className="admin-topbar-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28 }}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        Course Admin
      </div>
      <input className="admin-topbar-search" placeholder="Search courses, students..." />
      <div className="admin-topbar-right">
        <div className="admin-topbar-avatar">CA</div>
      </div>
    </div>
  );
}

function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="admin-sidebar">
      {NAV.map((group, gi) => (
        <div key={gi}>
          {group.items.map((item) => {
            const active = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
            return (
              <a key={item.path} href={item.path} className={`admin-sidebar-link${active ? ' admin-sidebar-link--active' : ''}`}>
                {I[item.icon]}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

/* ==========================================================================
   PAGE ROUTER
   ========================================================================== */

export default async function AdminCatchAll({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const path = slug ? `/admin/${slug.join('/')}` : '/admin';

  return (
    <>
      <Sidebar currentPath={path} />
      <Topbar />
      <main className="admin-main"><PageWrapper>{renderPage(slug)}</PageWrapper></main>
    </>
  );
}

function renderPage(slug?: string[]) {
  const page = slug?.[0];
  const sub = slug?.[1];

  switch (page) {
    case undefined: return <DashboardClient />;

    case 'courses':
      if (sub === 'new') return <CourseFormClient course={null} />;
      if (sub) return <CourseFormClient course={{ id: sub }} />;
      return <CoursesListClient />;

    case 'students':
      if (sub) return <StudentDetailClient studentId={sub} />;
      return <StudentsListClient />;

    case 'enrollments': return <EnrollmentsListClient />;

    case 'quizzes':
      if (sub) return <QuizBuilderClient quizId={sub} />;
      return <PageHeader title="Quizzes" />;

    case 'assignments':
      if (sub === 'grade' && slug?.[2]) return <GradingClient submissionId={slug[2]} />;
      return <AssignmentsListClient />;

    case 'certificates':
      return <CertificatesPage />;

    case 'discussions':
      if (sub) return <DiscussionsListClient />;
      return <DiscussionsListClient />;

    case 'revenue': return <RevenueClient />;

    case 'coupons':
      if (sub === 'new') return <CouponFormClient />;
      if (sub) return <CouponFormClient couponId={sub} />;
      return <CouponsListClient />;

    case 'webhooks': return <WebhooksPage />;
    case 'staff': return <StaffPage />;
    case 'activity-log': return <ActivityLogPage />;

    case 'settings': return <SettingsLayout sub={sub} />;

    default: return <NotFound />;
  }
}

function NotFound() {
  return <div className="admin-empty"><div className="admin-empty-title">Page not found</div><a href="/admin" className="admin-btn admin-btn--primary">Go to Dashboard</a></div>;
}

function SettingsLayout({ sub }: { sub?: string }) {
  const settingsNav = [
    { label: 'General', key: undefined },
    { label: 'Payments', key: 'payments' },
    { label: 'Branding', key: 'branding' },
  ];

  function content() {
    switch (sub) {
      case 'payments': return <SettingsPaymentsClient />;
      case 'branding': return <SettingsBrandingClient />;
      default: return <SettingsGeneralClient />;
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="admin-settings-layout">
        <nav className="admin-settings-nav">
          {settingsNav.map(s => (
            <a key={s.label} href={s.key ? `/admin/settings/${s.key}` : '/admin/settings'} className={`admin-settings-nav-link${(sub ?? undefined) === s.key ? ' admin-settings-nav-link--active' : ''}`}>{s.label}</a>
          ))}
        </nav>
        <div className="admin-settings-content">{content()}</div>
      </div>
    </div>
  );
}
