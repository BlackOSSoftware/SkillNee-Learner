'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarClock, FileText, Lock, Paperclip } from 'lucide-react';
import { useAssignmentDetail } from '@/hooks/assignments/use-assignments';
import { useMyCourses } from '@/hooks/enrollment/use-enrollment';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { AssignmentStatusBadge } from '@/components/assignments/status-badges';
import { SubmissionForm } from '@/components/assignments/submission-form';
import { SubmissionDetail } from '@/components/assignments/submission-detail';
import { FeedbackPanel } from '@/components/assignments/feedback-panel';
import {
  deriveAssignmentStatus,
  formatDateTime,
  submissionTypeLabel,
  timeRemaining,
} from '@/components/assignments/assignment-display';

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const detail = useAssignmentDetail(id);
  const myCourses = useMyCourses('all');

  if (detail.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState
          title="Assignment not available"
          description="This assignment could not be loaded. It may have been unpublished or you may not be enrolled in the course."
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
        <p className="mt-4 text-center">
          <Link href="/assignments" className="text-sm font-medium text-primary hover:underline">
            Back to assignments
          </Link>
        </p>
      </div>
    );
  }

  const { assignment, mySubmission } = detail.data;
  const status = deriveAssignmentStatus(assignment, mySubmission);
  const remaining = timeRemaining(assignment.dueDate);
  const courseTitle = (myCourses.data?.courses ?? []).find(
    (c) => c.course.id === assignment.courseId
  )?.course.title;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/assignments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to assignments
      </Link>

      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary/10 via-surface to-surface p-5 shadow-card sm:p-6">
        <div
          className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-ink">{assignment.title}</h2>
              <p className="mt-1 text-sm text-ink-subtle">
                {courseTitle ?? 'Course'} · {submissionTypeLabel(assignment.submissionType)}
              </p>
            </div>
            <AssignmentStatusBadge status={status} />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line/70 pt-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Due date</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1.5 text-ink">
                <CalendarClock className="size-3.5 text-ink-subtle" aria-hidden />
                {formatDateTime(assignment.dueDate)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Time remaining</dt>
              <dd className={`mt-0.5 font-medium ${status === 'overdue' ? 'text-danger' : 'text-ink'}`}>
                {remaining ?? 'No deadline'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Maximum marks</dt>
              <dd className="mt-0.5 inline-flex items-center gap-1.5 text-ink">
                <FileText className="size-3.5 text-ink-subtle" aria-hidden />
                {assignment.maximumMarks}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Submissions</dt>
              <dd className="mt-0.5 text-ink">
                {assignment.allowResubmission
                  ? `Up to ${assignment.maxSubmissions}`
                  : 'Single submission'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 className="text-sm font-semibold text-ink">Instructions</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">
          {assignment.instructions}
        </p>
        {assignment.submissionType !== 'text' ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-subtle">
            <Paperclip className="size-3.5" aria-hidden />
            Accepted files: {assignment.allowedFileTypes.join(', ')} · max{' '}
            {(assignment.maximumFileSizeBytes / (1024 * 1024)).toFixed(0)} MB per file
          </p>
        ) : null}
        {assignment.allowLateSubmission ? (
          <p className="mt-2 text-xs text-ink-subtle">Late submissions are accepted for this assignment.</p>
        ) : null}
      </div>

      {/* Existing submission */}
      {mySubmission ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <SubmissionDetail submission={mySubmission} />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <FeedbackPanel submissionId={mySubmission.id} maximumMarks={assignment.maximumMarks} />
          </div>
        </div>
      ) : null}

      {/* Submit / resubmit — hidden when the assignment is closed */}
      {assignment.status === 'closed' ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-surface-2/60 p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
            <Lock className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Submissions closed</p>
            <p className="mt-1 text-sm text-ink-muted">
              This assignment is no longer accepting submissions.
              {mySubmission
                ? ' Your submission and feedback remain available above.'
                : ' You can still review the instructions and details.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <SubmissionForm
            key={`${assignment.id}-${mySubmission?.version ?? 0}`}
            assignment={assignment}
            mySubmission={mySubmission}
            onSubmitted={() => detail.refetch()}
          />
        </div>
      )}

      {mySubmission ? (
        <p className="mt-4 text-center">
          <Link
            href={`/assignments/submissions/${mySubmission.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View full submission history
          </Link>
        </p>
      ) : null}
    </div>
  );
}
