'use client';

import { useState } from 'react';

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  options?: string[] | null;
  position: number;
}

interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    description?: string | null;
    passingScore: number;
    timeLimitMinutes?: number | null;
    questions: QuizQuestion[];
  };
  onSubmit: (answers: Record<string, string>) => Promise<QuizResult | null>;
  submitting?: boolean;
  result?: QuizResult | null;
  onRetry?: () => void;
  className?: string;
}

export function QuizPlayer({
  quiz,
  onSubmit,
  submitting = false,
  result,
  onRetry,
  className,
}: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const sorted = [...quiz.questions].sort((a, b) => a.position - b.position);
  const current = sorted[currentIndex];
  const totalQuestions = sorted.length;
  const answeredCount = Object.keys(answers).length;

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  // Result screen
  if (result) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {result.passed ? '\u2705' : '\u274C'}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          {result.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#4b5563', margin: '0 0 0.5rem' }}>
          Score: {Math.round(result.score)}%
        </p>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem' }}>
          {result.correctAnswers} of {result.totalQuestions} correct (need {quiz.passingScore}% to pass)
        </p>
        {onRetry && !result.passed && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.75rem 2rem',
              background: '#2D60FF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{quiz.title}</h2>
        {quiz.description && (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>{quiz.description}</p>
        )}
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          Question {currentIndex + 1} of {totalQuestions} &middot; {answeredCount} answered
        </div>
      </div>

      {current && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem', color: '#111827' }}>
            {current.questionText}
          </p>

          {/* Multiple Choice */}
          {current.questionType === 'multiple_choice' && current.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {current.options.map((opt, i) => (
                <label
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    border: `2px solid ${answers[current.id] === opt ? '#2D60FF' : '#e5e7eb'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: answers[current.id] === opt ? '#eff6ff' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name={current.id}
                    checked={answers[current.id] === opt}
                    onChange={() => setAnswer(current.id, opt)}
                    style={{ accentColor: '#2D60FF' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {/* True / False */}
          {current.questionType === 'true_false' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['True', 'False'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswer(current.id, opt.toLowerCase())}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: `2px solid ${answers[current.id] === opt.toLowerCase() ? '#2D60FF' : '#e5e7eb'}`,
                    borderRadius: 8,
                    background: answers[current.id] === opt.toLowerCase() ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Fill in the blank */}
          {current.questionType === 'fill_blank' && (
            <input
              type="text"
              value={answers[current.id] ?? ''}
              onChange={(e) => setAnswer(current.id, e.target.value)}
              placeholder="Type your answer..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: '0.95rem',
              }}
            />
          )}

          {/* Essay */}
          {current.questionType === 'essay' && (
            <textarea
              value={answers[current.id] ?? ''}
              onChange={(e) => setAnswer(current.id, e.target.value)}
              placeholder="Write your answer..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: '0.95rem',
                resize: 'vertical',
              }}
            />
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          Previous
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#2D60FF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQuestions}
            style={{
              padding: '0.5rem 1.25rem',
              background: answeredCount < totalQuestions ? '#9ca3af' : '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: submitting || answeredCount < totalQuestions ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
