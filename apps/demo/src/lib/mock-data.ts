// Shared mock data shaped for @course/react components
// Used by student-facing demo pages — no API needed

export const MOCK_COURSES = [
  { id: 'c1', title: 'React Fundamentals', slug: 'react-fundamentals', description: 'Master React from scratch. Learn components, props, state, hooks, and build real-world applications.', thumbnailUrl: null, instructorName: 'Sarah Chen', price: 4900, currency: 'USD' },
  { id: 'c2', title: 'Next.js Masterclass', slug: 'nextjs-masterclass', description: 'Build production-ready apps with Next.js. App Router, Server Components, API Routes, and deployment.', thumbnailUrl: null, instructorName: 'Sarah Chen', price: 4900, currency: 'USD' },
  { id: 'c4', title: 'CSS Animations & Motion', slug: 'css-animations', description: 'Beautiful web animations. Transitions, keyframes, Framer Motion, and performance optimization.', thumbnailUrl: null, instructorName: 'James Lee', price: 4900, currency: 'USD' },
  { id: 'c5', title: 'Node.js API Design', slug: 'node-api-design', description: 'RESTful APIs with Express. Authentication, validation, testing, and production-grade patterns.', thumbnailUrl: null, instructorName: 'Sarah Chen', price: 4900, currency: 'USD' },
];

export const MOCK_MODULES: Record<string, { id: string; title: string; position: number; lessons: { id: string; title: string; position: number; contentType: string; durationMinutes: number | null }[] }[]> = {
  'react-fundamentals': [
    { id: 'm1', title: 'Getting Started', position: 0, lessons: [
      { id: 'l1', title: 'What is React?', position: 0, contentType: 'video', durationMinutes: 12 },
      { id: 'l2', title: 'Setting Up Your Environment', position: 1, contentType: 'video', durationMinutes: 9 },
      { id: 'l3', title: 'Your First Component', position: 2, contentType: 'video', durationMinutes: 15 },
    ]},
    { id: 'm2', title: 'Components & Props', position: 1, lessons: [
      { id: 'l4', title: 'Understanding Props', position: 0, contentType: 'video', durationMinutes: 11 },
      { id: 'l5', title: 'Component Patterns', position: 1, contentType: 'text', durationMinutes: null },
      { id: 'l6', title: 'Composition vs Inheritance', position: 2, contentType: 'video', durationMinutes: 14 },
    ]},
    { id: 'm3', title: 'State & Effects', position: 2, lessons: [
      { id: 'l7', title: 'useState Deep Dive', position: 0, contentType: 'video', durationMinutes: 18 },
      { id: 'l8', title: 'useEffect Patterns', position: 1, contentType: 'text', durationMinutes: null },
      { id: 'l9', title: 'Building a Todo App', position: 2, contentType: 'video', durationMinutes: 25 },
    ]},
  ],
  'nextjs-masterclass': [
    { id: 'm4', title: 'App Router Basics', position: 0, lessons: [
      { id: 'l10', title: 'File-based Routing', position: 0, contentType: 'video', durationMinutes: 10 },
      { id: 'l11', title: 'Layouts and Templates', position: 1, contentType: 'video', durationMinutes: 13 },
      { id: 'l12', title: 'Loading and Error States', position: 2, contentType: 'text', durationMinutes: null },
    ]},
    { id: 'm5', title: 'Server Components', position: 1, lessons: [
      { id: 'l13', title: 'Server vs Client', position: 0, contentType: 'video', durationMinutes: 16 },
      { id: 'l14', title: 'Data Fetching', position: 1, contentType: 'video', durationMinutes: 20 },
      { id: 'l15', title: 'Caching Strategies', position: 2, contentType: 'text', durationMinutes: null },
    ]},
  ],
  'css-animations': [
    { id: 'm6', title: 'CSS Transitions', position: 0, lessons: [
      { id: 'l16', title: 'Transition Properties', position: 0, contentType: 'video', durationMinutes: 10 },
      { id: 'l17', title: 'Timing Functions', position: 1, contentType: 'text', durationMinutes: null },
      { id: 'l18', title: 'Hover & Focus Effects', position: 2, contentType: 'video', durationMinutes: 12 },
    ]},
    { id: 'm7', title: 'Keyframe Animations', position: 1, lessons: [
      { id: 'l19', title: '@keyframes Syntax', position: 0, contentType: 'video', durationMinutes: 14 },
      { id: 'l20', title: 'Animation Properties', position: 1, contentType: 'text', durationMinutes: null },
      { id: 'l21', title: 'Loading Spinners Project', position: 2, contentType: 'video', durationMinutes: 20 },
    ]},
  ],
  'node-api-design': [
    { id: 'm8', title: 'Express Fundamentals', position: 0, lessons: [
      { id: 'l22', title: 'Setting Up Express', position: 0, contentType: 'video', durationMinutes: 8 },
      { id: 'l23', title: 'Routing & Middleware', position: 1, contentType: 'text', durationMinutes: null },
      { id: 'l24', title: 'Error Handling', position: 2, contentType: 'video', durationMinutes: 15 },
    ]},
    { id: 'm9', title: 'Authentication', position: 1, lessons: [
      { id: 'l25', title: 'JWT Basics', position: 0, contentType: 'video', durationMinutes: 16 },
      { id: 'l26', title: 'Passport.js Integration', position: 1, contentType: 'video', durationMinutes: 22 },
      { id: 'l27', title: 'Role-Based Access', position: 2, contentType: 'text', durationMinutes: null },
    ]},
  ],
};

export const MOCK_LESSON_CONTENT: Record<string, { contentType: 'video' | 'text'; contentUrl?: string; contentText?: string }> = {
  l1: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l2: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l3: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l4: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l5: { contentType: 'text', contentText: '<h2>Component Patterns</h2><p>React components can be composed in many ways. The most common patterns are:</p><ul><li><strong>Container/Presentational</strong> — separate logic from rendering</li><li><strong>Compound Components</strong> — components that work together (like Select + Option)</li><li><strong>Render Props</strong> — share behavior via a function prop</li><li><strong>Custom Hooks</strong> — extract reusable stateful logic</li></ul><p>In modern React, custom hooks have largely replaced render props and HOCs. They provide the cleanest way to share logic between components.</p><h3>Example: Custom Hook</h3><pre><code>function useWindowSize() {\n  const [size, setSize] = useState({ width: 0, height: 0 });\n  useEffect(() => {\n    const handler = () => setSize({\n      width: window.innerWidth,\n      height: window.innerHeight\n    });\n    window.addEventListener("resize", handler);\n    handler();\n    return () => window.removeEventListener("resize", handler);\n  }, []);\n  return size;\n}</code></pre>' },
  l6: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l7: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l8: { contentType: 'text', contentText: '<h2>useEffect Patterns</h2><p>The useEffect hook lets you synchronize your component with external systems. Here are the key patterns:</p><h3>1. Run on mount only</h3><pre><code>useEffect(() => {\n  // runs once after first render\n  fetchData();\n}, []);</code></pre><h3>2. Run when dependencies change</h3><pre><code>useEffect(() => {\n  // runs when userId changes\n  loadUser(userId);\n}, [userId]);</code></pre><h3>3. Cleanup</h3><pre><code>useEffect(() => {\n  const ws = new WebSocket(url);\n  return () => ws.close(); // cleanup\n}, [url]);</code></pre><p><strong>Golden rule:</strong> Effects are for synchronization, not for reacting to events. If you need to respond to a user action, use an event handler instead.</p>' },
  l9: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l10: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l11: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l12: { contentType: 'text', contentText: '<h2>Loading & Error States</h2><p>Next.js App Router has built-in support for loading and error UI through special files:</p><ul><li><code>loading.tsx</code> — shows while the page is loading (uses React Suspense)</li><li><code>error.tsx</code> — catches errors in the page and shows a fallback</li><li><code>not-found.tsx</code> — shown when notFound() is called</li></ul><p>These files automatically wrap your page in the appropriate React boundaries, giving you instant loading states without any extra code.</p>' },
  l13: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l14: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l15: { contentType: 'text', contentText: '<h2>Caching Strategies</h2><p>Next.js provides multiple layers of caching:</p><ol><li><strong>Request Memoization</strong> — deduplicates identical fetch calls in a single render</li><li><strong>Data Cache</strong> — persists fetch results across requests</li><li><strong>Full Route Cache</strong> — caches the rendered HTML of static routes</li><li><strong>Router Cache</strong> — client-side cache of visited routes</li></ol><p>Understanding when to use <code>cache: "force-cache"</code> vs <code>cache: "no-store"</code> vs revalidation is key to building performant Next.js applications.</p>' },
  l16: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l17: { contentType: 'text', contentText: '<h2>Timing Functions</h2><p>CSS timing functions control the speed curve of transitions:</p><ul><li><code>ease</code> — slow start, fast middle, slow end (default)</li><li><code>linear</code> — constant speed</li><li><code>ease-in</code> — slow start</li><li><code>ease-out</code> — slow end</li><li><code>cubic-bezier(n,n,n,n)</code> — custom curve</li></ul><p>Use <code>cubic-bezier(0.4, 0, 0.2, 1)</code> for Material Design-style easing.</p>' },
  l18: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l19: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l20: { contentType: 'text', contentText: '<h2>Animation Properties</h2><p>Key animation properties:</p><ul><li><code>animation-name</code> — which @keyframes to use</li><li><code>animation-duration</code> — how long one cycle takes</li><li><code>animation-iteration-count</code> — how many times (or <code>infinite</code>)</li><li><code>animation-direction</code> — normal, reverse, alternate</li><li><code>animation-fill-mode</code> — what styles apply before/after</li></ul>' },
  l21: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l22: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l23: { contentType: 'text', contentText: '<h2>Routing & Middleware</h2><p>Express routing maps HTTP methods and URLs to handler functions:</p><pre><code>app.get("/users", listUsers);\napp.post("/users", createUser);\napp.get("/users/:id", getUser);</code></pre><p>Middleware functions run before your route handler. Use them for logging, auth, body parsing, and error handling.</p>' },
  l24: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l25: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l26: { contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
  l27: { contentType: 'text', contentText: '<h2>Role-Based Access Control</h2><p>RBAC restricts system access based on user roles:</p><ol><li>Define roles (admin, editor, viewer)</li><li>Assign permissions to each role</li><li>Check permissions in middleware</li></ol><pre><code>function requireRole(role) {\n  return (req, res, next) => {\n    if (req.user.role !== role) {\n      return res.status(403).json({ error: "Forbidden" });\n    }\n    next();\n  };\n}</code></pre>' },
};

export const MOCK_ENROLLED_COURSES = [
  { id: 'e1', courseId: 'c1', courseTitle: 'React Fundamentals', courseSlug: 'react-fundamentals', courseThumbnail: null, status: 'active', percentComplete: 65, enrolledAt: '2026-01-22', lastAccessedAt: '2026-04-05' },
  { id: 'e2', courseId: 'c2', courseTitle: 'Next.js Masterclass', courseSlug: 'nextjs-masterclass', courseThumbnail: null, status: 'completed', percentComplete: 100, enrolledAt: '2026-02-15', lastAccessedAt: '2026-03-10' },
  { id: 'e4', courseId: 'c4', courseTitle: 'CSS Animations & Motion', courseSlug: 'css-animations', courseThumbnail: null, status: 'active', percentComplete: 35, enrolledAt: '2026-03-22', lastAccessedAt: '2026-04-01' },
];

export const MOCK_QUIZ = {
  id: 'q1',
  title: 'React Fundamentals Quiz',
  description: 'Test your knowledge of React basics.',
  passingScore: 70,
  timeLimitMinutes: null,
  questions: [
    { id: 'qq1', questionText: 'What is JSX?', questionType: 'multiple_choice' as const, options: ['A JavaScript compiler', 'A syntax extension for JavaScript', 'A CSS framework', 'A database query language'], position: 0 },
    { id: 'qq2', questionText: 'React components must return a single root element.', questionType: 'true_false' as const, options: null, position: 1 },
    { id: 'qq3', questionText: 'What hook is used to manage state in functional components?', questionType: 'fill_blank' as const, options: null, position: 2 },
    { id: 'qq4', questionText: 'Explain the difference between props and state in React.', questionType: 'essay' as const, options: null, position: 3 },
  ],
};

export const MOCK_CERTIFICATE = {
  id: 'cert1',
  uniqueCode: 'NXJS-A8F2-K9D1',
  issuedAt: '2026-03-10',
  courseName: 'Next.js Masterclass',
  studentName: 'Alice Johnson',
};
