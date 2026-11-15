import type { AssignmentUiStatus } from './assignment-display';
import { submissionStatusLabel } from './assignment-display';
import type { SubmissionStatus } from '@/types/assignments';
import { cn } from '@/lib/cn';

const UI_STATUS_STYLES: Record<AssignmentUiStatus, string> = {
  pending: 'bg-surface-2 text-ink-muted border-line',
  overdue: 'bg-danger/10 text-danger border-danger/25',
  submitted: 'bg-primary/10 text-primary border-primary/25',
  graded: 'bg-success/10 text-success border-success/25',
  returned: 'bg-warning/10 text-warning border-warning/25',
  closed: 'bg-surface-2 text-ink-muted border-line',
};

const UI_STATUS_LABELS: Record<AssignmentUiStatus, string> = {
  pending: 'Pending',
  overdue: 'Overdue',
  submitted: 'Submitted',
  graded: 'Graded',
  returned: 'Returned',
  closed: 'Closed',
};

export function AssignmentStatusBadge({ status }: { status: AssignmentUiStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        UI_STATUS_STYLES[status]
      )}
    >
      {UI_STATUS_LABELS[status]}
    </span>
  );
}

const SUBMISSION_STYLES: Record<SubmissionStatus, string> = {
  submitted: 'bg-primary/10 text-primary border-primary/25',
  under_review: 'bg-primary/10 text-primary border-primary/25',
  evaluated: 'bg-success/10 text-success border-success/25',
  returned: 'bg-warning/10 text-warning border-warning/25',
  resubmitted: 'bg-primary/10 text-primary border-primary/25',
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        SUBMISSION_STYLES[status]
      )}
    >
      {submissionStatusLabel(status)}
    </span>
  );
}
