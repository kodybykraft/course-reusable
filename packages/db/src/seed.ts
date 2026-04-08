import { createDb } from './client.js';
import { users, courses, courseModules, courseLessons, courseLessonContent, courseCategories, courseProducts } from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://syednizam@localhost:5432/courses';

async function seed() {
  const db = createDb(DATABASE_URL);
  console.log('Seeding database...');

  // Hash for "admin123" using PBKDF2 600k iterations
  // For dev only — in production use AuthService.register()
  const { subtle } = globalThis.crypto;
  const encoder = new TextEncoder();
  const salt = crypto.randomUUID();
  const keyMaterial = await subtle.importKey('raw', encoder.encode('admin123'), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 600000, hash: 'SHA-256' }, keyMaterial, 256);
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  const passwordHash = `${salt}:${hash}`;

  // Admin user
  const [admin] = await db.insert(users).values({
    email: 'admin@demo.com',
    passwordHash,
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
  }).onConflictDoNothing().returning();

  if (admin) {
    console.log('  ✓ Admin user: admin@demo.com / admin123');
  } else {
    console.log('  ○ Admin user already exists');
  }

  // Category
  const [cat] = await db.insert(courseCategories).values({
    slug: 'development',
    name: 'Development',
    description: 'Software development courses',
  }).onConflictDoNothing().returning();

  // Courses
  const coursesData = [
    { slug: 'nextjs-fundamentals', title: 'Next.js Fundamentals', subtitle: 'Build modern web apps', description: 'Learn Next.js from scratch — routing, server components, data fetching, and deployment.', status: 'published', level: 'beginner', estimatedDuration: 480, publishedAt: new Date() },
    { slug: 'react-hooks-mastery', title: 'React Hooks Mastery', subtitle: 'Advanced hook patterns', description: 'Deep dive into React hooks — custom hooks, performance, context, reducers, and real-world patterns.', status: 'published', level: 'intermediate', estimatedDuration: 360, publishedAt: new Date() },
    { slug: 'typescript-pro', title: 'TypeScript Pro', subtitle: 'Type-safe everything', description: 'Advanced TypeScript — generics, conditional types, mapped types, and patterns for large codebases.', status: 'draft', level: 'advanced', estimatedDuration: 300 },
  ];

  for (const courseData of coursesData) {
    const existing = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseData.slug) });
    if (existing) { console.log(`  ○ Course "${courseData.title}" already exists`); continue; }

    const [course] = await db.insert(courses).values({
      ...courseData,
      categoryId: cat?.id,
      instructorId: admin?.id,
    } as any).returning();

    // Product (pricing)
    await db.insert(courseProducts).values({
      courseId: course.id,
      type: courseData.slug === 'nextjs-fundamentals' ? 'free' : 'one_time',
      price: courseData.slug === 'nextjs-fundamentals' ? 0 : 4999,
      currency: 'USD',
    });

    // Modules + lessons
    const moduleNames = ['Getting Started', 'Core Concepts', 'Advanced Topics'];
    for (let m = 0; m < moduleNames.length; m++) {
      const [mod] = await db.insert(courseModules).values({
        courseId: course.id,
        title: moduleNames[m],
        position: m,
      }).returning();

      const lessonNames = [`Introduction to ${moduleNames[m]}`, `${moduleNames[m]} Deep Dive`, `${moduleNames[m]} Practice`];
      for (let l = 0; l < lessonNames.length; l++) {
        const [lesson] = await db.insert(courseLessons).values({
          moduleId: mod.id,
          title: lessonNames[l],
          description: `Learn about ${lessonNames[l].toLowerCase()}.`,
          contentType: l === 0 ? 'video' : l === 1 ? 'text' : 'video',
          position: l,
          durationMinutes: 10 + l * 5,
        }).returning();

        await db.insert(courseLessonContent).values({
          lessonId: lesson.id,
          type: l === 1 ? 'text' : 'video',
          url: l !== 1 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
          content: l === 1 ? `<h2>${lessonNames[l]}</h2><p>This is the lesson content. In a real course, this would be detailed text covering the topic.</p>` : null,
        });
      }
    }

    console.log(`  ✓ Course "${courseData.title}" with 3 modules, 9 lessons`);
  }

  console.log('\nDone! Login at http://localhost:3000/auth/login');
  console.log('  Email: admin@demo.com');
  console.log('  Password: admin123');
  process.exit(0);
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
