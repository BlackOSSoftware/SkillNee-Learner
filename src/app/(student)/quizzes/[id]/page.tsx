'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  ListChecks,
  Play,
  Target,
} from 'lucide-react';
import { useStudentQuiz, useStartQuiz } from '@/hooks/quizzes/use-quizzes';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { AttemptStatusBadge, PassFailBadge } from '@/components/quizzes/quiz-status-badge';
import {
  formatDateTime,
  formatDuration,
  formatTimeTaken,
  startReasonLabel,
} from '@/components/quizzes/quiz-display';
import { cacheQuizAttempt } from '@/lib/quiz-attempt-cache';
import { cn } from '@/lib/cn';

export default function QuizDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const detail = useStudentQuiz(id);
  const start = useStartQuiz();
  const [confirming, setConfirming] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  if (detail.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState
          title="Could not load quiz"
          description="This quiz is unavailable or you may not be enrolled in its course."
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      </div>
    );
  }

  const { quiz, myAttempts, canStart, startReason } = detail.data;

  const handleStart = async () => {
    if (!id) return;
    setStartError(null);
    try {
      const attempt = await start.mutateAsync(id);
      cacheQuizAttempt(attempt.attemptId, attempt);
      router.push(`/quizzes/attempt/${attempt.attemptId}?quizId=${quiz.id}`);
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Could not start the quiz. Please try again.';
      setStartError(message);
      setConfirming(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/quizzes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to quizzes
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary/10 via-surface to-surface p-5 shadow-card sm:p-6">
        <div
          className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-medium text-ink-subtle">{quiz.courseTitle ?? 'Course'}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{quiz.title}</h2>
          {quiz.description ? (
            <p className="mt-2 text-sm text-ink-muted">{quiz.description}</p>
          ) : null}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line/70 pt-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Questions
              </dt>
              <dd className="mt-0.5 inline-flex items-center gap-1.5 text-ink">
                <HelpCircle className="size-3.5 text-ink-subtle" aria-hidden />
                {quiz.questionCount}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Total marks
              </dt>
              <dd className="mt-0.5 inline-flex items-center gap-1.5 text-ink">
                <Target className="size-3.5 text-ink-subtle" aria-hidden />
                {quiz.totalMarks}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Duration
              </dt>
              <dd className="mt-0.5 inline-flex items-center gap-1.5 text-ink">
                <Clock className="size-3.5 text-ink-subtle" aria-hidden />
                {formatDuration(quiz.timeLimitSeconds)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Passing
              </dt>
              <dd className="mt-0.5 text-ink">{quiz.passingPercentage}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 className="text-sm font-semibold text-ink">Instructions</h3>
        {quiz.instructions ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">
            {quiz.instructions}
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink-subtle">No additional instructions.</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="flex items-center gap-2 text-ink-muted">
            <ListChecks className="size-3.5 text-ink-subtle" aria-hidden />
            <span>
              {quiz.unlimitedAttempts
                ? 'Unlimited attempts'
                : `Max ${quiz.maximumAttempts} attempt${quiz.maximumAttempts === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <FileText className="size-3.5 text-ink-subtle" aria-hidden />
            <span>{quiz.requireAllQuestions ? 'All questions required' : 'Partial allowed'}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <BookOpen className="size-3.5 text-ink-subtle" aria-hidden />
            <span>{quiz.allowBackNavigation ? 'Back navigation on' : 'No back navigation'}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Target className="size-3.5 text-ink-subtle" aria-hidden />
            <span>
              {quiz.showResults === 'never'
                ? 'Results hidden'
                : quiz.showResults === 'after_manual_grading'
                  ? 'Results after grading'
                  : 'Results after submit'}
            </span>
          </div>
        </div>
        {quiz.availability?.enabled && quiz.availability.endsAt ? (
          <p className="mt-3 text-xs text-ink-subtle">
            Available until {formatDateTime(quiz.availability.endsAt)}
          </p>
        ) : null}
      </div>

      {/* Attempts history */}
      {myAttempts.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h3 className="text-sm font-semibold text-ink">Your attempts</h3>
          <div className="mt-3 divide-y divide-line/60">
            {myAttempts.map((a) => (
              <div key={a.attemptId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">Attempt {a.attemptNumber}</span>
                  <AttemptStatusBadge status={a.status} />
                  {a.passed != null ? <PassFailBadge passed={a.passed} /> : null}
                </div>
                <div className="flex items-center gap-4 text-xs text-ink-muted">
                  {a.percentage != null ? <span>{a.percentage}%</span> : null}
                  {a.timeTakenSeconds != null ? <span>{formatTimeTaken(a.timeTakenSeconds)}</span> : null}
                  {a.submittedAt ? <span>{formatDateTime(a.submittedAt)}</span> : null}
                  {a.status !== 'in_progress' ? (
                    <Link
                      href={`/quizzes/result/${a.attemptId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      View result
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Start / confirmation */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        {startError ? (
          <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{startError}</p>
        ) : null}

        {!confirming ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {canStart
                ? startReason === 'resume'
                  ? 'You have an attempt in progress. Resume where you left off.'
                  : 'Ready when you are. The timer starts as soon as you begin.'
                : startReasonLabel(startReason)}
            </p>
            <button
              type="button"
              disabled={!canStart || start.isPending}
              onClick={() => setConfirming(true)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                canStart
                  ? 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop'
                  : 'cursor-not-allowed bg-surface-2 text-ink-subtle'
              )}
            >
              <Play className="size-4" aria-hidden />
              {startReason === 'resume' ? 'Resume quiz' : 'Start quiz'}
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-ink">Start this quiz?</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-muted">
              <li>· {quiz.questionCount} questions · {quiz.totalMarks} marks</li>
              <li>· {formatDuration(quiz.timeLimitSeconds)} time limit</li>
              <li>· Passing requires {quiz.passingPercentage}%</li>
              {quiz.timeLimitSeconds > 0 ? <li>· The timer starts immediately and cannot be paused.</li> : null}
              {quiz.requireAllQuestions ? <li>· All questions must be answered before submitting.</li> : null}
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={start.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-all hover:bg-primary-hover hover:shadow-pop disabled:opacity-60"
              >
                <Play className="size-4" aria-hidden />
                {start.isPending ? 'Starting…' : 'Yes, start now'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
