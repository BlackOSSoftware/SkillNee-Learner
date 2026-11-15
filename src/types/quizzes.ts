import type { Pagination } from './courses';

export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuizShowResults = 'immediate' | 'after_submission' | 'after_manual_grading' | 'never';
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'fill_in_the_blanks';
export type AttemptStatus =
  | 'in_progress'
  | 'submitted'
  | 'evaluating'
  | 'evaluated'
  | 'expired';
export type EvaluationStatus = 'pending' | 'partial' | 'completed';

export interface QuizAvailability {
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
}

export interface QuizAttemptSummary {
  total: number;
  completed: number;
  inProgress: {
    attemptId: string;
    attemptNumber: number;
    startedAt: string;
    expiresAt: string | null;
  } | null;
  bestPercentage: number | null;
  bestPassed: boolean | null;
  lastAttemptId: string | null;
  lastStatus: AttemptStatus | null;
}

export interface StudentQuizListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  courseId: string;
  courseTitle: string | null;
  lessonId: string | null;
  timeLimitSeconds: number;
  totalMarks: number;
  passingPercentage: number;
  maximumAttempts: number;
  unlimitedAttempts: boolean;
  allowResume: boolean;
  allowBackNavigation: boolean;
  showResults: QuizShowResults;
  showCorrectAnswers: boolean;
  showExplanation: boolean;
  negativeMarkingEnabled: boolean;
  questionCount: number;
  availability: QuizAvailability;
  status: QuizStatus;
  publishedAt: string | null;
  createdAt: string;
  myAttempts: QuizAttemptSummary;
  canStart: boolean;
  startReason: 'start' | 'resume' | 'in_progress' | 'max_attempts' | 'not_started' | 'ended' | 'not_published';
}

export interface StudentQuizAttemptHistoryItem {
  attemptId: string;
  attemptNumber: number;
  status: AttemptStatus;
  percentage: number | null;
  passed: boolean | null;
  startedAt: string;
  expiresAt: string | null;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
  evaluationStatus: EvaluationStatus;
  resultPublished: boolean;
  createdAt: string;
}

export interface StudentQuizDetail {
  quiz: StudentQuizListItem & {
    instructions: string;
    negativeMarksPerWrongAnswer: number;
    requireAllQuestions: boolean;
    allowPartialCreditMultiSelect: boolean;
    questionSelectionMode: 'all' | 'random_count';
    questionsToSelect: number | null;
    tags: string[];
  };
  myAttempts: StudentQuizAttemptHistoryItem[];
  canStart: boolean;
  startReason: StudentQuizListItem['startReason'];
}

export interface QuizOption {
  id: string;
  text: string;
  image: string | null;
  sortOrder: number;
}

export interface QuizBlank {
  id: string;
  marks: number;
}

export interface QuizQuestionStudent {
  id: string;
  questionText: string;
  questionType: QuestionType;
  description: string;
  marks: number;
  isRequired: boolean;
  sortOrder: number;
  options: QuizOption[];
  blanks: QuizBlank[];
  gradingMode: 'auto' | 'manual';
}

export interface QuizAttemptStart {
  attemptId: string;
  quizId: string;
  attemptNumber: number;
  startedAt: string;
  expiresAt: string | null;
  timeLimitSeconds: number;
  status: AttemptStatus;
  totalMarks: number;
  questions: QuizQuestionStudent[];
}

export interface QuizAnswerPayload {
  selectedOptionIds?: string[];
  booleanAnswer?: boolean;
  text?: string;
  blankAnswers?: { blankId: string; value: string }[];
}

export interface QuizAnswerSubmission {
  questionId: string;
  answer: QuizAnswerPayload;
}

export interface QuizResultQuestion extends Omit<QuizQuestionStudent, 'blanks'> {
  blanks?: { id: string; acceptedAnswers?: string[]; marks?: number }[];
  studentAnswer?: {
    selectedOptionIds?: string[];
    booleanAnswer?: boolean;
    text?: string;
    blankAnswers?: { blankId: string; value: string }[];
  };
  isCorrect?: boolean;
  marksAwarded?: number;
  negativeApplied?: number;
  feedback?: string;
  needsManualGrading?: boolean;
  correctOptionIds?: string[];
  correctAnswer?: boolean | string;
  acceptedAnswers?: string[];
  explanation?: string;
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  attemptNumber: number;
  status: AttemptStatus;
  evaluationStatus: EvaluationStatus;
  submittedAt: string | null;
  startedAt: string;
  expiresAt: string | null;
  timeTakenSeconds: number | null;
  resultPublished: boolean;
  message?: string;
  totalMarks?: number;
  obtainedMarks?: number;
  negativeMarks?: number;
  percentage?: number | null;
  passed?: boolean | null;
  correctCount?: number;
  incorrectCount?: number;
  questions?: QuizResultQuestion[];
}

export interface StudentQuizzesResponse {
  quizzes: StudentQuizListItem[];
  pagination: Pagination;
}
