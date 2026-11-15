'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAssignmentDetail, useSubmission } from '@/hooks/assignments/use-assignments';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { SubmissionDetail } from '@/components/assignments/submission-detail';
import { FeedbackPanel } from '@/components/assignments/feedback-panel';
import { formatDateTime } from '@/components/assignments/assignment-display';

export default function SubmissionDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const submissionId = params.submissionId;

  const submission = useSubmission(submissionId);
  const assignmentDetail = useAssignmentDetail(submission.data?.assignmentId ?? null, Boolean(submission.data));

  if (submission.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (submission.isError || !submission.data) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState
          title="Submission not found"
          description="This submission could not be loaded. It may belong to another student or have been removed."
          onRetry={() => submission.refetch()}
          retrying={submission.isFetching}
        />
        <p className="mt-4 text-center">
          <Link href="/assignments" className="text-sm font-medium text-primary hover:underline">
            Back to assignments
          </Link>
        </p>
      </div>
    );
  }

  const data = submission.data;
  const assignment = assignmentDetail.data?.assignment;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/assignments"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to assignments
      </Link>

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {assignment?.title ?? 'Submission'}
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Submitted {formatDateTime(data.submittedAt)}
          {assignment ? ` · Maximum marks: ${assignment.maximumMarks}` : ''}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <SubmissionDetail submission={data} />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <FeedbackPanel submissionId={data.id} maximumMarks={assignment?.maximumMarks ?? 0} />
        </div>
      </div>

      {assignment ? (
        <p className="mt-4 text-center">
          <Link
            href={`/assignments/${assignment.id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Open assignment
          </Link>
        </p>
      ) : null}
    </div>
  );
}
