import type { StudentQuizListItem, AttemptStatus, QuestionType } from '@/types/quizzes';

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return 'No time limit';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeTaken(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function questionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'multiple_choice':
      return 'Multiple choice';
    case 'multiple_select':
      return 'Multiple select';
    case 'true_false':
      return 'True / False';
    case 'short_answer':
      return 'Short answer';
    case 'long_answer':
      return 'Long answer';
    case 'fill_in_the_blanks':
      return 'Fill in the blanks';
    default:
      return type;
  }
}

export function attemptStatusLabel(status: AttemptStatus): string {
  switch (status) {
    case 'in_progress':
      return 'In progress';
    case 'submitted':
      return 'Submitted';
    case 'evaluating':
      return 'Evaluating';
    case 'evaluated':
      return 'Evaluated';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

export function startReasonLabel(reason: StudentQuizListItem['startReason']): string {
  switch (reason) {
    case 'start':
      return 'Start quiz';
    case 'resume':
      return 'Resume quiz';
    case 'in_progress':
      return 'Attempt in progress';
    case 'max_attempts':
      return 'No attempts left';
    case 'not_started':
      return 'Not available yet';
    case 'ended':
      return 'Availability ended';
    case 'not_published':
      return 'Not published';
    default:
      return 'Unavailable';
  }
}

export function quizAvailabilityState(quiz: StudentQuizListItem): 'available' | 'upcoming' | 'ended' {
  if (!quiz.availability?.enabled) return 'available';
  const now = Date.now();
  if (quiz.availability.startsAt && new Date(quiz.availability.startsAt).getTime() > now) {
    return 'upcoming';
  }
  if (quiz.availability.endsAt && new Date(quiz.availability.endsAt).getTime() < now) {
    return 'ended';
  }
  return 'available';
}
