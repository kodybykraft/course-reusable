'use client';

import { useState } from 'react';
import { Badge, Card, PageHeader, FormGroup } from './_shared';

/* ==========================================================================
   Mock Data Fallback
   ========================================================================== */

const MOCK_QUESTIONS = [
  { id: 'q1', type: 'multiple_choice' as const, content: 'What hook is used for side effects in React?', options: ['useState', 'useEffect', 'useRef', 'useMemo'], correctAnswer: 'useEffect', points: 10, explanation: 'useEffect is designed for side effects like data fetching and subscriptions.' },
  { id: 'q2', type: 'true_false' as const, content: 'React components must return a single root element.', options: ['True', 'False'], correctAnswer: 'True', points: 5, explanation: 'Components must return a single root element, though fragments count.' },
  { id: 'q3', type: 'fill_blank' as const, content: 'The _____ hook lets you use state in functional components.', options: [], correctAnswer: 'useState', points: 10, explanation: 'useState is the primary state hook.' },
  { id: 'q4', type: 'essay' as const, content: 'Explain the difference between controlled and uncontrolled components.', options: [], correctAnswer: '', points: 20, explanation: '' },
];

const MOCK_ATTEMPTS = [
  { id: 'a1', studentName: 'Alice Johnson', score: 85, passed: true, date: '2026-03-28' },
  { id: 'a2', studentName: 'Bob Smith', score: 60, passed: false, date: '2026-03-29' },
  { id: 'a3', studentName: 'Carol Williams', score: 95, passed: true, date: '2026-03-30' },
  { id: 'a4', studentName: 'Dave Brown', score: 70, passed: false, date: '2026-04-01' },
];

type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';

interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  essay: 'Essay',
};

const TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: '#2D60FF',
  true_false: '#9b59b6',
  fill_blank: '#e67e22',
  essay: '#1abc9c',
};

/* ==========================================================================
   Add Question Form
   ========================================================================== */

function AddQuestionForm({ onAdd }: { onAdd: (q: Question) => void }) {
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [points, setPoints] = useState(10);
  const [explanation, setExplanation] = useState('');

  const reset = () => { setContent(''); setOptions(['', '', '', '']); setCorrectIdx(0); setCorrectAnswer(''); setPoints(10); setExplanation(''); };

  const handleSubmit = () => {
    const q: Question = {
      id: `q${Date.now()}`,
      type,
      content,
      options: type === 'multiple_choice' ? options : type === 'true_false' ? ['True', 'False'] : [],
      correctAnswer: type === 'multiple_choice' ? options[correctIdx] : type === 'true_false' ? (correctIdx === 0 ? 'True' : 'False') : correctAnswer,
      points,
      explanation,
    };
    onAdd(q);
    reset();
  };

  return (
    <Card title="Add Question">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <FormGroup label="Question Type">
          <select className="admin-input" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Points">
          <input className="admin-input" type="number" min={1} value={points} onChange={(e) => setPoints(+e.target.value)} />
        </FormGroup>
      </div>

      <FormGroup label="Question Content">
        <textarea className="admin-input" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter your question..." />
      </FormGroup>

      {type === 'multiple_choice' && (
        <FormGroup label="Options (select correct answer)">
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <input type="radio" name="correct" checked={correctIdx === i} onChange={() => setCorrectIdx(i)} />
              <input className="admin-input" style={{ flex: 1 }} placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => { const next = [...options]; next[i] = e.target.value; setOptions(next); }} />
            </div>
          ))}
        </FormGroup>
      )}

      {type === 'true_false' && (
        <FormGroup label="Correct Answer">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" name="tf" checked={correctIdx === 0} onChange={() => setCorrectIdx(0)} /> True
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" name="tf" checked={correctIdx === 1} onChange={() => setCorrectIdx(1)} /> False
            </label>
          </div>
        </FormGroup>
      )}

      {type === 'fill_blank' && (
        <FormGroup label="Correct Answer">
          <input className="admin-input" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Expected answer" />
        </FormGroup>
      )}

      <FormGroup label="Explanation (optional)">
        <textarea className="admin-input" rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain why this is the correct answer..." />
      </FormGroup>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
        <button type="button" className="admin-btn admin-btn--primary" disabled={!content.trim()} onClick={handleSubmit}>
          Add Question
        </button>
      </div>
    </Card>
  );
}

/* ==========================================================================
   QuizBuilderClient
   ========================================================================== */

export function QuizBuilderClient() {
  const [title, setTitle] = useState('Module 1 Quiz');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [attempts] = useState(MOCK_ATTEMPTS);

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const handleDelete = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const handleAdd = (q: Question) => setQuestions((prev) => [...prev, q]);

  return (
    <>
      <PageHeader
        title="Quiz Builder"
        subtitle={`${questions.length} questions | ${totalPoints} total points`}
        actions={
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => alert('Quiz saved!')}>
            Save Quiz
          </button>
        }
      />

      {/* Quiz Info */}
      <Card title="Quiz Settings">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <FormGroup label="Title">
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormGroup>
          <FormGroup label="Passing Score (%)">
            <input className="admin-input" type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(+e.target.value)} />
          </FormGroup>
          <FormGroup label="Max Attempts">
            <input className="admin-input" type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(+e.target.value)} />
          </FormGroup>
          <FormGroup label="Time Limit (min)">
            <input className="admin-input" type="number" min={0} value={timeLimit} onChange={(e) => setTimeLimit(+e.target.value)} />
          </FormGroup>
        </div>
      </Card>

      {/* Questions List */}
      <Card title={`Questions (${questions.length})`}>
        {questions.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.6, padding: '1.5rem 0' }}>No questions yet. Add one below.</p>
        )}
        {questions.map((q, i) => (
          <div
            key={q.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem 0',
              borderBottom: i < questions.length - 1 ? '1px solid rgba(255,255,255,.06)' : undefined,
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', minWidth: 24 }}>#{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: TYPE_COLORS[q.type], color: '#fff', textTransform: 'uppercase',
                }}>{TYPE_LABELS[q.type]}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{q.points} pts</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {q.content}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <button type="button" className="admin-btn admin-btn--sm admin-btn--outline" onClick={() => alert(`Edit question ${q.id}`)}>Edit</button>
              <button type="button" className="admin-btn admin-btn--sm admin-btn--critical" onClick={() => handleDelete(q.id)}>Delete</button>
            </div>
          </div>
        ))}
      </Card>

      {/* Add Question */}
      <AddQuestionForm onAdd={handleAdd} />

      {/* Attempts Table */}
      <Card title="Quiz Attempts">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Passed</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No attempts yet</td></tr>
              )}
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.studentName}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: a.score >= passingScore ? '#2ecc71' : '#e74c3c' }}>{a.score}%</span>
                  </td>
                  <td><Badge status={a.passed ? 'success' : 'failed'} /></td>
                  <td>{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
