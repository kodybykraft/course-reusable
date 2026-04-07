import { eq, asc, sql } from 'drizzle-orm';
import { courseLessons, courseLessonContent, courseLessonResources } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError } from '@course/core';

export class LessonService {
  constructor(private db: Database) {}

  async listByModule(moduleId: string) {
    return this.db.query.courseLessons.findMany({
      where: eq(courseLessons.moduleId, moduleId),
      orderBy: asc(courseLessons.position),
    });
  }

  async getById(id: string) {
    const lesson = await this.db.query.courseLessons.findFirst({
      where: eq(courseLessons.id, id),
      with: { content: true, resources: true },
    });
    if (!lesson) throw new NotFoundError('Lesson', id);
    return lesson;
  }

  async create(input: {
    moduleId: string; title: string; contentType?: string; description?: string;
    position?: number; releaseDate?: Date; isFree?: boolean; estimatedDuration?: number;
  }) {
    let position = input.position;
    if (position === undefined) {
      const [countResult] = await this.db.select({ count: sql<number>`count(*)` }).from(courseLessons).where(eq(courseLessons.moduleId, input.moduleId));
      position = Number(countResult.count);
    }

    const [lesson] = await this.db.insert(courseLessons).values({
      moduleId: input.moduleId,
      title: input.title,
      contentType: input.contentType ?? 'video',
      description: input.description ?? null,
      position,
      releaseDate: input.releaseDate ?? null,
      isFree: input.isFree ?? false,
      estimatedDuration: input.estimatedDuration ?? null,
    }).returning();

    return lesson;
  }

  async update(id: string, input: Partial<{
    title: string; description: string; contentType: string;
    position: number; releaseDate: Date; isFree: boolean; estimatedDuration: number;
  }>) {
    await this.getById(id);
    await this.db.update(courseLessons).set(input).where(eq(courseLessons.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.delete(courseLessons).where(eq(courseLessons.id, id));
  }

  async addContent(lessonId: string, input: {
    type: string; url?: string; content?: string; duration?: number;
    fileSize?: number; embedCode?: string; position?: number;
  }) {
    let position = input.position;
    if (position === undefined) {
      const [countResult] = await this.db.select({ count: sql<number>`count(*)` }).from(courseLessonContent).where(eq(courseLessonContent.lessonId, lessonId));
      position = Number(countResult.count);
    }

    const [content] = await this.db.insert(courseLessonContent).values({
      lessonId,
      type: input.type,
      url: input.url ?? null,
      content: input.content ?? null,
      duration: input.duration ?? null,
      fileSize: input.fileSize ?? null,
      embedCode: input.embedCode ?? null,
      position,
    }).returning();

    return content;
  }

  async removeContent(contentId: string) {
    await this.db.delete(courseLessonContent).where(eq(courseLessonContent.id, contentId));
  }

  async addResource(lessonId: string, input: { title: string; url: string; fileType?: string; fileSize?: number }) {
    const [resource] = await this.db.insert(courseLessonResources).values({
      lessonId,
      title: input.title,
      url: input.url,
      fileType: input.fileType ?? null,
      fileSize: input.fileSize ?? null,
    }).returning();

    return resource;
  }

  async removeResource(resourceId: string) {
    await this.db.delete(courseLessonResources).where(eq(courseLessonResources.id, resourceId));
  }

  async reorder(moduleId: string, lessonIds: string[]) {
    for (let i = 0; i < lessonIds.length; i++) {
      await this.db.update(courseLessons).set({ position: i }).where(eq(courseLessons.id, lessonIds[i]));
    }
  }
}
