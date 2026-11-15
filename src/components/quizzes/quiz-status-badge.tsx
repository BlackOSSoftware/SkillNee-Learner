'use client';

import type { AttemptStatus } from '@/types/quizzes';
import { attemptStatusLabel } from './quiz-display';
import { cn } from '@/lib/cn';

const STATUS_STYLES: Record<AttemptStatus, string> = {
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  submitted: 'bg-sky-50 text-sky-700 border-sky-200',
  evaluating: 'bg-violet-50 text-violet-700 border-violet-200',
  evaluated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function AttemptStatusBadge({ status }: { status: AttemptStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        STATUS_STYLES[status]
      )}
    >
      {attemptStatusLabel(status)}
    </span>
  );
}

export function PassFailBadge({ passed }: { passed: boolean | null | undefined }) {
  if (passed == null) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        passed
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      )}
    >
      {passed ? 'Passed' : 'Failed'}
    </span>
  );
}
