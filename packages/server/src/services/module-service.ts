import { eq, asc, sql } from 'drizzle-orm';
import { courseModules } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError } from '@course/core';

export class ModuleService {
  constructor(private db: Database) {}

  async listByCourse(courseId: string) {
    return this.db.query.courseModules.findMany({
      where: eq(courseModules.courseId, courseId),
      orderBy: asc(courseModules.position),
    });
  }

  async getById(id: string) {
    const mod = await this.db.query.courseModules.findFirst({
      where: eq(courseModules.id, id),
    });
    if (!mod) throw new NotFoundError('Module', id);
    return mod;
  }

  async create(input: { courseId: string; title: string; description?: string; position?: number; releaseDate?: Date }) {
    let position = input.position;
    if (position === undefined) {
      const [countResult] = await this.db.select({ count: sql<number>`count(*)` }).from(courseModules).where(eq(courseModules.courseId, input.courseId));
      position = Number(countResult.count);
    }

    const [mod] = await this.db.insert(courseModules).values({
      courseId: input.courseId,
      title: input.title,
      description: input.description ?? null,
      position,
      releaseDate: input.releaseDate ?? null,
    }).returning();

    return mod;
  }

  async update(id: string, input: Partial<{ title: string; description: string; position: number; releaseDate: Date }>) {
    await this.getById(id);
    await this.db.update(courseModules).set(input).where(eq(courseModules.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.delete(courseModules).where(eq(courseModules.id, id));
  }

  async reorder(courseId: string, moduleIds: string[]) {
    for (let i = 0; i < moduleIds.length; i++) {
      await this.db.update(courseModules).set({ position: i }).where(eq(courseModules.id, moduleIds[i]));
    }
  }
}
