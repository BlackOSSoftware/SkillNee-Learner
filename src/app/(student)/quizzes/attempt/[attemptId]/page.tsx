'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Bookmark, Flag, Send } from 'lucide-react';
import { useStartQuiz, useSubmitQuizAttempt } from '@/hooks/quizzes/use-quizzes';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { ExamTimer } from '@/components/quizzes/exam-timer';
import { QuestionNavigator } from '@/components/quizzes/question-navigator';
import { QuestionRenderer } from '@/components/quizzes/question-renderer';
import {
  cacheQuizAnswers,
  cacheQuizAttempt,
  cacheQuizMarked,
  clearCachedQuizAttempt,
  readCachedQuizAnswers,
  readCachedQuizAttempt,
  readCachedQuizMarked,
} from '@/lib/quiz-attempt-cache';
import type { QuizAnswerPayload, QuizAnswerSubmission, QuizAttemptStart } from '@/types/quizzes';
import { cn } from '@/lib/cn';

export default function QuizAttemptPage() {
  const params = useParams<{ attemptId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = params?.attemptId;
  const quizId = searchParams?.get('quizId') ?? '';

  const start = useStartQuiz();
  const submit = useSubmitQuizAttempt();

  const [attempt, setAttempt] = useState<QuizAttemptStart | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerPayload>>(() => {
    if (!attemptId) return {};
    return readCachedQuizAnswers<Record<string, QuizAnswerPayload>>(attemptId) ?? {};
  });
  const [marked, setMarked] = useState<Set<string>>(() => {
    if (!attemptId) return new Set<string>();
    return new Set(readCachedQuizMarked(attemptId));
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  // Load attempt: prefer sessionStorage, else resume via start.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!attemptId) return;
      const cached = readCachedQuizAttempt<QuizAttemptStart>(attemptId);
      if (cached && cached.questions?.length) {
        if (!cancelled) {
          setAttempt(cached);
          setLoading(false);
        }
        return;
      }
      if (!quizId) {
        if (!cancelled) {
          setLoadError('This attempt could not be restored. Please start the quiz again.');
          setLoading(false);
        }
        return;
      }
      try {
        const resumed = await start.mutateAsync(quizId);
        if (cancelled) return;
        // Only accept if it matches the URL attemptId (resume returns same attempt).
        if (resumed.attemptId !== attemptId) {
          setLoadError('This attempt is no longer active. Please start a new one.');
          setLoading(false);
          return;
        }
        cacheQuizAttempt(resumed.attemptId, resumed);
        setAttempt(resumed);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
            ?.message ?? 'Could not load the quiz attempt.';
        setLoadError(message);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, quizId]);

  // Persist answers + marked.
  useEffect(() => {
    if (!attemptId) return;
    cacheQuizAnswers(attemptId, answers);
  }, [attemptId, answers]);
  useEffect(() => {
    if (!attemptId) return;
    cacheQuizMarked(attemptId, Array.from(marked));
  }, [attemptId, marked]);

  const questions = useMemo(() => attempt?.questions ?? [], [attempt]);
  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const ans = answers[q.id];
      if (!ans) return false;
      if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) return true;
      if (typeof ans.booleanAnswer === 'boolean') return true;
      if (typeof ans.text === 'string' && ans.text.trim().length > 0) return true;
      if (ans.blankAnswers && ans.blankAnswers.some((b) => b.value.trim().length > 0)) return true;
      return false;
    }).length;
  }, [questions, answers]);

  const unansweredRequired = useMemo(() => {
    return questions.filter((q) => {
      if (!q.isRequired) return false;
      const ans = answers[q.id];
      if (!ans) return true;
      if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) return false;
      if (typeof ans.booleanAnswer === 'boolean') return false;
      if (typeof ans.text === 'string' && ans.text.trim().length > 0) return false;
      if (ans.blankAnswers && ans.blankAnswers.some((b) => b.value.trim().length > 0)) return false;
      return true;
    });
  }, [questions, answers]);

  const doSubmit = useCallback(async () => {
    if (!attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitError(null);
    const payload: QuizAnswerSubmission[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? {},
    }));
    try {
      await submit.mutateAsync({ attemptId, answers: payload });
      clearCachedQuizAttempt(attemptId);
      router.push(`/quizzes/result/${attemptId}`);
    } catch (err) {
      submittedRef.current = false;
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Submission failed. Please try again.';
      setSubmitError(message);
      setConfirmSubmit(false);
    }
  }, [attemptId, questions, answers, submit, router]);

  const handleExpire = useCallback(() => {
    void doSubmit();
  }, [doSubmit]);

  const toggleMark = () => {
    if (!currentQuestion) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (loadError || !attempt) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <ErrorState
          title="Could not open quiz"
          description={loadError ?? 'The quiz attempt is unavailable.'}
        />
        {quizId ? (
          <div className="text-center">
            <Link
              href={`/quizzes/${quizId}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Back to quiz
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={quizId ? `/quizzes/${quizId}` : '/quizzes'}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Exit quiz
          </Link>
          <span className="text-sm font-semibold text-ink">Attempt {attempt.attemptNumber}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">
            {answeredCount}/{questions.length} answered
          </span>
          <ExamTimer
            expiresAt={attempt.expiresAt}
            timeLimitSeconds={attempt.timeLimitSeconds}
            onExpire={handleExpire}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* Question area */}
        <div className="space-y-4">
          {currentQuestion ? (
            <>
              <QuestionRenderer
                key={currentQuestion.id}
                question={currentQuestion}
                index={currentIndex}
                value={answers[currentQuestion.id]}
                onChange={(answer) =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleMark}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                    marked.has(currentQuestion.id)
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-line bg-surface text-ink-muted hover:bg-surface-2'
                  )}
                >
                  <Bookmark className="size-4" aria-hidden />
                  {marked.has(currentQuestion.id) ? 'Marked' : 'Mark for review'}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Previous
                  </button>
                  {!isLast ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-all hover:bg-primary-hover"
                    >
                      Next
                      <ArrowRight className="size-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmSubmit(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-all hover:bg-primary-hover"
                    >
                      <Send className="size-4" aria-hidden />
                      Submit quiz
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Navigator */}
        <div className="space-y-4">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers as Record<string, unknown>}
            marked={marked}
            onSelect={setCurrentIndex}
          />
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-fg transition-all hover:bg-primary-hover"
          >
            <Flag className="size-4" aria-hidden />
            Submit quiz
          </button>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {confirmSubmit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-pop">
            <h3 className="text-lg font-bold text-ink">Submit quiz?</h3>
            <p className="mt-2 text-sm text-ink-muted">
              You have answered {answeredCount} of {questions.length} questions.
              {unansweredRequired.length > 0
                ? ` ${unansweredRequired.length} required question${unansweredRequired.length === 1 ? '' : 's'} ${unansweredRequired.length === 1 ? 'is' : 'are'} unanswered.`
                : ''}
            </p>
            <p className="mt-1 text-sm text-ink-muted">This action cannot be undone.</p>
            {submitError ? (
              <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{submitError}</p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                disabled={submit.isPending}
                className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => void doSubmit()}
                disabled={submit.isPending}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-all hover:bg-primary-hover disabled:opacity-60"
              >
                {submit.isPending ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
