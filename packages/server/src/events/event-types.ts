export type DomainEvent =
  // Course lifecycle
  | { type: 'course.created'; payload: { courseId: string } }
  | { type: 'course.published'; payload: { courseId: string } }
  | { type: 'course.unpublished'; payload: { courseId: string } }
  | { type: 'course.updated'; payload: { courseId: string } }
  | { type: 'course.deleted'; payload: { courseId: string } }

  // Enrollment
  | { type: 'enrollment.created'; payload: { enrollmentId?: string; courseId: string; studentId: string; source?: string } }
  | { type: 'enrollment.completed'; payload: { enrollmentId: string; courseId: string; studentId: string } }
  | { type: 'enrollment.expired'; payload: { enrollmentId: string } }
  | { type: 'enrollment.paused'; payload: { enrollmentId: string } }

  // Lesson progress
  | { type: 'lesson.started'; payload: { lessonId: string; enrollmentId: string } }
  | { type: 'lesson.completed'; payload: { lessonId: string; enrollmentId: string } }
  | { type: 'lesson.released'; payload: { lessonId: string; courseId: string } }

  // Quiz
  | { type: 'quiz.submitted'; payload: { quizId: string; attemptId: string; studentId: string } }
  | { type: 'quiz.passed'; payload: { quizId: string; attemptId: string; studentId: string; score: number } }
  | { type: 'quiz.failed'; payload: { quizId: string; attemptId: string; studentId: string; score: number } }

  // Assignment
  | { type: 'assignment.submitted'; payload: { assignmentId: string; submissionId: string; studentId: string } }
  | { type: 'assignment.graded'; payload: { submissionId: string; studentId: string; grade: number } }

  // Certificate
  | { type: 'certificate.issued'; payload: { certificateId: string; enrollmentId: string; studentId: string } }

  // Commerce
  | { type: 'purchase.completed'; payload: { purchaseId: string; studentId: string; courseId: string; amount: number } }
  | { type: 'purchase.refunded'; payload: { purchaseId: string; refundId: string; amount: number } }
  | { type: 'subscription.created'; payload: { subscriptionId: string; studentId: string; planId: string } }
  | { type: 'subscription.cancelled_stripe'; payload: { stripeSubscriptionId: string } }
  | { type: 'subscription.cancelled'; payload: { subscriptionId?: string; studentId?: string; planId?: string; stripeSubscriptionId?: string } }
  | { type: 'subscription.renewed'; payload: { subscriptionId: string; studentId: string } }
  | { type: 'subscription.payment_failed'; payload: { stripeSubscriptionId: string; invoiceId: string } }

  // Community
  | { type: 'discussion.created'; payload: { discussionId: string; courseId: string; authorId: string } }
  | { type: 'discussion.replied'; payload: { discussionId: string; replyId: string; authorId: string } }
  | { type: 'comment.created'; payload: { commentId: string; lessonId: string; authorId: string } }

  // Review
  | { type: 'review.created'; payload: { reviewId: string; courseId: string; studentId: string; rating: number } }

  // Student
  | { type: 'customer.created'; payload: { customerId: string } }
  | { type: 'customer.updated'; payload: { customerId: string } };

export type EventType = DomainEvent['type'];
export type EventPayload<T extends EventType> = Extract<DomainEvent, { type: T }>['payload'];
