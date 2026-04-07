import { eq, desc, and, like, sql } from 'drizzle-orm';
import { courses, courseCategories } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError, slugify, uniqueSlug, escapeLike } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class CourseService {
  constructor(private db: Database) {}

  async list(filter?: { status?: string; search?: string; categoryId?: string }, pagination?: { page?: number; pageSize?: number }) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (filter?.status) conditions.push(eq(courses.status, filter.status));
    if (filter?.search) conditions.push(like(courses.title, `%${escapeLike(filter.search)}%`));
    if (filter?.categoryId) conditions.push(eq(courses.categoryId, filter.categoryId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db.query.courses.findMany({
        where,
        with: { category: true, instructor: true },
        limit: pageSize,
        offset,
        orderBy: desc(courses.createdAt),
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courses).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: { category: true, instructor: true },
    });
    if (!course) throw new NotFoundError('Course', id);
    return course;
  }

  async getBySlug(slug: string) {
    const course = await this.db.query.courses.findFirst({
      where: eq(courses.slug, slug),
      with: { category: true, instructor: true },
    });
    if (!course) throw new NotFoundError('Course', slug);
    return course;
  }

  async create(input: {
    title: string;
    description?: string;
    slug?: string;
    categoryId?: string;
    instructorId?: string;
    level?: string;
    thumbnail?: string;
    subtitle?: string;
  }) {
    const slug = input.slug ? slugify(input.slug) : uniqueSlug(input.title);

    const [course] = await this.db.insert(courses).values({
      title: input.title,
      slug,
      description: input.description ?? null,
      subtitle: input.subtitle ?? null,
      categoryId: input.categoryId ?? null,
      instructorId: input.instructorId ?? null,
      level: input.level ?? 'beginner',
      thumbnail: input.thumbnail ?? null,
    }).returning();

    await eventBus.emit('course.created', { courseId: course.id });
    return course;
  }

  async update(id: string, input: Partial<{
    title: string;
    description: string;
    subtitle: string;
    categoryId: string;
    level: string;
    thumbnail: string;
  }>) {
    await this.getById(id);
    await this.db.update(courses).set(input).where(eq(courses.id, id));
    await eventBus.emit('course.updated', { courseId: id });
    return this.getById(id);
  }

  async publish(id: string) {
    await this.getById(id);
    await this.db.update(courses).set({ status: 'published', publishedAt: new Date() }).where(eq(courses.id, id));
    await eventBus.emit('course.published', { courseId: id });
    return this.getById(id);
  }

  async unpublish(id: string) {
    await this.getById(id);
    await this.db.update(courses).set({ status: 'draft', publishedAt: null }).where(eq(courses.id, id));
    await eventBus.emit('course.unpublished', { courseId: id });
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.delete(courses).where(eq(courses.id, id));
    await eventBus.emit('course.deleted', { courseId: id });
  }
}
