'use client';

import { Award, Clock, Loader2 } from 'lucide-react';
import { useSubmissionFeedback } from '@/hooks/assignments/use-assignments';
import { formatDateTime } from './assignment-display';
import { SubmissionStatusBadge } from './status-badges';

export function FeedbackPanel({
  submissionId,
  maximumMarks,
}: {
  submissionId: string;
  maximumMarks: number;
}) {
  const feedback = useSubmissionFeedback(submissionId);

  if (feedback.isPending) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading evaluation…
      </div>
    );
  }

  if (feedback.isError || !feedback.data) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
        Evaluation details are unavailable right now.
      </div>
    );
  }

  const data = feedback.data;
  const graded = data.marksAwarded != null;

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Instructor evaluation</h3>
        <SubmissionStatusBadge status={data.submissionStatus} />
      </div>

      {graded ? (
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Marks obtained</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-ink">
              <Award className="size-5 text-warning" aria-hidden />
              {data.marksAwarded}
              <span className="text-sm font-medium text-ink-muted">/ {maximumMarks}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Percentage</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {maximumMarks > 0 ? `${Math.round((Number(data.marksAwarded) / maximumMarks) * 100)}%` : '—'}
            </p>
          </div>
          {data.evaluatedAt ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Evaluated on</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink">
                <Clock className="size-3.5 text-ink-subtle" aria-hidden />
                {formatDateTime(data.evaluatedAt)}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-line bg-surface-2/60 p-4">
          <p className="text-sm font-medium text-ink">Awaiting evaluation</p>
          <p className="mt-1 text-xs text-ink-muted">
            Your submission has been received and is waiting for instructor review.
          </p>
        </div>
      )}

      {data.feedback ? (
        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Feedback</p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink">{data.feedback}</p>
        </div>
      ) : null}
    </div>
  );
}
