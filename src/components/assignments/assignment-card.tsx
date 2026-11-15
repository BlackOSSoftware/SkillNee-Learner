'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, FileText, Paperclip } from 'lucide-react';
import type { StudentAssignmentListItem } from '@/types/assignments';
import {
  deriveAssignmentStatus,
  formatDateTime,
  submissionTypeLabel,
  timeRemaining,
  type AssignmentUiStatus,
} from './assignment-display';
import { AssignmentStatusBadge } from './status-badges';
import { cn } from '@/lib/cn';

const ACCENT: Record<AssignmentUiStatus, string> = {
  pending: 'from-sky-500/80 to-blue-500/40',
  overdue: 'from-red-500/80 to-rose-500/40',
  submitted: 'from-violet-500/80 to-purple-500/40',
  graded: 'from-emerald-500/80 to-green-500/40',
  returned: 'from-amber-500/80 to-orange-500/40',
  closed: 'from-slate-400/70 to-slate-500/30',
};

export function AssignmentCard({
  assignment,
  courseTitle,
}: {
  assignment: StudentAssignmentListItem;
  courseTitle?: string;
}) {
  const status = deriveAssignmentStatus(assignment, assignment.mySubmission);
  const remaining = timeRemaining(assignment.dueDate);
  const hasFiles = assignment.submissionType !== 'text';
  const isClosed = assignment.status === 'closed';

  return (
    <Link
      href={`/assignments/${assignment.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop',
        isClosed ? 'opacity-90' : 'hover:border-primary/40'
      )}
    >
      {/* Status accent bar */}
      <div
        className={cn('h-1 w-full bg-gradient-to-r', ACCENT[status])}
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                'line-clamp-2 text-base font-semibold leading-snug text-ink transition-colors',
                !isClosed && 'group-hover:text-primary'
              )}
            >
              {assignment.title}
            </h3>
            <p className="mt-1 truncate text-xs text-ink-subtle">
              {courseTitle ?? 'Course'} · {submissionTypeLabel(assignment.submissionType)}
            </p>
          </div>
          <AssignmentStatusBadge status={status} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-ink-subtle" aria-hidden />
            Due {formatDateTime(assignment.dueDate)}
          </span>
          {remaining ? (
            <span
              className={cn(
                'font-medium',
                status === 'overdue' ? 'text-danger' : status === 'closed' ? 'text-ink-subtle' : 'text-ink'
              )}
            >
              {remaining}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-3.5 text-ink-subtle" aria-hidden />
            {assignment.maximumMarks} marks
          </span>
          {hasFiles ? (
            <span className="inline-flex items-center gap-1.5">
              <Paperclip className="size-3.5 text-ink-subtle" aria-hidden />
              Files
            </span>
          ) : null}
        </div>

        {assignment.mySubmission ? (
          <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-muted">
            <span
              className={cn(
                'size-1.5 rounded-full',
                assignment.mySubmission.submissionStatus === 'evaluated'
                  ? 'bg-success'
                  : assignment.mySubmission.submissionStatus === 'returned'
                    ? 'bg-warning'
                    : 'bg-primary'
              )}
              aria-hidden
            />
            Submitted {formatDateTime(assignment.mySubmission.submittedAt)}
            {assignment.mySubmission.isLate ? ' · late' : ''}
            {assignment.mySubmission.marksAwarded != null
              ? ` · ${assignment.mySubmission.marksAwarded}/${assignment.maximumMarks}`
              : ''}
          </div>
        ) : null}

        <span
          className={cn(
            'mt-4 inline-flex items-center gap-1.5 text-sm font-semibold',
            isClosed ? 'text-ink-muted' : 'text-primary'
          )}
        >
          {isClosed ? 'View details' : assignment.mySubmission ? 'View submission' : 'Open assignment'}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
