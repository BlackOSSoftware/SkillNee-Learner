'use client';

import type { QuizAnswerPayload, QuizQuestionStudent } from '@/types/quizzes';
import { questionTypeLabel } from './quiz-display';
import { cn } from '@/lib/cn';

interface Props {
  question: QuizQuestionStudent;
  index: number;
  value: QuizAnswerPayload | undefined;
  onChange: (answer: QuizAnswerPayload) => void;
  disabled?: boolean;
}

function isSelected(value: QuizAnswerPayload | undefined, optionId: string): boolean {
  return Boolean(value?.selectedOptionIds?.includes(optionId));
}

export function QuestionRenderer({ question, index, value, onChange, disabled }: Props) {
  const q = question;

  const toggleOption = (optionId: string, multi: boolean) => {
    if (disabled) return;
    if (multi) {
      const current = value?.selectedOptionIds ?? [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      onChange({ selectedOptionIds: next });
    } else {
      onChange({ selectedOptionIds: [optionId] });
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {index + 1}
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
              {questionTypeLabel(q.questionType)}
              {q.isRequired ? ' · Required' : ''}
            </p>
            <h3 className="mt-1 whitespace-pre-wrap text-base font-medium leading-7 text-ink">
              {q.questionText}
            </h3>
            {q.description ? (
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">{q.description}</p>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-muted">
          {q.marks} mark{q.marks === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-5">
        {(q.questionType === 'multiple_choice' || q.questionType === 'multiple_select') && (
          <div className="space-y-2.5">
            {q.questionType === 'multiple_select' ? (
              <p className="text-xs text-ink-subtle">Select all that apply.</p>
            ) : null}
            {q.options.map((opt) => {
              const selected = isSelected(value, opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleOption(opt.id, q.questionType === 'multiple_select')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                    selected
                      ? 'border-primary bg-primary/5 text-ink'
                      : 'border-line bg-surface text-ink-muted hover:border-primary/40 hover:bg-surface-2',
                    disabled && 'cursor-not-allowed opacity-70'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center border',
                      q.questionType === 'multiple_select' ? 'rounded-md' : 'rounded-full',
                      selected ? 'border-primary bg-primary text-primary-fg' : 'border-line bg-surface'
                    )}
                  >
                    {selected ? (
                      q.questionType === 'multiple_select' ? (
                        <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
                          <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="size-2 rounded-full bg-primary-fg" />
                      )
                    ) : null}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.questionType === 'true_false' && (
          <div className="flex gap-3">
            {[true, false].map((bool) => {
              const selected = value?.booleanAnswer === bool;
              return (
                <button
                  key={String(bool)}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ booleanAnswer: bool })}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                    selected
                      ? 'border-primary bg-primary/5 text-ink'
                      : 'border-line bg-surface text-ink-muted hover:border-primary/40 hover:bg-surface-2',
                    disabled && 'cursor-not-allowed opacity-70'
                  )}
                >
                  {bool ? 'True' : 'False'}
                </button>
              );
            })}
          </div>
        )}

        {q.questionType === 'short_answer' && (
          <input
            type="text"
            value={value?.text ?? ''}
            disabled={disabled}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Type your answer…"
            className="h-11 w-full rounded-xl border border-field-border bg-field px-4 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
          />
        )}

        {q.questionType === 'long_answer' && (
          <textarea
            value={value?.text ?? ''}
            disabled={disabled}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Write your answer…"
            rows={6}
            className="w-full rounded-xl border border-field-border bg-field px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
          />
        )}

        {q.questionType === 'fill_in_the_blanks' && (
          <div className="space-y-3">
            {q.blanks.map((blank, bi) => {
              const current = value?.blankAnswers?.find((b) => b.blankId === blank.id)?.value ?? '';
              return (
                <div key={blank.id} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-ink-muted">
                    {bi + 1}
                  </span>
                  <input
                    type="text"
                    value={current}
                    disabled={disabled}
                    onChange={(e) => {
                      const existing = value?.blankAnswers ?? [];
                      const next = existing.filter((b) => b.blankId !== blank.id);
                      next.push({ blankId: blank.id, value: e.target.value });
                      onChange({ blankAnswers: next });
                    }}
                    placeholder={`Blank ${bi + 1}`}
                    className="h-10 flex-1 rounded-xl border border-field-border bg-field px-4 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
