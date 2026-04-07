'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader, Card, Badge, FormGroup, Pagination, formatMoney } from './_shared';
import { COURSES, MODULES, LESSONS } from './_data';

/* ==========================================================================
   Types
   ========================================================================== */

type Course = typeof COURSES[0];

interface ModuleInput {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

/* ==========================================================================
   Skeleton
   ========================================================================== */

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <table className="admin-table">
      <thead>
        <tr><th>Title</th><th>Status</th><th>Level</th><th>Enrollments</th><th>Revenue</th><th>Rating</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: 7 }).map((_, c) => (
              <td key={c}>
                <div style={{ width: `${50 + Math.random() * 40}%`, height: 14, background: 'var(--admin-border-light)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ==========================================================================
   CoursesListClient
   ========================================================================== */

const TABS = ['All', 'Published', 'Draft'] as const;
const TAB_STATUS: Record<string, string | undefined> = { All: undefined, Published: 'published', Draft: 'draft' };
const PAGE_SIZE = 10;

export function CoursesListClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchCourses = useCallback(async (status: string | undefined, query: string, pg: number) => {
    setLoading(true);
    try {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('token='));
      const token = cookie?.split('=')[1] ?? '';
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (query) params.set('search', query);
      params.set('page', String(pg));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/course/admin/courses?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCourses(data.courses ?? data.data ?? data);
      setTotal(data.total ?? (data.courses ?? data.data ?? data).length);
    } catch {
      let filtered = [...COURSES];
      if (status) filtered = filtered.filter(c => c.status === status);
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
      }
      setTotal(filtered.length);
      setCourses(filtered.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(TAB_STATUS[TABS[activeTab]], search, page);
  }, [activeTab, search, page, fetchCourses]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 300);
  };

  const handleTabChange = (idx: number) => { setActiveTab(idx); setPage(1); };

  const handleTogglePublish = async (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('token='));
      const token = cookie?.split('=')[1] ?? '';
      await fetch(`/api/course/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch { /* demo mode */ }
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Courses"
        actions={<a href="/admin/courses/new" className="admin-btn admin-btn--primary">Create Course</a>}
      />
      <div className="admin-card">
        <div className="admin-tabs">
          {TABS.map((label, i) => (
            <button key={label} type="button" className={`admin-tab${i === activeTab ? ' admin-tab--active' : ''}`} onClick={() => handleTabChange(i)}>
              {label}
            </button>
          ))}
        </div>

        <div className="admin-toolbar">
          <input className="admin-search" placeholder="Search courses..." onChange={handleSearchChange} defaultValue="" />
          <button type="button" className="admin-filter-btn">Filter</button>
          <button type="button" className="admin-filter-btn">Sort</button>
        </div>

        {loading ? <TableSkeleton /> : courses.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-muted)' }}>No courses found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th><th>Status</th><th>Level</th>
                <th style={{ textAlign: 'right' }}>Enrollments</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
                <th style={{ textAlign: 'right' }}>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td><a href={`/admin/courses/${c.id}`} style={{ fontWeight: 500, color: 'var(--admin-text)' }}>{c.title}</a></td>
                  <td><Badge status={c.status} /></td>
                  <td style={{ color: 'var(--admin-text-secondary)', textTransform: 'capitalize' }}>{c.level}</td>
                  <td style={{ textAlign: 'right' }}>{c.enrollmentCount}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(c.revenue)}</td>
                  <td style={{ textAlign: 'right' }}>{c.rating > 0 ? c.rating.toFixed(1) : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`/admin/courses/${c.id}`} className="admin-btn admin-btn--plain" style={{ fontSize: 12, padding: '4px 8px' }}>Edit</a>
                      <button type="button" className="admin-btn admin-btn--plain" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => handleTogglePublish(c)}>
                        {c.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="admin-pagination">
          <span>Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="admin-pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button type="button" className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   CourseFormClient
   ========================================================================== */

interface CourseFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
}

let moduleIdCounter = 0;
function nextModuleId() { return `mod_${++moduleIdCounter}_${Date.now()}`; }
function nextLessonId() { return `les_${++moduleIdCounter}_${Date.now()}`; }

export function CourseFormClient({ course }: { course: Course | null }) {
  const isNew = !course;

  const [form, setForm] = useState<CourseFormData>({
    title: course?.title ?? '',
    slug: course?.slug ?? '',
    subtitle: course?.subtitle ?? '',
    description: '',
    category: course?.categoryId ?? '',
    level: course?.level ?? 'beginner',
    thumbnail: course?.thumbnail ?? '',
  });

  const [modules, setModules] = useState<ModuleInput[]>(() => {
    if (!course) return [];
    return MODULES.filter(m => m.courseId === course.id).map(m => ({
      id: m.id,
      title: m.title,
      lessons: LESSONS.filter(l => l.moduleId === m.id).map(l => ({ id: l.id, title: l.title })),
    }));
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleChange = (field: keyof CourseFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const addModule = () => {
    setModules(prev => [...prev, { id: nextModuleId(), title: '', lessons: [] }]);
  };

  const updateModuleTitle = (idx: number, title: string) => {
    setModules(prev => prev.map((m, i) => i === idx ? { ...m, title } : m));
  };

  const removeModule = (idx: number) => {
    setModules(prev => prev.filter((_, i) => i !== idx));
  };

  const addLesson = (moduleIdx: number) => {
    setModules(prev => prev.map((m, i) =>
      i === moduleIdx ? { ...m, lessons: [...m.lessons, { id: nextLessonId(), title: '' }] } : m,
    ));
  };

  const updateLessonTitle = (moduleIdx: number, lessonIdx: number, title: string) => {
    setModules(prev => prev.map((m, mi) =>
      mi === moduleIdx ? { ...m, lessons: m.lessons.map((l, li) => li === lessonIdx ? { ...l, title } : l) } : m,
    ));
  };

  const removeLesson = (moduleIdx: number, lessonIdx: number) => {
    setModules(prev => prev.map((m, mi) =>
      mi === moduleIdx ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIdx) } : m,
    ));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setToast('Title is required'); return; }
    setSaving(true);
    try {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('token='));
      const token = cookie?.split('=')[1] ?? '';
      const url = isNew ? '/api/course/admin/courses' : `/api/course/admin/courses/${course!.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...form, modules }),
      });
      if (!res.ok) throw new Error();
      setToast(isNew ? 'Course created' : 'Course saved');
      if (isNew) setTimeout(() => { window.location.href = '/admin/courses'; }, 1200);
    } catch {
      setToast(isNew ? 'Course created (demo mode)' : 'Course saved (demo mode)');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div>
      <PageHeader
        title={isNew ? 'Create Course' : form.title || course!.title}
        breadcrumbs={[{ label: 'Courses', href: '/admin/courses' }, { label: isNew ? 'New' : course!.title }]}
        actions={
          <button type="button" className="admin-btn admin-btn--primary" disabled={saving} onClick={handleSubmit} style={{ minWidth: 80 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        }
      />

      <Card title="Course Details">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Title">
            <input className="admin-input" value={form.title} onChange={handleChange('title')} placeholder="Course title" />
          </FormGroup>
          <FormGroup label="Slug">
            <input className="admin-input" value={form.slug} onChange={handleChange('slug')} placeholder="course-slug" />
          </FormGroup>
        </div>
        <FormGroup label="Subtitle">
          <input className="admin-input" value={form.subtitle} onChange={handleChange('subtitle')} placeholder="Short description" />
        </FormGroup>
        <FormGroup label="Description">
          <textarea className="admin-input" rows={4} value={form.description} onChange={handleChange('description')} style={{ resize: 'vertical' }} />
        </FormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormGroup label="Category">
            <select className="admin-input" value={form.category} onChange={handleChange('category')}>
              <option value="">Select category</option>
              <option value="cat1">Web Development</option>
              <option value="cat2">Backend</option>
              <option value="cat3">Design</option>
            </select>
          </FormGroup>
          <FormGroup label="Level">
            <select className="admin-input" value={form.level} onChange={handleChange('level')}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </FormGroup>
          <FormGroup label="Thumbnail URL">
            <input className="admin-input" value={form.thumbnail} onChange={handleChange('thumbnail')} placeholder="https://..." />
          </FormGroup>
        </div>
      </Card>

      <Card
        title="Modules"
        actions={<button type="button" className="admin-btn admin-btn--plain" onClick={addModule}>+ Add Module</button>}
      >
        {modules.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            No modules yet. Click "Add Module" to start building your curriculum.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {modules.map((mod, mi) => (
              <div key={mod.id} style={{ border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius, 8px)', padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', fontWeight: 600 }}>Module {mi + 1}</span>
                  <input className="admin-input" style={{ flex: 1 }} value={mod.title} onChange={e => updateModuleTitle(mi, e.target.value)} placeholder="Module title" />
                  <button type="button" className="admin-btn admin-btn--plain" style={{ fontSize: 12, color: 'var(--admin-critical, #e74c3c)' }} onClick={() => removeModule(mi)}>Remove</button>
                </div>
                {mod.lessons.map((lesson, li) => (
                  <div key={lesson.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, paddingLeft: 24 }}>
                    <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', minWidth: 16 }}>{li + 1}.</span>
                    <input className="admin-input" style={{ flex: 1 }} value={lesson.title} onChange={e => updateLessonTitle(mi, li, e.target.value)} placeholder="Lesson title" />
                    <button type="button" className="admin-btn admin-btn--plain" style={{ fontSize: 11, color: 'var(--admin-critical, #e74c3c)' }} onClick={() => removeLesson(mi, li)}>x</button>
                  </div>
                ))}
                <button type="button" className="admin-btn admin-btn--plain" style={{ fontSize: 12, marginLeft: 24, marginTop: 4 }} onClick={() => addLesson(mi)}>+ Add Lesson</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8,
          background: toast.includes('required') ? '#e74c3c' : '#2ecc71',
          color: '#fff', fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
