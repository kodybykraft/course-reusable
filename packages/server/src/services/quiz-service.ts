import { eq, desc, and, sql } from 'drizzle-orm';
import { courseQuizzes, courseQuizQuestions, courseQuizAttempts } from '@course/db';
import type { Database } from '@course/db';
import { NotFoundError, ValidationError } from '@course/core';
import { eventBus } from '../events/event-bus.js';

export class QuizService {
  constructor(private db: Database) {}

  async getByLessonId(lessonId: string) {
    return this.db.query.courseQuizzes.findFirst({
      where: eq(courseQuizzes.lessonId, lessonId),
      with: { questions: true },
    });
  }

  async getById(id: string) {
    const quiz = await this.db.query.courseQuizzes.findFirst({
      where: eq(courseQuizzes.id, id),
      with: { questions: true },
    });
    if (!quiz) throw new NotFoundError('Quiz', id);
    return quiz;
  }

  async create(input: {
    lessonId: string; title: string; description?: string; passingScore?: number;
    maxAttempts?: number; timeLimit?: number; shuffleQuestions?: boolean;
    showCorrectAnswers?: boolean; requiredForCompletion?: boolean;
  }) {
    const [quiz] = await this.db.insert(courseQuizzes).values({
      lessonId: input.lessonId,
      title: input.title,
      description: input.description ?? null,
      passingScore: input.passingScore ?? 70,
      maxAttempts: input.maxAttempts ?? null,
      timeLimit: input.timeLimit ?? null,
      shuffleQuestions: input.shuffleQuestions ?? false,
      showCorrectAnswers: input.showCorrectAnswers ?? true,
      requiredForCompletion: input.requiredForCompletion ?? false,
    }).returning();

    return quiz;
  }

  async update(id: string, input: Partial<{
    title: string; description: string; passingScore: number;
    maxAttempts: number; timeLimit: number; shuffleQuestions: boolean;
    showCorrectAnswers: boolean; requiredForCompletion: boolean;
  }>) {
    await this.getById(id);
    await this.db.update(courseQuizzes).set(input).where(eq(courseQuizzes.id, id));
    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await this.db.delete(courseQuizzes).where(eq(courseQuizzes.id, id));
  }

  async addQuestion(quizId: string, input: {
    type: string; content: string; options?: Array<{ label: string; value: string }>;
    correctAnswer?: string; explanation?: string; points?: number; position?: number;
  }) {
    let position = input.position;
    if (position === undefined) {
      const [countResult] = await this.db.select({ count: sql<number>`count(*)` }).from(courseQuizQuestions).where(eq(courseQuizQuestions.quizId, quizId));
      position = Number(countResult.count);
    }

    const [question] = await this.db.insert(courseQuizQuestions).values({
      quizId,
      type: input.type,
      content: input.content,
      options: input.options ?? null,
      correctAnswer: input.correctAnswer ?? null,
      explanation: input.explanation ?? null,
      points: input.points ?? 1,
      position,
    }).returning();

    return question;
  }

  async updateQuestion(questionId: string, input: Partial<{
    content: string; options: Array<{ label: string; value: string }>;
    correctAnswer: string; explanation: string; points: number; position: number;
  }>) {
    await this.db.update(courseQuizQuestions).set(input).where(eq(courseQuizQuestions.id, questionId));
  }

  async deleteQuestion(questionId: string) {
    await this.db.delete(courseQuizQuestions).where(eq(courseQuizQuestions.id, questionId));
  }

  async submitAttempt(quizId: string, studentId: string, answers: Array<{ questionId: string; answer: string }>) {
    const quiz = await this.getById(quizId);

    // Check max attempts
    if (quiz.maxAttempts) {
      const [attemptCount] = await this.db.select({ count: sql<number>`count(*)` }).from(courseQuizAttempts)
        .where(and(eq(courseQuizAttempts.quizId, quizId), eq(courseQuizAttempts.studentId, studentId)));
      if (Number(attemptCount.count) >= quiz.maxAttempts) {
        throw new ValidationError('Maximum attempts exceeded');
      }
    }

    // Grade
    let earnedPoints = 0;
    let totalPoints = 0;
    const results = answers.map((a) => {
      const question = quiz.questions.find((q) => q.id === a.questionId);
      if (!question) return { questionId: a.questionId, answer: a.answer, correct: false, points: 0 };
      totalPoints += question.points;
      const correct = question.correctAnswer !== null && a.answer === question.correctAnswer;
      if (correct) earnedPoints += question.points;
      return { questionId: a.questionId, answer: a.answer, correct, points: correct ? question.points : 0 };
    });

    // Add points for unanswered questions to total
    for (const q of quiz.questions) {
      if (!answers.find((a) => a.questionId === q.id)) {
        totalPoints += q.points;
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    const [attempt] = await this.db.insert(courseQuizAttempts).values({
      quizId,
      studentId,
      score,
      passed,
      answers: results,
      completedAt: new Date(),
    }).returning();

    await eventBus.emit('quiz.submitted', { quizId, attemptId: attempt.id, studentId });
    if (passed) {
      await eventBus.emit('quiz.passed', { quizId, attemptId: attempt.id, studentId, score });
    } else {
      await eventBus.emit('quiz.failed', { quizId, attemptId: attempt.id, studentId, score });
    }

    return { attemptId: attempt.id, score, passed, results };
  }

  async getAttempts(quizId: string, studentId?: string) {
    const conditions = [eq(courseQuizAttempts.quizId, quizId)];
    if (studentId) conditions.push(eq(courseQuizAttempts.studentId, studentId));

    return this.db.query.courseQuizAttempts.findMany({
      where: and(...conditions),
      orderBy: desc(courseQuizAttempts.startedAt),
    });
  }
}
