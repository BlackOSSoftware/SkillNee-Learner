import type {
  Assignment,
  AssignmentSubmissionType,
  MySubmissionSummary,
  SubmissionStatus,
} from '@/types/assignments';

/** UI-level status derived from real backend fields — never invented. */
export type AssignmentUiStatus =
  | 'pending'
  | 'overdue'
  | 'submitted'
  | 'graded'
  | 'returned'
  | 'closed';

export function deriveAssignmentStatus(
  assignment: Pick<Assignment, 'dueDate' | 'status'>,
  mySubmission: MySubmissionSummary | null | undefined
): AssignmentUiStatus {
  // A closed assignment stays visible but is read-only — surface that first.
  if (assignment.status === 'closed') return 'closed';
  if (mySubmission) {
    if (mySubmission.submissionStatus === 'evaluated') return 'graded';
    if (mySubmission.submissionStatus === 'returned') return 'returned';
    return 'submitted';
  }
  if (assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now()) {
    return 'overdue';
  }
  return 'pending';
}

export function submissionStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under review';
    case 'evaluated':
      return 'Graded';
    case 'returned':
      return 'Returned';
    case 'resubmitted':
      return 'Resubmitted';
    default:
      return status;
  }
}

export function submissionTypeLabel(type: AssignmentSubmissionType): string {
  switch (type) {
    case 'text':
      return 'Text submission';
    case 'file_upload':
      return 'File upload';
    case 'file_and_text':
      return 'Text + files';
    default:
      return type;
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Human "time remaining" for a due date; null when no due date. */
export function timeRemaining(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null;
  const diff = new Date(dueDate).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  let text: string;
  if (days > 0) text = `${days}d ${hours}h`;
  else if (hours > 0) text = `${hours}h ${minutes}m`;
  else text = `${minutes}m`;
  return diff >= 0 ? `${text} left` : `${text} overdue`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

/** Whether the student may submit/resubmit right now, per backend rules. */
export function canSubmitNow(
  assignment: Pick<
    Assignment,
    'status' | 'dueDate' | 'allowLateSubmission' | 'allowResubmission' | 'maxSubmissions'
  >,
  mySubmission: { submissionStatus: SubmissionStatus; version: number } | null | undefined
): { allowed: boolean; reason?: string } {
  if (assignment.status === 'closed') {
    return { allowed: false, reason: 'Submissions for this assignment are closed.' };
  }
  if (assignment.status !== 'published') {
    return { allowed: false, reason: 'This assignment is not open for submission.' };
  }
  const now = Date.now();
  if (assignment.dueDate && now > new Date(assignment.dueDate).getTime()) {
    if (!assignment.allowLateSubmission) {
      return { allowed: false, reason: 'The submission deadline has passed.' };
    }
  }
  if (!mySubmission) return { allowed: true };
  if (mySubmission.submissionStatus === 'returned') return { allowed: true };
  if (
    assignment.allowResubmission &&
    mySubmission.version < assignment.maxSubmissions &&
    ['submitted', 'evaluated', 'returned', 'resubmitted'].includes(mySubmission.submissionStatus)
  ) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'You have already submitted this assignment.' };
}

/** Validate a file against the assignment's allowed types and size. */
export function validateSubmissionFile(
  file: File,
  assignment: Pick<Assignment, 'allowedFileTypes' | 'maximumFileSizeBytes'>
): string | null {
  const name = file.name.toLowerCase();
  const allowed = (assignment.allowedFileTypes ?? []).map((t) => t.toLowerCase());
  if (allowed.length > 0 && !allowed.some((ext) => name.endsWith(ext))) {
    return `"${file.name}" is not an allowed file type. Allowed: ${assignment.allowedFileTypes.join(', ')}`;
  }
  if (file.size > assignment.maximumFileSizeBytes) {
    return `"${file.name}" exceeds the maximum size of ${formatBytes(assignment.maximumFileSizeBytes)}.`;
  }
  return null;
}
