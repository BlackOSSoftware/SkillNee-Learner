'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, HelpCircle, Target, TrendingUp } from 'lucide-react';
import { useQuizAttemptResult } from '@/hooks/quizzes/use-quizzes';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { PassFailBadge } from '@/components/quizzes/quiz-status-badge';
import { ResultReview } from '@/components/quizzes/result-review';
import { formatDateTime, formatTimeTaken } from '@/components/quizzes/quiz-display';

export default function QuizResultPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params?.attemptId;
  const result = useQuizAttemptResult(attemptId);

  if (result.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (result.isError || !result.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Could not load result"
          description="This result is unavailable or still being processed."
          onRetry={() => result.refetch()}
          retrying={result.isFetching}
        />
      </div>
    );
  }

  const r = result.data;
  const hasScores = r.obtainedMarks != null && r.percentage != null;
  const questions = r.questions ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/quizzes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to quizzes
      </Link>

      {/* Score header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary/10 via-surface to-surface p-5 shadow-card sm:p-6">
        <div
          className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-ink-subtle">Quiz result</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{r.quizTitle}</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Attempt {r.attemptNumber} · {formatDateTime(r.submittedAt ?? r.startedAt)}
              </p>
            </div>
            {r.passed != null ? <PassFailBadge passed={r.passed} /> : null}
          </div>

          {hasScores ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-line bg-surface/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Marks
                </p>
                <p className="mt-1 text-xl font-bold text-ink">
                  {r.obtainedMarks}
                  <span className="text-sm font-medium text-ink-subtle"> / {r.totalMarks}</span>
                </p>
              </div>
              <div className="rounded-xl border border-line bg-surface/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Percentage
                </p>
                <p className="mt-1 text-xl font-bold text-ink">{r.percentage}%</p>
              </div>
              <div className="rounded-xl border border-line bg-surface/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Correct
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xl font-bold text-emerald-600">
                  <CheckCircle2 className="size-4" aria-hidden />
                  {r.correctCount ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-surface/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Incorrect
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xl font-bold text-rose-600">
                  <TrendingUp className="size-4 rotate-180" aria-hidden />
                  {r.incorrectCount ?? 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-line bg-surface/70 p-4">
              <p className="text-sm text-ink-muted">
                {r.message ?? 'Your result is being evaluated. Please check back shortly.'}
              </p>
              {r.evaluationStatus === 'pending' || r.evaluationStatus === 'partial' ? (
                <p className="mt-1 text-xs text-ink-subtle">
                  Evaluation status: {r.evaluationStatus}
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              Time taken: {formatTimeTaken(r.timeTakenSeconds)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HelpCircle className="size-3.5" aria-hidden />
              {questions.length || '—'} questions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="size-3.5" aria-hidden />
              Status: {r.status}
            </span>
          </div>
        </div>
      </div>

      {/* Question review */}
      {hasScores && questions.length > 0 ? (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-ink">Question review</h3>
          <ResultReview questions={questions} />
        </div>
      ) : null}
    </div>
  );
}
