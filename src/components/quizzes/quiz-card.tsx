'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, HelpCircle, ListChecks, Target } from 'lucide-react';
import type { StudentQuizListItem } from '@/types/quizzes';
import {
  formatDateTime,
  formatDuration,
  quizAvailabilityState,
  startReasonLabel,
} from './quiz-display';
import { AttemptStatusBadge, PassFailBadge } from './quiz-status-badge';
import { cn } from '@/lib/cn';

export function QuizCard({ quiz }: { quiz: StudentQuizListItem }) {
  const availability = quizAvailabilityState(quiz);
  const hasInProgress = Boolean(quiz.myAttempts.inProgress);
  const isEnded = availability === 'ended' || quiz.startReason === 'ended';
  const disabled = !quiz.canStart;

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-subtle">
            {quiz.courseTitle ?? 'Course'}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink">
            {quiz.title}
          </h3>
        </div>
        {hasInProgress ? (
          <AttemptStatusBadge status="in_progress" />
        ) : quiz.myAttempts.bestPercentage != null ? (
          <PassFailBadge passed={quiz.myAttempts.bestPassed} />
        ) : null}
      </div>

      {quiz.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{quiz.description}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-ink-muted">
          <HelpCircle className="size-3.5 text-ink-subtle" aria-hidden />
          <span>{quiz.questionCount} questions</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Target className="size-3.5 text-ink-subtle" aria-hidden />
          <span>{quiz.totalMarks} marks</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Clock className="size-3.5 text-ink-subtle" aria-hidden />
          <span>{formatDuration(quiz.timeLimitSeconds)}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <ListChecks className="size-3.5 text-ink-subtle" aria-hidden />
          <span>
            {quiz.unlimitedAttempts
              ? 'Unlimited attempts'
              : `${quiz.maximumAttempts} attempt${quiz.maximumAttempts === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-subtle">
        <span>Pass: {quiz.passingPercentage}%</span>
        {quiz.availability?.enabled && quiz.availability.endsAt ? (
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3" aria-hidden />
            Ends {formatDateTime(quiz.availability.endsAt)}
          </span>
        ) : null}
        {quiz.myAttempts.total > 0 ? (
          <span>
            {quiz.myAttempts.completed} completed
            {quiz.myAttempts.bestPercentage != null
              ? ` · best ${quiz.myAttempts.bestPercentage}%`
              : ''}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-4">
        <span
          className={cn(
            'text-xs font-medium',
            disabled ? 'text-ink-subtle' : 'text-ink-muted'
          )}
        >
          {startReasonLabel(quiz.startReason)}
          {isEnded ? ' · closed' : ''}
        </span>
        <Link
          href={`/quizzes/${quiz.id}`}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all',
            disabled
              ? 'cursor-not-allowed bg-surface-2 text-ink-subtle'
              : 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop'
          )}
          aria-disabled={disabled}
        >
          {hasInProgress ? 'Resume' : 'View'}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
