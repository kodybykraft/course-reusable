'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentDashboard, CertificateCard, QuizPlayer } from '@course/react';
import { MOCK_ENROLLED_COURSES, MOCK_CERTIFICATE, MOCK_QUIZ } from '../../../lib/mock-data';

export default function DashboardPage() {
  const router = useRouter();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    setQuizSubmitting(true);
    // Simulate grading
    await new Promise((r) => setTimeout(r, 1000));
    const total = MOCK_QUIZ.questions.length;
    const correct = Math.floor(total * 0.75); // Always pass for demo
    setQuizResult({
      score: 75,
      passed: true,
      totalQuestions: total,
      correctAnswers: correct,
    });
    setQuizSubmitting(false);
    return { score: 75, passed: true, totalQuestions: total, correctAnswers: correct };
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Dashboard</h1>

      <StudentDashboard
        enrolledCourses={MOCK_ENROLLED_COURSES}
        totalCompleted={1}
        totalInProgress={2}
        onCourseClick={(slug) => router.push(`/courses/${slug}`)}
      />

      {/* Certificate section */}
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Certificates</h2>
        <CertificateCard
          certificate={MOCK_CERTIFICATE}
          verifyUrl={`/certificates/${MOCK_CERTIFICATE.uniqueCode}`}
          onDownload={() => router.push(`/certificates/${MOCK_CERTIFICATE.uniqueCode}`)}
        />
      </section>

      {/* Quiz demo */}
      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quiz Demo</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Try the interactive quiz component — supports multiple choice, true/false, fill-blank, and essay.
        </p>
        {!showQuiz ? (
          <button
            onClick={() => setShowQuiz(true)}
            style={{ padding: '0.75rem 2rem', background: '#2D60FF', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Take the Quiz
          </button>
        ) : (
          <div style={{ maxWidth: 700, border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', background: '#fff' }}>
            <QuizPlayer
              quiz={MOCK_QUIZ}
              onSubmit={handleQuizSubmit}
              submitting={quizSubmitting}
              result={quizResult}
              onRetry={() => { setQuizResult(null); }}
            />
          </div>
        )}
      </section>
    </div>
  );
}
