// Mock data for development without a database connection

export const COURSES = [
  { id: 'c1', slug: 'react-fundamentals', title: 'React Fundamentals', subtitle: 'Master React from scratch', status: 'published', level: 'beginner', thumbnail: null, instructorId: 'u1', categoryId: 'cat1', enrollmentCount: 245, completionRate: 68, revenue: 1224500, rating: 4.7, createdAt: '2026-01-15', publishedAt: '2026-01-20' },
  { id: 'c2', slug: 'nextjs-masterclass', title: 'Next.js Masterclass', subtitle: 'Build production apps', status: 'published', level: 'intermediate', thumbnail: null, instructorId: 'u1', categoryId: 'cat2', enrollmentCount: 182, completionRate: 52, revenue: 910000, rating: 4.8, createdAt: '2026-02-10', publishedAt: '2026-02-15' },
  { id: 'c3', slug: 'typescript-deep-dive', title: 'TypeScript Deep Dive', subtitle: 'Advanced type system', status: 'draft', level: 'advanced', thumbnail: null, instructorId: 'u2', categoryId: 'cat1', enrollmentCount: 0, completionRate: 0, revenue: 0, rating: 0, createdAt: '2026-03-01', publishedAt: null },
  { id: 'c4', slug: 'css-animations', title: 'CSS Animations & Motion', subtitle: 'Beautiful web animations', status: 'published', level: 'intermediate', thumbnail: null, instructorId: 'u2', categoryId: 'cat3', enrollmentCount: 98, completionRate: 74, revenue: 490000, rating: 4.5, createdAt: '2026-03-15', publishedAt: '2026-03-20' },
  { id: 'c5', slug: 'node-api-design', title: 'Node.js API Design', subtitle: 'RESTful APIs with Express', status: 'published', level: 'intermediate', thumbnail: null, instructorId: 'u1', categoryId: 'cat2', enrollmentCount: 156, completionRate: 61, revenue: 780000, rating: 4.6, createdAt: '2026-01-05', publishedAt: '2026-01-10' },
];

export const STUDENTS = [
  { id: 's1', email: 'alice@example.com', firstName: 'Alice', lastName: 'Johnson', enrolledCourses: 3, completedCourses: 1, totalSpent: 14900, joinedAt: '2026-01-20' },
  { id: 's2', email: 'bob@example.com', firstName: 'Bob', lastName: 'Smith', enrolledCourses: 2, completedCourses: 0, totalSpent: 9900, joinedAt: '2026-02-01' },
  { id: 's3', email: 'carol@example.com', firstName: 'Carol', lastName: 'Williams', enrolledCourses: 4, completedCourses: 2, totalSpent: 19800, joinedAt: '2026-01-25' },
  { id: 's4', email: 'dave@example.com', firstName: 'Dave', lastName: 'Brown', enrolledCourses: 1, completedCourses: 0, totalSpent: 4900, joinedAt: '2026-03-10' },
  { id: 's5', email: 'eve@example.com', firstName: 'Eve', lastName: 'Davis', enrolledCourses: 5, completedCourses: 3, totalSpent: 24900, joinedAt: '2026-01-15' },
];

export const ENROLLMENTS = [
  { id: 'e1', courseId: 'c1', studentId: 's1', status: 'active', progress: 65, enrolledAt: '2026-01-22', completedAt: null },
  { id: 'e2', courseId: 'c2', studentId: 's1', status: 'completed', progress: 100, enrolledAt: '2026-02-15', completedAt: '2026-03-10' },
  { id: 'e3', courseId: 'c1', studentId: 's2', status: 'active', progress: 30, enrolledAt: '2026-02-05', completedAt: null },
  { id: 'e4', courseId: 'c4', studentId: 's3', status: 'active', progress: 80, enrolledAt: '2026-03-22', completedAt: null },
  { id: 'e5', courseId: 'c5', studentId: 's5', status: 'completed', progress: 100, enrolledAt: '2026-01-18', completedAt: '2026-02-20' },
];

export const MODULES = [
  { id: 'm1', courseId: 'c1', title: 'Getting Started', position: 0, lessonCount: 5, releaseDate: null },
  { id: 'm2', courseId: 'c1', title: 'Components & Props', position: 1, lessonCount: 8, releaseDate: null },
  { id: 'm3', courseId: 'c1', title: 'State & Effects', position: 2, lessonCount: 6, releaseDate: '2026-02-01' },
  { id: 'm4', courseId: 'c2', title: 'App Router Basics', position: 0, lessonCount: 7, releaseDate: null },
  { id: 'm5', courseId: 'c2', title: 'Server Components', position: 1, lessonCount: 5, releaseDate: null },
];

export const LESSONS = [
  { id: 'l1', moduleId: 'm1', title: 'What is React?', contentType: 'video', position: 0, isFree: true, duration: 720, completions: 230 },
  { id: 'l2', moduleId: 'm1', title: 'Setting Up Your Environment', contentType: 'video', position: 1, isFree: true, duration: 540, completions: 215 },
  { id: 'l3', moduleId: 'm1', title: 'Your First Component', contentType: 'video', position: 2, isFree: false, duration: 900, completions: 198 },
  { id: 'l4', moduleId: 'm2', title: 'Understanding Props', contentType: 'video', position: 0, isFree: false, duration: 660, completions: 175 },
  { id: 'l5', moduleId: 'm2', title: 'Component Patterns', contentType: 'text', position: 1, isFree: false, duration: null, completions: 160 },
];

export const DISCUSSIONS = [
  { id: 'd1', courseId: 'c1', title: 'Help with useEffect cleanup', author: 'Alice Johnson', replies: 5, isPinned: false, createdAt: '2026-03-25' },
  { id: 'd2', courseId: 'c1', title: 'Best practices for state management?', author: 'Bob Smith', replies: 12, isPinned: true, createdAt: '2026-03-20' },
  { id: 'd3', courseId: 'c2', title: 'Server vs Client Components confusion', author: 'Carol Williams', replies: 8, isPinned: false, createdAt: '2026-03-28' },
];

export const COUPONS = [
  { id: 'cp1', code: 'WELCOME20', type: 'percentage', value: 20, usageCount: 45, usageLimit: 100, isActive: true, expiresAt: '2026-06-30' },
  { id: 'cp2', code: 'LAUNCH50', type: 'fixed', value: 5000, usageCount: 12, usageLimit: 50, isActive: true, expiresAt: '2026-04-30' },
  { id: 'cp3', code: 'EXPIRED10', type: 'percentage', value: 10, usageCount: 30, usageLimit: 30, isActive: false, expiresAt: '2026-03-01' },
];

export const REVENUE = {
  totalRevenue: 3404500,
  totalEnrollments: 681,
  avgCoursePrice: 4900,
  completionRate: 63,
  monthlyRevenue: [
    { month: 'Jan', revenue: 480000, enrollments: 98 },
    { month: 'Feb', revenue: 620000, enrollments: 126 },
    { month: 'Mar', revenue: 890000, enrollments: 182 },
    { month: 'Apr', revenue: 750000, enrollments: 153 },
  ],
};
