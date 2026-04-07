import { eq, desc, and, sql } from 'drizzle-orm';
import { courseDiscussions, courseDiscussionReplies, courseLessonComments } from '@course/db';
import type { Database } from '@course/db';
import type { PaginationInput } from '@course/core';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class DiscussionService {
  constructor(private db: Database) {}

  async listByCourse(courseId: string, pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const where = eq(courseDiscussions.courseId, courseId);

    const [data, countResult] = await Promise.all([
      this.db.query.courseDiscussions.findMany({
        where,
        with: { author: true },
        limit: pageSize,
        offset,
        orderBy: [desc(courseDiscussions.isPinned), desc(courseDiscussions.createdAt)],
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseDiscussions).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const discussion = await this.db.query.courseDiscussions.findFirst({
      where: eq(courseDiscussions.id, id),
      with: { author: true, replies: { with: { author: true } } },
    });
    if (!discussion) throw new NotFoundError('Discussion', id);
    return discussion;
  }

  async create(courseId: string, authorId: string, title: string, content: string) {
    const [discussion] = await this.db
      .insert(courseDiscussions)
      .values({ courseId, authorId, title, content })
      .returning();

    await eventBus.emit('discussion.created', {
      discussionId: discussion.id,
      courseId,
      authorId,
    });

    return discussion;
  }

  async reply(discussionId: string, authorId: string, content: string, parentReplyId?: string) {
    const discussion = await this.db.query.courseDiscussions.findFirst({
      where: eq(courseDiscussions.id, discussionId),
    });
    if (!discussion) throw new NotFoundError('Discussion', discussionId);
    if (discussion.isLocked) throw new ValidationError('Discussion is locked');

    const [reply] = await this.db
      .insert(courseDiscussionReplies)
      .values({ discussionId, authorId, content, parentReplyId: parentReplyId ?? null })
      .returning();

    await eventBus.emit('discussion.replied', {
      discussionId,
      replyId: reply.id,
      authorId,
    });

    return reply;
  }

  async pin(id: string) {
    const discussion = await this.db.query.courseDiscussions.findFirst({
      where: eq(courseDiscussions.id, id),
    });
    if (!discussion) throw new NotFoundError('Discussion', id);

    await this.db
      .update(courseDiscussions)
      .set({ isPinned: !discussion.isPinned })
      .where(eq(courseDiscussions.id, id));
  }

  async lock(id: string) {
    const discussion = await this.db.query.courseDiscussions.findFirst({
      where: eq(courseDiscussions.id, id),
    });
    if (!discussion) throw new NotFoundError('Discussion', id);

    await this.db
      .update(courseDiscussions)
      .set({ isLocked: !discussion.isLocked })
      .where(eq(courseDiscussions.id, id));
  }

  async delete(id: string) {
    await this.db.delete(courseDiscussions).where(eq(courseDiscussions.id, id));
  }

  async deleteReply(replyId: string) {
    await this.db.delete(courseDiscussionReplies).where(eq(courseDiscussionReplies.id, replyId));
  }

  async listLessonComments(lessonId: string, pagination?: PaginationInput) {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const where = eq(courseLessonComments.lessonId, lessonId);

    const [data, countResult] = await Promise.all([
      this.db.query.courseLessonComments.findMany({
        where,
        with: { author: true },
        limit: pageSize,
        offset,
        orderBy: courseLessonComments.createdAt,
      }),
      this.db.select({ count: sql<number>`count(*)` }).from(courseLessonComments).where(where),
    ]);

    const total = Number(countResult[0].count);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async addLessonComment(lessonId: string, authorId: string, content: string, parentCommentId?: string) {
    const [comment] = await this.db
      .insert(courseLessonComments)
      .values({ lessonId, authorId, content, parentCommentId: parentCommentId ?? null })
      .returning();

    await eventBus.emit('comment.created', {
      commentId: comment.id,
      lessonId,
      authorId,
    });

    return comment;
  }

  async deleteLessonComment(commentId: string) {
    await this.db.delete(courseLessonComments).where(eq(courseLessonComments.id, commentId));
  }
}
