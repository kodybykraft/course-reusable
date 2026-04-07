// Context
export { CourseProvider, useCourse } from './context/course-context.js';

// Hooks
export { useAuth } from './hooks/use-auth.js';
export { useCourses, useCourseDetail } from './hooks/use-courses.js';
export { useEnrollment } from './hooks/use-enrollment.js';
export { useCourseProgress } from './hooks/use-progress.js';
export { useQuiz } from './hooks/use-quiz.js';
export { useStudentDashboard } from './hooks/use-student-dashboard.js';
export { useCheckout, useSubscription } from './hooks/use-checkout.js';
export { useDiscussions, useDiscussion, useLessonComments } from './hooks/use-discussions.js';

// Components
export { CourseCard } from './components/course-card.js';
export { CourseGrid } from './components/course-grid.js';
export { ProgressBar } from './components/progress-bar.js';
export { LessonPlayer } from './components/lesson-player.js';
export { ModuleSidebar } from './components/module-sidebar.js';
export { QuizPlayer } from './components/quiz-player.js';
export { StudentDashboard } from './components/student-dashboard.js';
export { CertificateCard } from './components/certificate-card.js';
