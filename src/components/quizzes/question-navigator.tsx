'use client';

import type { QuizQuestionStudent } from '@/types/quizzes';
import { cn } from '@/lib/cn';

interface Props {
  questions: QuizQuestionStudent[];
  currentIndex: number;
  answers: Record<string, unknown>;
  marked: Set<string>;
  onSelect: (index: number) => void;
}

function statusFor(
  q: QuizQuestionStudent,
  answers: Record<string, unknown>,
  marked: Set<string>
): 'answered' | 'unanswered' | 'marked' {
  const ans = answers[q.id] as
    | { selectedOptionIds?: string[]; booleanAnswer?: boolean; text?: string; blankAnswers?: { value: string }[] }
    | undefined;
  let answered = false;
  if (ans) {
    if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) answered = true;
    else if (typeof ans.booleanAnswer === 'boolean') answered = true;
    else if (typeof ans.text === 'string' && ans.text.trim().length > 0) answered = true;
    else if (ans.blankAnswers && ans.blankAnswers.some((b) => b.value.trim().length > 0)) answered = true;
  }
  if (marked.has(q.id)) return 'marked';
  return answered ? 'answered' : 'unanswered';
}

export function QuestionNavigator({ questions, currentIndex, answers, marked, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
        Questions
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {questions.map((q, i) => {
          const status = statusFor(q, answers, marked);
          const active = i === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all',
                active
                  ? 'border-primary bg-primary text-primary-fg shadow-sm'
                  : status === 'answered'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                    : status === 'marked'
                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300'
                      : 'border-line bg-surface text-ink-muted hover:border-primary/40 hover:bg-surface-2'
              )}
              aria-label={`Question ${i + 1}, ${status}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5 text-[11px] text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded border border-emerald-200 bg-emerald-50" /> Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded border border-line bg-surface" /> Unanswered
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded border border-amber-200 bg-amber-50" /> Marked for review
        </div>
      </div>
    </div>
  );
}
